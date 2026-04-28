from django.contrib import admin
from .models import KYCSubmission, NotificationEvent

# Register your models here.
admin.site.register(KYCSubmission)
admin.site.register(NotificationEvent)