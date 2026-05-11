from django.db import models
from accounts.models import User, Client


class Pharmacie(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('valide', 'Validé'),
        ('suspendu', 'Suspendu'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE,
        primary_key=True, related_name='pharmacie_profile'
    )
    nom = models.CharField(max_length=150)
    adresse = models.CharField(max_length=200)
    ville = models.CharField(max_length=100)
    ninea = models.CharField(max_length=50, unique=True)
    licence = models.CharField(max_length=50)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    nombre_avis = models.IntegerField(default=0)

    class Meta:
        db_table = 'pharmacie'

    def __str__(self):
        return self.nom


class Horaire(models.Model):
    JOURS_CHOICES = [
        ('lundi', 'Lundi'),
        ('mardi', 'Mardi'),
        ('mercredi', 'Mercredi'),
        ('jeudi', 'Jeudi'),
        ('vendredi', 'Vendredi'),
        ('samedi', 'Samedi'),
        ('dimanche', 'Dimanche'),
    ]

    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE, related_name='horaires')
    jour = models.CharField(max_length=10, choices=JOURS_CHOICES)
    ouverture = models.TimeField(null=True, blank=True)
    fermeture = models.TimeField(null=True, blank=True)
    ferme = models.BooleanField(default=False)

    class Meta:
        db_table = 'horaire'
        unique_together = [['pharmacie', 'jour']]

    def __str__(self):
        return f"{self.pharmacie.nom} — {self.jour}"


class Commentaire(models.Model):
    texte = models.TextField()
    note = models.IntegerField()  # 1 à 5
    date = models.DateTimeField(auto_now_add=True)
    reponse = models.TextField(null=True, blank=True)
    date_reponse = models.DateTimeField(null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='commentaires')
    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE, related_name='commentaires')

    class Meta:
        db_table = 'commentaire'

    def __str__(self):
        return f"Commentaire de {self.client} sur {self.pharmacie}"


class Discussion(models.Model):
    STATUT_CHOICES = [
        ('ouverte', 'Ouverte'),
        ('fermee', 'Fermée'),
    ]

    titre = models.CharField(max_length=200)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_dernier_message = models.DateTimeField(auto_now=True)
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='ouverte')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='discussions')
    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE, related_name='discussions')

    class Meta:
        db_table = 'discussion'

    def __str__(self):
        return self.titre


class Message(models.Model):
    contenu = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField(default=False)
    date_lecture = models.DateTimeField(null=True, blank=True)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='messages')
    # L'expéditeur peut être le client ou la pharmacie (User générique)
    expediteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_envoyes')

    class Meta:
        db_table = 'message'
        ordering = ['date_envoi']

    def __str__(self):
        return f"Message de {self.expediteur} dans '{self.discussion}'"
