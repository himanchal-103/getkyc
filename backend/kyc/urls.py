from django.urls import path
from .views import BusinessProfileViewSet, KYCDocumentViewSet


business_list = BusinessProfileViewSet.as_view({
    "get": "list",
})

business_create = BusinessProfileViewSet.as_view({
    "post": "create",
})

business_details = BusinessProfileViewSet.as_view({
    "get": "retrieve",
    "delete": "destroy",
})

document_list = KYCDocumentViewSet.as_view({
    "get": "list"
})

document_upload = KYCDocumentViewSet.as_view({
    "post": "create"
})

document_details = KYCDocumentViewSet.as_view({
    "get": "retrieve",
    # "patch": "partial_update", 
    "delete": "destroy",
})


urlpatterns = [
    # business profile
    path('list/all/', business_list, name='business-list'),
    path('create/', business_create, name='business-create'),
    path('retrieve/<int:pk>/', business_details, name='business-retrieve'),
    path('destroy/<int:pk>/', business_details, name='business-destroy'),

    # document uploads
    path("documents/", document_list, name="document-list"),
    path("documents/upload/", document_upload, name="document-upload"),
    path("documents/<int:pk>/", document_details, name="document-details"),
]
