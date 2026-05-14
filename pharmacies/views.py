import math
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsAdmin, IsPharmacieUser, IsAdminOrReadOnly, IsOwnerOrAdmin
from .models import Pharmacie, Commentaire, Discussion, Message
from .serializers import (
    PharmacieSerializer, PharmacieListSerializer, PharmacieUpdateSerializer,
    CommentaireSerializer, DiscussionSerializer, MessageSerializer,
)


def haversine(lat1, lon1, lat2, lon2):
    """Distance en mètres entre deux points GPS (formule de Haversine)."""
    R = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class PharmacieViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom', 'ville', 'adresse']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'admin':
            return Pharmacie.objects.prefetch_related('horaires').all()
        return Pharmacie.objects.prefetch_related('horaires').filter(statut='valide')

    def get_serializer_class(self):
        if self.action == 'list':
            return PharmacieListSerializer
        if self.action in ('update', 'partial_update'):
            return PharmacieUpdateSerializer
        return PharmacieSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'nearest'):
            return [permissions.AllowAny()]
        if self.action in ('update', 'partial_update'):
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        if self.action in ('valider', 'suspendre'):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated(), IsAdmin()]

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def nearest(self, request):
        """
        GET /api/pharmacies/nearest/?lat=14.72&lng=-17.45&med_id=3&rayon=10000
        Retourne les pharmacies ayant le médicament en stock, triées par distance.
        """
        try:
            lat = float(request.query_params.get('lat'))
            lng = float(request.query_params.get('lng'))
        except (TypeError, ValueError):
            return Response({'detail': 'Paramètres lat et lng requis.'}, status=status.HTTP_400_BAD_REQUEST)

        med_id = request.query_params.get('med_id')
        rayon = float(request.query_params.get('rayon', 10_000))  # 10 km par défaut

        qs = Pharmacie.objects.filter(statut='valide')
        if med_id:
            qs = qs.filter(stocks__medicament_id=med_id, stocks__disponible=True)

        results = []
        for pharmacie in qs:
            distance = haversine(lat, lng, float(pharmacie.latitude), float(pharmacie.longitude))
            if distance <= rayon:
                pharmacie.distance = round(distance)
                results.append(pharmacie)

        results.sort(key=lambda p: p.distance)
        serializer = PharmacieListSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdmin])
    def valider(self, request, pk=None):
        """POST /api/pharmacies/{id}/valider/ — active une pharmacie en attente."""
        pharmacie = self.get_object()
        pharmacie.statut = 'valide'
        pharmacie.save()
        return Response(PharmacieSerializer(pharmacie).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdmin])
    def suspendre(self, request, pk=None):
        """POST /api/pharmacies/{id}/suspendre/ — suspend une pharmacie."""
        pharmacie = self.get_object()
        pharmacie.statut = 'suspendu'
        pharmacie.save()
        return Response(PharmacieSerializer(pharmacie).data)


class CommentaireViewSet(viewsets.ModelViewSet):
    serializer_class = CommentaireSerializer

    def get_queryset(self):
        return Commentaire.objects.filter(pharmacie_id=self.kwargs['pharmacie_pk'])

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        pharmacie = Pharmacie.objects.get(pk=self.kwargs['pharmacie_pk'])
        serializer.save(client=self.request.user.client_profile, pharmacie=pharmacie)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsPharmacieUser])
    def repondre(self, request, pk=None, pharmacie_pk=None):
        """Permet à la pharmacie de répondre à un commentaire."""
        from django.utils import timezone
        commentaire = self.get_object()
        commentaire.reponse = request.data.get('reponse', '')
        commentaire.date_reponse = timezone.now()
        commentaire.save()
        return Response(CommentaireSerializer(commentaire).data)


class DiscussionViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return Discussion.objects.filter(client__user=user).prefetch_related('messages')
        if user.role == 'pharmacie':
            return Discussion.objects.filter(pharmacie__user=user).prefetch_related('messages')
        return Discussion.objects.prefetch_related('messages').all()

    def perform_create(self, serializer):
        pharmacie_id = self.request.data.get('pharmacie_id')
        pharmacie = Pharmacie.objects.get(pk=pharmacie_id)
        serializer.save(client=self.request.user.client_profile, pharmacie=pharmacie)

    @action(detail=True, methods=['post'])
    def envoyer_message(self, request, pk=None):
        discussion = self.get_object()
        serializer = MessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(discussion=discussion, expediteur=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
