from rest_framework import serializers
from .models import HistoriqueRecherche


class HistoriqueRechercheSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueRecherche
        fields = ('id', 'medicament_recherche', 'date', 'nombre_resultats')
        read_only_fields = ('date',)
