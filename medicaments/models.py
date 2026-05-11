from django.db import models


class Categorie(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'categorie'

    def __str__(self):
        return self.nom


class Medicament(models.Model):
    FORME_CHOICES = [
        ('comprime', 'Comprimé'),
        ('sirop', 'Sirop'),
        ('gelule', 'Gélule'),
        ('injectable', 'Injectable'),
        ('pommade', 'Pommade'),
        ('suppositoire', 'Suppositoire'),
        ('collyre', 'Collyre'),
    ]

    nom_generique = models.CharField(max_length=150)
    nom_commercial = models.CharField(max_length=150, blank=True)
    forme = models.CharField(max_length=20, choices=FORME_CHOICES)
    dosage = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    fabricant = models.CharField(max_length=150, blank=True)
    prescription = models.BooleanField(default=False)
    categorie = models.ForeignKey(
        Categorie, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='medicaments'
    )

    class Meta:
        db_table = 'medicament'
        # Règle métier CdC : identifié par (nom_generique + dosage + forme)
        unique_together = [['nom_generique', 'dosage', 'forme']]

    def __str__(self):
        return f"{self.nom_generique} {self.dosage} ({self.get_forme_display()})"
