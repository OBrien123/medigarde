from django.contrib import admin
from medigarde_app.models import *


# =========================
# CLIENT
# =========================
class ClientAdmin(admin.ModelAdmin):

    list_display = (
        'nom',
        'prenom',
        'email',
        'telephone',
        'ville'
    )

    search_fields = (
        'nom',
        'prenom',
        'email'
    )


# =========================
# PHARMACIE
# =========================
class PharmacieAdmin(admin.ModelAdmin):

    list_display = (
        'nom',
        'prenom',
        'email',
        'telephone',
        'ninea',
        'statut'
    )

    list_filter = (
        'statut',
    )

    search_fields = (
        'nom',
        'prenom',
        'email',
        'ninea'
    )


# =========================
# ADMINISTRATEUR
# =========================
class AdministrateurAdmin(admin.ModelAdmin):

    list_display = (
        'nom',
        'prenom',
        'email'
    )


# =========================
# MEDICAMENT
# =========================
class MedicamentAdmin(admin.ModelAdmin):

    list_display = (
        'nom',
        'forme',
        'dosage'
    )

    search_fields = (
        'nom',
    )


# =========================
# STOCK
# =========================
class StockAdmin(admin.ModelAdmin):

    list_display = (
        'medicament',
        'pharmacie',
        'quantite',
        'prix',
        'seuil_alerte'
    )


# =========================
# ALERTE
# =========================
class AlerteAdmin(admin.ModelAdmin):

    list_display = (
        'client',
        'medicament',
        'actif',
        'date_creation'
    )


# =========================
# COMMENTAIRE
# =========================
class CommentaireAdmin(admin.ModelAdmin):

    list_display = (
        'client',
        'pharmacie',
        'note',
        'date'
    )


# =========================
# DISCUSSION
# =========================
class DiscussionAdmin(admin.ModelAdmin):

    list_display = (
        'client',
        'pharmacie'
    )


# =========================
# NOTIFICATION
# =========================
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        'titre',
        'client',
        'date',
        'lu'
    )


# =========================
# HISTORIQUE RECHERCHE
# =========================
class HistoriqueRechercheAdmin(admin.ModelAdmin):

    list_display = (
        'client',
        'medicament_recherche',
        'date'
    )


# =========================
# ENREGISTREMENT
# =========================
admin.site.register(Client, ClientAdmin)

admin.site.register(Pharmacie, PharmacieAdmin)

admin.site.register(Administrateur, AdministrateurAdmin)

admin.site.register(Medicament, MedicamentAdmin)

admin.site.register(Stock, StockAdmin)

admin.site.register(Alerte, AlerteAdmin)

admin.site.register(Commentaire, CommentaireAdmin)

admin.site.register(Discussion, DiscussionAdmin)

admin.site.register(Notification, NotificationAdmin)

admin.site.register(HistoriqueRecherche, HistoriqueRechercheAdmin)