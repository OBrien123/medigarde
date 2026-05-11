from rest_framework import viewsets, filters, permissions
from .models import Categorie, Medicament
from .serializers import CategorieSerializer, MedicamentSerializer, MedicamentListSerializer
from accounts.permissions import IsAdminOrReadOnly


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all().order_by('nom')
    serializer_class = CategorieSerializer
    permission_classes = [IsAdminOrReadOnly]


class MedicamentViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.select_related('categorie').order_by('nom_generique')
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_generique', 'nom_commercial', 'dosage']

    def get_serializer_class(self):
        if self.action == 'list':
            return MedicamentListSerializer
        return MedicamentSerializer
