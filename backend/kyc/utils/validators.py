import os
import magic
from rest_framework.exceptions import ValidationError

ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png"}
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE      = 5 * 1024 * 1024  # 5 MB


def validate_kyc_file(file):
    # size check
    if file.size > MAX_FILE_SIZE:
        raise ValidationError(
            f"File size {round(file.size / (1024 * 1024), 2)} MB exceeds the 5 MB limit."
        )

    # extension check
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"File extension '{ext}' is not allowed. Accepted: .pdf, .jpg, .jpeg, .png"
        )

    # magic byte check — do NOT trust client MIME type
    mime = magic.from_buffer(file.read(261), mime=True)
    file.seek(0)  # reset pointer after reading — critical, missing this saves an empty file
    if mime not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            f"File content type '{mime}' is not allowed. Accepted: PDF, JPG, PNG"
        )

    return file