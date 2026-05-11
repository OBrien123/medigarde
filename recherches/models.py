from django.db import models
from accounts.models import User


class HistoriqueRecherche(models.Model):
    medicament_recherche = models.CharField(max_length=150)
    date = models.DateTimeField(auto_now_add=True)
    nombre_resultats = models.IntegerField(default=0)
    # Nullable : les visiteurs non connectés peuvent aussi générer une recherche
    user = models.ForeignKey(
        User, on_delete=models.CASCADE,
        null=True, blank=True, related_name='recherches'
    )

    class Meta:
        db_table = 'historique_recherche'
        ordering = ['-date']

    def __str__(self):
        return f"Recherche '{self.medicament_recherche}' le {self.date:%d/%m/%Y}"
