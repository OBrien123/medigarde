from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, AlerteViewSet

router = DefaultRouter()
router.register('', NotificationViewSet, basename='notification')
router.register('alertes', AlerteViewSet, basename='alerte')

urlpatterns = [path('', include(router.urls))]
