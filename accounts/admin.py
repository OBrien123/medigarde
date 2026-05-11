from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Client, Administrateur


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Infos supplémentaires', {'fields': ('role', 'telephone')}),
    )


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('user', 'ville', 'code_postal')
    search_fields = ('user__email', 'user__first_name', 'ville')


@admin.register(Administrateur)
class AdministrateurAdmin(admin.ModelAdmin):
    list_display = ('user',)
