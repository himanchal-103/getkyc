import os
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import BusinessProfile, KYCDocument
from .serializers import BusinessProfileSerializer, KYCDocumentSerializer


# Create your views here.
class BusinessProfileViewSet(viewsets.ViewSet):
    """
    CRUD operations for business
    """
    queryset = BusinessProfile.objects.all()
    serializer_class = BusinessProfileSerializer

    def list(self, request):
        profiles = self.queryset
        serializer = self.serializer_class(profiles, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        try:
            profile = self.queryset.get(merchant=pk)
            serializer = self.serializer_class(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except BusinessProfile.DoesNotExist:
            return Response(
                {"error": "Business profile not found for merchant!"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request):
        # Check business profile exist or not
        if hasattr(request.user, "business_profile"):
            return Response(
                {"error": "Business profile already exists for this merchant."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(merchant=request.user)
            return Response(
                {
                    "message": "Business profile created successfully!",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            profile = self.queryset.get(merchant=pk)
            profile.delete()
            return Response(
                {"message": "Business profile deleted successfully!"},
                status=status.HTTP_200_OK
            )
        except BusinessProfile.DoesNotExist:
            return Response(
                {"error": "Business profile not found!"},
                status=status.HTTP_404_NOT_FOUND
            )
        

class KYCDocumentViewSet(viewsets.ViewSet):
    """
    Handles KYC document uploads for PAN, Aadhaar, and Bank Statement.
    All three must be uploaded. File is renamed to '{userid}-{doc_type}.{ext}'.
    """
    queryset = KYCDocument.objects.all()
    serializer_class = KYCDocumentSerializer

    def _rename_file(self, file, user_id, doc_type):
        """
        Rename file to {userid}-{doc_type}.{ext}
        """
        ext = os.path.splitext(file.name)[1].lower()
        file.name = f"{user_id}-{doc_type}{ext}"
        return file
    
    def _check_verified(self, doc):
        """
        Returns a response if document is verified, None otherwise.
        """
        if doc.status == KYCDocument.VerificationStatus.VERIFIED:
            return Response(
                {"error": "Verified documents cannot be modified or deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return None

    def list(self, request):
        docs = self.queryset.filter(merchant=request.user)
        serializer = self.serializer_class(docs, many=True)

        uploaded_types = list(docs.values_list("doc_type", flat=True))
        required_types = [choice[0] for choice in KYCDocument.DocumentType.choices]
        missing = [t for t in required_types if t not in uploaded_types]

        return Response({
            "documents": serializer.data,
            "missing_documents": missing,
            "all_uploaded": len(missing) == 0,
        })

    def retrieve(self, request, pk=None):
        try:
            doc = self.queryset.get(pk=pk, merchant=request.user)
            serializer = self.serializer_class(doc)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except KYCDocument.DoesNotExist:
            return Response(
                {"error": "Document not found!"},
                status=status.HTTP_404_NOT_FOUND
            )

    def create(self, request):
        doc_type = request.data.get("doc_type")
        existing = self.queryset.filter(merchant=request.user, doc_type=doc_type).first()

        # block if there is existing doc
        if existing:
            return Response(
                {"error": f"{doc_type} document already exists. Use update to replace it."},
                status=status.HTTP_400_BAD_REQUEST
            )

        file = request.FILES.get("file")
        if file:
            file = self._rename_file(file, request.user.id, doc_type)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(merchant=request.user, status=KYCDocument.VerificationStatus.PENDING)
            return Response(
                {
                    "message": f"{'Re-uploaded' if existing else 'Uploaded'} {doc_type} successfully!",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def partial_update(self, request, pk=None):
    #     try:
    #         doc = self.queryset.get(pk=pk, merchant=request.user)

    #         verified_check = self._check_verified(doc)
    #         if verified_check:
    #             return verified_check

    #         file = request.FILES.get("file")
    #         if file:
    #             # delete old file and rename new one
    #             if os.path.isfile(doc.file.path):
    #                 os.remove(doc.file.path)
    #             request.FILES["file"] = self._rename_file(file, request.user.id, doc.doc_type)

    #         serializer = self.serializer_class(doc, data=request.data, partial=True)
    #         if serializer.is_valid():
    #             serializer.save(status=KYCDocument.VerificationStatus.PENDING)
    #             return Response(
    #                 {
    #                     "message": "Document updated successfully!",
    #                     "data": serializer.data
    #                 },
    #                 status=status.HTTP_200_OK
    #             )
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #     except KYCDocument.DoesNotExist:
    #         return Response(
    #             {"error": "Document not found!"},
    #             status=status.HTTP_404_NOT_FOUND
    #         )

    def destroy(self, request, pk=None):
        try:
            doc = self.queryset.get(pk=pk, merchant=request.user)

            verified_check = self._check_verified(doc)
            if verified_check:
                return verified_check

            if os.path.isfile(doc.file.path):
                os.remove(doc.file.path)
            doc.delete()
            return Response(
                {"message": "Document deleted successfully!"},
                status=status.HTTP_200_OK
            )
        except KYCDocument.DoesNotExist:
            return Response(
                {"error": "Document not found!"},
                status=status.HTTP_404_NOT_FOUND
            )