from django.contrib import admin
from .models import Notification, Alerte


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('titre', 'user', 'type', 'date', 'lu')
    list_filter = ('type', 'lu')
    search_fields = ('titre', 'user__email')


@admin.register(Alerte)
class AlerteAdmin(admin.ModelAdmin):
    list_display = ('client', 'medicament', 'pharmacie', 'actif', 'date_creation')
    list_filter = ('actif',)
    search_fields = ('medicament__nom_generique', 'client__user__email')
