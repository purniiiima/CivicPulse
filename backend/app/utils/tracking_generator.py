import random
import string
from datetime import datetime


def generate_tracking_number(prefix: str = "CP") -> str:
    """Generate a readable municipal tracking number such as CP-2026-89421."""
    year = datetime.utcnow().year
    digits = ''.join(random.choices(string.digits, k=5))
    return f"{prefix}-{year}-{digits}"
