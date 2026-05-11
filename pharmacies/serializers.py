from rest_framework import serializers
from .models import Pharmacie, Horaire, Commentaire, Discussion, Message


class HoraireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horaire
        fields = ('id', 'jour', 'ouverture', 'fermeture', 'ferme')


class PharmacieListSerializer(serializers.ModelSerializer):
    """Version allégée pour les listes et résultats de recherche."""
    distance = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Pharmacie
        fields = ('user_id', 'nom', 'adresse', 'ville', 'latitude', 'longitude',
                  'statut', 'rating', 'nombre_avis', 'telephone', 'distance')


class PharmacieSerializer(serializers.ModelSerializer):
    horaires = HoraireSerializer(many=True, read_only=True)

    class Meta:
        model = Pharmacie
        fields = ('user_id', 'nom', 'adresse', 'ville', 'ninea', 'licence',
                  'statut', 'latitude', 'longitude', 'telephone', 'email',
                  'rating', 'nombre_avis', 'horaires')
        read_only_fields = ('statut', 'rating', 'nombre_avis')


class PharmacieUpdateSerializer(serializers.ModelSerializer):
    """Pour que la pharmacie mette à jour ses propres infos."""
    horaires = HoraireSerializer(many=True, required=False)

    class Meta:
        model = Pharmacie
        fields = ('nom', 'adresse', 'ville', 'telephone', 'email', 'horaires')

    def update(self, instance, validated_data):
        horaires_data = validated_data.pop('horaires', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if horaires_data is not None:
            instance.horaires.all().delete()
            for h in horaires_data:
                Horaire.objects.create(pharmacie=instance, **h)
        return instance


class CommentaireSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.user.get_full_name', read_only=True)

    class Meta:
        model = Commentaire
        fields = ('id', 'texte', 'note', 'date', 'reponse', 'date_reponse', 'client_nom')
        read_only_fields = ('date', 'reponse', 'date_reponse', 'client_nom')


class MessageSerializer(serializers.ModelSerializer):
    expediteur_nom = serializers.CharField(source='expediteur.get_full_name', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'contenu', 'date_envoi', 'lu', 'expediteur_nom')
        read_only_fields = ('date_envoi', 'expediteur_nom')


class DiscussionSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    pharmacie_nom = serializers.CharField(source='pharmacie.nom', read_only=True)

    class Meta:
        model = Discussion
        fields = ('id', 'titre', 'date_creation', 'statut', 'pharmacie_nom', 'messages')
        read_only_fields = ('date_creation', 'statut')
