# app\db.py
# This file sets up the SQLAlchemy database connection and session factory
# using the configuration loaded from a config file.
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config_loader import load_config

config = load_config()["database"]

connection_string = (
    f"mssql+pyodbc://@{config['server']}/{config['database']}?"
    f"driver={config['driver'].replace(' ', '+')}&trusted_connection={config['trusted_connection'].lower()}"
)

engine = create_engine(connection_string, echo=True)
SessionLocal = sessionmaker(bind = engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()