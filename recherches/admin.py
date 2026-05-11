from django.contrib import admin
from .models import HistoriqueRecherche


@admin.register(HistoriqueRecherche)
class HistoriqueRechercheAdmin(admin.ModelAdmin):
    list_display = ('medicament_recherche', 'user', 'date', 'nombre_resultats')
    list_filter = ('date',)
    search_fields = ('medicament_recherche',)
