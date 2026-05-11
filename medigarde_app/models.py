from django.db import models


# =========================
# TABLE MERE
# =========================
class Utilisateur(models.Model):

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)

    email = models.EmailField(unique=True)

    telephone = models.CharField(max_length=20)

    mot_de_passe = models.CharField(max_length=255)

    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'utilisateur'

    def __str__(self):
        return f"{self.nom} {self.prenom}"


# =========================
# CLIENT
# =========================
class Client(Utilisateur):

    adresse = models.CharField(max_length=200)

    ville = models.CharField(max_length=100)

    code_postal = models.CharField(max_length=10)

    position_client = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'client'


# =========================
# PHARMACIE
# =========================
class Pharmacie(Utilisateur):

    ninea = models.CharField(
        max_length=50,
        unique=True
    )

    licence = models.CharField(max_length=50)

    statut = models.CharField(
        max_length=20,
        default='en_attente',
        choices=[
            ('en_attente', 'En attente'),
            ('valide', 'Valide'),
            ('suspendu', 'Suspendu')
        ]
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7
    )

    heure_ouverture = models.TimeField()

    heure_fermeture = models.TimeField()

    nombre_avis = models.IntegerField(default=0)

    class Meta:
        db_table = 'pharmacie'


# =========================
# ADMINISTRATEUR
# =========================
class Administrateur(Utilisateur):

    class Meta:
        db_table = 'administrateur'


# =========================
# MEDICAMENT
# =========================
class Medicament(models.Model):

    nom = models.CharField(max_length=150)

    forme = models.CharField(
        max_length=50,
        choices=[
            ('comprimé', 'Comprimé'),
            ('sirop', 'Sirop'),
            ('gélule', 'Gélule'),
            ('injectable', 'Injectable')
        ]
    )

    dosage = models.CharField(max_length=50)

    description = models.TextField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'medicament'

    def __str__(self):
        return self.nom


# =========================
# STOCK
# =========================
class Stock(models.Model):

    quantite = models.IntegerField()

    prix = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    date_mise_a_jour = models.DateTimeField(auto_now=True)

    seuil_alerte = models.IntegerField(default=10)

    medicament = models.ForeignKey(
        Medicament,
        on_delete=models.CASCADE
    )

    pharmacie = models.ForeignKey(
        Pharmacie,
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'stock'

        unique_together = [['medicament', 'pharmacie']]

    def __str__(self):
        return f"{self.medicament.nom} - {self.pharmacie.nom}"


# =========================
# ALERTE
# =========================
class Alerte(models.Model):

    date_creation = models.DateTimeField(auto_now_add=True)

    actif = models.BooleanField(default=True)

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE
    )

    medicament = models.ForeignKey(
        Medicament,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"Alerte {self.client.nom}"


# =========================
# COMMENTAIRE
# =========================
class Commentaire(models.Model):

    texte = models.TextField()

    note = models.IntegerField()

    date = models.DateTimeField(auto_now_add=True)

    reponse = models.TextField(
        null=True,
        blank=True
    )

    date_reponse = models.DateTimeField(
        null=True,
        blank=True
    )

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE
    )

    pharmacie = models.ForeignKey(
        Pharmacie,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"Commentaire {self.client.nom}"


# =========================
# DISCUSSION
# =========================
class Discussion(models.Model):

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE
    )

    pharmacie = models.ForeignKey(
        Pharmacie,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.client.nom} - {self.pharmacie.nom}"


# =========================
# NOTIFICATION
# =========================
class Notification(models.Model):

    titre = models.CharField(max_length=150)

    message = models.TextField()

    date = models.DateTimeField(auto_now_add=True)

    lu = models.BooleanField(default=False)

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.titre


# =========================
# HISTORIQUE RECHERCHE
# =========================
class HistoriqueRecherche(models.Model):

    medicament_recherche = models.CharField(max_length=150)

    date = models.DateTimeField(auto_now_add=True)

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.medicament_recherche