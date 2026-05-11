from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PharmacieViewSet, CommentaireViewSet, DiscussionViewSet

router = DefaultRouter()
router.register('', PharmacieViewSet, basename='pharmacie')

urlpatterns = [
    path('', include(router.urls)),
    # /api/pharmacies/{pharmacie_pk}/commentaires/
    path('<int:pharmacie_pk>/commentaires/', CommentaireViewSet.as_view({
        'get': 'list', 'post': 'create'
    }), name='pharmacie-commentaires'),
    path('<int:pharmacie_pk>/commentaires/<int:pk>/', CommentaireViewSet.as_view({
        'get': 'retrieve', 'delete': 'destroy'
    }), name='pharmacie-commentaire-detail'),
    path('<int:pharmacie_pk>/commentaires/<int:pk>/repondre/', CommentaireViewSet.as_view({
        'patch': 'repondre'
    }), name='pharmacie-commentaire-repondre'),
    # Discussions
    path('discussions/', DiscussionViewSet.as_view({'get': 'list', 'post': 'create'}), name='discussions-list'),
    path('discussions/<int:pk>/', DiscussionViewSet.as_view({'get': 'retrieve'}), name='discussions-detail'),
    path('discussions/<int:pk>/envoyer_message/', DiscussionViewSet.as_view({'post': 'envoyer_message'}), name='discussions-message'),
]
