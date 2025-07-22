# init_db.py

from app.models.base.model_base import Base
from app.db import engine

from app.models.user.role  import Role
from app.models.user.user_role import UserRole
from app.models.email.email_model import Email
from app.models.resume.resume_model import Resume


def create_table():
    Base.metadata.create_all(bind=engine)
    print(Base.metadata.tables.keys())

    print("Table created successfully.")

if __name__ == "__main__":
    create_table()  
