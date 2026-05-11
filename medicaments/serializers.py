from rest_framework import serializers
from .models import Categorie, Medicament


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ('id', 'nom', 'description')


class MedicamentSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    forme_display = serializers.CharField(source='get_forme_display', read_only=True)

    class Meta:
        model = Medicament
        fields = ('id', 'nom_generique', 'nom_commercial', 'forme', 'forme_display',
                  'dosage', 'description', 'fabricant', 'prescription',
                  'categorie', 'categorie_nom')


class MedicamentListSerializer(serializers.ModelSerializer):
    """Version allégée pour les listes."""
    forme_display = serializers.CharField(source='get_forme_display', read_only=True)

    class Meta:
        model = Medicament
        fields = ('id', 'nom_generique', 'nom_commercial', 'forme_display', 'dosage', 'prescription')
