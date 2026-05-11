from django.db import models
from accounts.models import User, Client
from medicaments.models import Medicament
from pharmacies.models import Pharmacie


class Notification(models.Model):
    TYPE_CHOICES = [
        ('disponibilite', 'Médicament disponible'),
        ('stock_faible', 'Stock faible'),
        ('validation', 'Validation pharmacie'),
        ('message', 'Nouveau message'),
    ]

    titre = models.CharField(max_length=150)
    message = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField(default=False)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='disponibilite')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')

    class Meta:
        db_table = 'notification'
        ordering = ['-date']

    def __str__(self):
        return f"{self.titre} — {self.user}"


class Alerte(models.Model):
    date_creation = models.DateTimeField(auto_now_add=True)
    actif = models.BooleanField(default=True)
    rayon = models.IntegerField(default=5000)  # rayon de recherche en mètres
    date_notification = models.DateTimeField(null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='alertes')
    medicament = models.ForeignKey(Medicament, on_delete=models.CASCADE, related_name='alertes')
    # Pharmacie optionnelle : alerte globale ou ciblée
    pharmacie = models.ForeignKey(
        Pharmacie, on_delete=models.CASCADE,
        null=True, blank=True, related_name='alertes'
    )

    class Meta:
        db_table = 'alerte'

    def __str__(self):
        return f"Alerte {self.client} — {self.medicament}"
