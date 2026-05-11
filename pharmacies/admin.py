from django.contrib import admin
from .models import Pharmacie, Horaire, Commentaire, Discussion, Message


@admin.register(Pharmacie)
class PharmacieAdmin(admin.ModelAdmin):
    list_display = ('nom', 'ville', 'statut', 'rating', 'nombre_avis')
    list_filter = ('statut', 'ville')
    search_fields = ('nom', 'ville', 'ninea')
    actions = ['valider', 'suspendre']

    @admin.action(description='Valider les pharmacies sélectionnées')
    def valider(self, request, queryset):
        queryset.update(statut='valide')

    @admin.action(description='Suspendre les pharmacies sélectionnées')
    def suspendre(self, request, queryset):
        queryset.update(statut='suspendu')


@admin.register(Horaire)
class HoraireAdmin(admin.ModelAdmin):
    list_display = ('pharmacie', 'jour', 'ouverture', 'fermeture', 'ferme')
    list_filter = ('jour', 'ferme')


@admin.register(Commentaire)
class CommentaireAdmin(admin.ModelAdmin):
    list_display = ('client', 'pharmacie', 'note', 'date')
    list_filter = ('note',)


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ('titre', 'client', 'pharmacie', 'statut', 'date_creation')
    list_filter = ('statut',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('discussion', 'expediteur', 'date_envoi', 'lu')
    list_filter = ('lu',)
