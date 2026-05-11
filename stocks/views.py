from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from accounts.permissions import IsPharmacieUser
from .models import Stock
from .serializers import StockSerializer, StockCreateSerializer


class StockViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsPharmacieUser]

    def get_queryset(self):
        return (Stock.objects
                .filter(pharmacie__user=self.request.user)
                .select_related('medicament', 'medicament__categorie'))

    def get_serializer_class(self):
        if self.action == 'create':
            return StockCreateSerializer
        return StockSerializer

    def perform_create(self, serializer):
        pharmacie = self.request.user.pharmacie_profile
        serializer.save(pharmacie=pharmacie)

    def perform_update(self, serializer):
        instance = serializer.save()
        # Déclencher les alertes si le médicament redevient disponible
        if instance.disponible:
            self._notifier_alertes(instance)

    def _notifier_alertes(self, stock):
        from notifications.models import Alerte, Notification
        from django.utils import timezone
        alertes = Alerte.objects.filter(
            medicament=stock.medicament, actif=True
        ).select_related('client__user')
        for alerte in alertes:
            Notification.objects.create(
                user=alerte.client.user,
                titre=f"{stock.medicament.nom_generique} disponible",
                message=(
                    f"{stock.medicament.nom_generique} {stock.medicament.dosage} "
                    f"est maintenant disponible à {stock.pharmacie.nom}."
                ),
                type='disponibilite',
            )
            alerte.actif = False
            alerte.date_notification = timezone.now()
            alerte.save()
