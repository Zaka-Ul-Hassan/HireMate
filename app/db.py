# app\db.py
# This file sets up the SQLAlchemy database connection and session factory
# using the configuration loaded from a config file.
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from load_env import DB_SERVER, DB_NAME, DB_DRIVER, DB_TRUSTED_CONNECTION

connection_string = (
    f"mssql+pyodbc://@{DB_SERVER}/{DB_NAME}?"
    f"driver={DB_DRIVER.replace(' ', '+')}&trusted_connection={DB_TRUSTED_CONNECTION.lower()}"
)

engine = create_engine(connection_string, echo=True)
SessionLocal = sessionmaker(bind = engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()