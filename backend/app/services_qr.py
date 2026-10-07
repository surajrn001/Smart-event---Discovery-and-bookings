import qrcode
import os
import uuid
from app.config import settings

def generate_qr_code(ticket_code: str, verification_data: dict) -> str:
    """
    Generates a PNG QR code image, saves it to static/qr_codes,
    and returns the relative URL to access it.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    # Verification string encoded in QR
    payload = f"SMARTEVENT-VERIFY:{ticket_code}"
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1E293B", back_color="#FFFFFF")
    
    filename = f"qr_{ticket_code}_{uuid.uuid4().hex[:6]}.png"
    filepath = os.path.join(settings.QR_DIR, filename)
    img.save(filepath)

    # Return URL for serving static asset
    return f"/static/qr_codes/{filename}"
