from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Authentification JWT ───────────────────────────────────────────────
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # ── Routes des apps (à brancher au fur et à mesure) ───────────────────
    path('api/accounts/', include('accounts.urls')),
    path('api/pharmacies/', include('pharmacies.urls')),
    path('api/medicaments/', include('medicaments.urls')),
    path('api/stocks/', include('stocks.urls')),
    path('api/recherches/', include('recherches.urls')),
    path('api/notifications/', include('notifications.urls')),
]
