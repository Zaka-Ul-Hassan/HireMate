# init_db.py

from app.models.base.model_base import Base
from app.db import engine

from app.models.user.role  import Role
from app.models.user.user_role import UserRole
from app.models.email.email_model import Email


def create_table():
    Base.metadata.create_all(bind=engine)
    print("Table created successfully.")

if __name__ == "__main__":
    create_table()  
