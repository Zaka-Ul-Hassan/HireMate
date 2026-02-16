import sys
import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# --------------------------------------------------
# Add project root to sys.path (MUST be first)
# --------------------------------------------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

# --------------------------------------------------
# Alembic Config
# --------------------------------------------------
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --------------------------------------------------
# Import Base & ALL models
# --------------------------------------------------
from app.models.base.model_base import Base
from app.models.base.all_models import *  # IMPORTANT: forces model registration

# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
from load_env import DB_SERVER, DB_NAME, DB_DRIVER, DB_TRUSTED_CONNECTION

# --------------------------------------------------
# Target metadata
# --------------------------------------------------
target_metadata = Base.metadata

# --------------------------------------------------
# Build MSSQL connection URL
# --------------------------------------------------
driver = DB_DRIVER.replace(" ", "+")
trusted = "yes" if str(DB_TRUSTED_CONNECTION).lower() in ["true", "1", "yes"] else "no"

db_url = (
    f"mssql+pyodbc://@{DB_SERVER}/{DB_NAME}"
    f"?driver={driver}&trusted_connection={trusted}"
)

config.set_main_option("sqlalchemy.url", db_url)

# --------------------------------------------------
# Migration functions
# --------------------------------------------------
def run_migrations_offline():
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True
        )

        with context.begin_transaction():
            context.run_migrations()


# --------------------------------------------------
# Run migrations
# --------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
