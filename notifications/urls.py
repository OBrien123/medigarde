from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, AlerteViewSet

router = DefaultRouter()
# alertes AVANT '' pour éviter que ^{pk}/$ n'intercepte 'alertes/'
router.register('alertes', AlerteViewSet, basename='alerte')
router.register('', NotificationViewSet, basename='notification')

urlpatterns = [path('', include(router.urls))]
