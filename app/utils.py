import uuid


def generate_tracking_number() -> str:
    """Generate a unique parcel tracking number."""
    return f"TRK{uuid.uuid4().hex[:12].upper()}"
