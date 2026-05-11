from django.contrib import admin
from .models import Categorie, Medicament


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom',)
    search_fields = ('nom',)


@admin.register(Medicament)
class MedicamentAdmin(admin.ModelAdmin):
    list_display = ('nom_generique', 'nom_commercial', 'forme', 'dosage', 'prescription', 'categorie')
    list_filter = ('forme', 'prescription', 'categorie')
    search_fields = ('nom_generique', 'nom_commercial')
