from django.db import models
from pharmacies.models import Pharmacie
from medicaments.models import Medicament


class Stock(models.Model):
    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE, related_name='stocks')
    medicament = models.ForeignKey(Medicament, on_delete=models.CASCADE, related_name='stocks')
    quantite = models.IntegerField(default=0)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    date_mise_a_jour = models.DateTimeField(auto_now=True)
    seuil_alerte = models.IntegerField(default=10)
    # Mis à jour automatiquement via save()
    disponible = models.BooleanField(default=False)

    class Meta:
        db_table = 'stock'
        # Règle métier : une pharmacie ne peut avoir qu'un stock par médicament
        unique_together = [['pharmacie', 'medicament']]

    def save(self, *args, **kwargs):
        self.disponible = self.quantite > 0
        super().save(*args, **kwargs)

    def est_stock_faible(self):
        return 0 < self.quantite <= self.seuil_alerte

    def __str__(self):
        return f"{self.medicament} @ {self.pharmacie} — {self.quantite} unité(s)"
