from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('client', 'Client'),
        ('pharmacie', 'Pharmacie'),
        ('admin', 'Administrateur'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    telephone = models.CharField(max_length=20, blank=True)

    # On utilise l'email comme identifiant de connexion
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'user'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class Client(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE,
        primary_key=True, related_name='client_profile'
    )
    adresse = models.CharField(max_length=200, blank=True)
    ville = models.CharField(max_length=100, blank=True)
    code_postal = models.CharField(max_length=10, blank=True)
    # Position GPS du client (renseignée lors de la recherche)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    class Meta:
        db_table = 'client'

    def __str__(self):
        return str(self.user)


class Administrateur(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE,
        primary_key=True, related_name='admin_profile'
    )

    class Meta:
        db_table = 'administrateur'

    def __str__(self):
        return str(self.user)
