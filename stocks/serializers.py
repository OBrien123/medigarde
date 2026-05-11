from rest_framework import serializers
from .models import Stock
from medicaments.serializers import MedicamentListSerializer


class StockSerializer(serializers.ModelSerializer):
    medicament_detail = MedicamentListSerializer(source='medicament', read_only=True)
    est_stock_faible = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = ('id', 'medicament', 'medicament_detail', 'quantite', 'prix',
                  'seuil_alerte', 'disponible', 'date_mise_a_jour', 'est_stock_faible')
        read_only_fields = ('disponible', 'date_mise_a_jour')

    def get_est_stock_faible(self, obj):
        return obj.est_stock_faible()


class StockCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ('medicament', 'quantite', 'prix', 'seuil_alerte')
