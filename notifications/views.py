from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsClientUser
from .models import Notification, Alerte
from .serializers import NotificationSerializer, AlerteSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def marquer_lu(self, request, pk=None):
        notif = self.get_object()
        notif.lu = True
        notif.save()
        return Response({'status': 'lu'})

    @action(detail=False, methods=['patch'])
    def tout_marquer_lu(self, request):
        self.get_queryset().update(lu=True)
        return Response({'status': 'toutes lues'})


class AlerteViewSet(viewsets.ModelViewSet):
    serializer_class = AlerteSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def get_queryset(self):
        return Alerte.objects.filter(client__user=self.request.user).select_related('medicament')

    def perform_create(self, serializer):
        serializer.save(client=self.request.user.client_profile)
