from rest_framework import generics, permissions
from .models import HistoriqueRecherche
from .serializers import HistoriqueRechercheSerializer


class HistoriqueRechercheListView(generics.ListAPIView):
    serializer_class = HistoriqueRechercheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HistoriqueRecherche.objects.filter(user=self.request.user)
