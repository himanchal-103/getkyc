from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # DRF browsable UI login / logout buttons
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    path("account/auth/", include("account.urls")),
    path('kyc/', include('kyc.urls')),
    path('api/', include('reviewer.urls')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
