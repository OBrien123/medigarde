from rest_framework import serializers
from .models import Notification, Alerte


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'titre', 'message', 'date', 'lu', 'type')
        read_only_fields = ('date',)


class AlerteSerializer(serializers.ModelSerializer):
    medicament_nom = serializers.CharField(source='medicament.nom_generique', read_only=True)

    class Meta:
        model = Alerte
        fields = ('id', 'medicament', 'medicament_nom', 'pharmacie', 'rayon',
                  'actif', 'date_creation', 'date_notification')
        read_only_fields = ('actif', 'date_creation', 'date_notification')
