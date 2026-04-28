from django.contrib import admin
from .models import BusinessProfile, KYCDocument

# Register your models here.
admin.site.register(BusinessProfile)
admin.site.register(KYCDocument)