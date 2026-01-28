# init_db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import pyodbc
from load_env import DB_DRIVER, DB_SERVER, DB_NAME, DB_TRUSTED_CONNECTION
import app.models  # root package for models

Base = declarative_base()

from app.models.base import all_models

# Build connection string
driver = DB_DRIVER.replace(" ", "+")
connection_string = (
    f"mssql+pyodbc://@{DB_SERVER}/{DB_NAME}?driver={driver}&trusted_connection={DB_TRUSTED_CONNECTION.lower()}"
)

engine = create_engine(connection_string, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def get_connection():
    
    conn_str = (
        f"DRIVER={{{DB_DRIVER}}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_NAME};"
        f"Trusted_Connection={DB_TRUSTED_CONNECTION};"
    )

    connection = pyodbc.connect(conn_str)
    try:
        yield connection
    finally:
        connection.close()