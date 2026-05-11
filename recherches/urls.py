from django.urls import path
from .views import HistoriqueRechercheListView

urlpatterns = [
    path('history/', HistoriqueRechercheListView.as_view(), name='historique-recherche'),
]
