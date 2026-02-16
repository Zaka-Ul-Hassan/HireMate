# app\utils\security.py
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from load_env import ENCRYPTION_KEY

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
cipher = Fernet(ENCRYPTION_KEY)

# hash a password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# verify a password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# encrypt text
def encrypt(text: str) -> str:
    return cipher.encrypt(text.encode()).decode()

# decrypt text
def decrypt(token: str) -> str:
    return cipher.decrypt(token.encode()).decode()

# Normalize Message-ID / In-Reply-To for comparison
def normalize_msgid(value):
    if not value:
        return None
    if isinstance(value, tuple):
        value = value[0]
    return value.strip().lstrip("<").rstrip(">")