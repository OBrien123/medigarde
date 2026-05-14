from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User, Client, Administrateur


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'telephone', 'role', 'date_joined')
        read_only_fields = ('id', 'date_joined', 'role')


class RegisterClientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    adresse = serializers.CharField(required=False, allow_blank=True)
    ville = serializers.CharField(required=False, allow_blank=True)
    code_postal = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'telephone',
                  'adresse', 'ville', 'code_postal')

    def create(self, validated_data):
        adresse = validated_data.pop('adresse', '')
        ville = validated_data.pop('ville', '')
        code_postal = validated_data.pop('code_postal', '')
        validated_data['username'] = validated_data['email']
        validated_data['role'] = 'client'
        user = User.objects.create_user(**validated_data)
        Client.objects.create(user=user, adresse=adresse, ville=ville, code_postal=code_postal)
        return user


class RegisterPharmacieSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    nom = serializers.CharField()
    adresse = serializers.CharField()
    ville = serializers.CharField()
    ninea = serializers.CharField()
    licence = serializers.CharField()
    # Coordonnées optionnelles — l'admin peut les corriger après validation
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False, default=14.6937)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False, default=-17.4441)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'telephone',
                  'nom', 'adresse', 'ville', 'ninea', 'licence', 'latitude', 'longitude')

    def create(self, validated_data):
        pharmacie_fields = {
            k: validated_data.pop(k)
            for k in ('nom', 'adresse', 'ville', 'ninea', 'licence', 'latitude', 'longitude')
        }
        validated_data['username'] = validated_data['email']
        validated_data['role'] = 'pharmacie'
        user = User.objects.create_user(**validated_data)
        from pharmacies.models import Pharmacie
        Pharmacie.objects.create(user=user, **pharmacie_fields)
        return user


class ClientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Client
        fields = ('user', 'adresse', 'ville', 'code_postal', 'latitude', 'longitude')


class ClientUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    telephone = serializers.CharField(source='user.telephone')

    class Meta:
        model = Client
        fields = ('first_name', 'last_name', 'telephone', 'adresse', 'ville', 'code_postal')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
