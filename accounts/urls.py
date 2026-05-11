from django.urls import path
from .views import RegisterClientView, RegisterPharmacieView, MeView, ClientProfileView

urlpatterns = [
    path('register/client/', RegisterClientView.as_view(), name='register_client'),
    path('register/pharmacie/', RegisterPharmacieView.as_view(), name='register_pharmacie'),
    path('me/', MeView.as_view(), name='me'),
    path('me/client/', ClientProfileView.as_view(), name='client_profile'),
]
