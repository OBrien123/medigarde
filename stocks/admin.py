from django.contrib import admin
from .models import Stock


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('medicament', 'pharmacie', 'quantite', 'prix', 'disponible', 'date_mise_a_jour')
    list_filter = ('disponible',)
    search_fields = ('medicament__nom_generique', 'pharmacie__nom')
    readonly_fields = ('disponible', 'date_mise_a_jour')
