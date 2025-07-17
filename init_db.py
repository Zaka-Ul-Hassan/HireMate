from app.models.base.model_base import Base
from app.db import engine
from app.models.user.user import User
from app.models.user.role  import Role
from app.models.user.user_role import UserRole

def create_table():
    Base.metadata.create_all(bind=engine)
    print("Table created successfully.")

if __name__ == "__main__":
    create_table()  
