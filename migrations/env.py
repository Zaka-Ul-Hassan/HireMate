import sys
import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import pkgutil
import importlib

from app.models.base import all_models

# Add your project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from load_env import DB_SERVER, DB_NAME, DB_DRIVER, DB_TRUSTED_CONNECTION
from app.models.base.model_base import Base

# # Dynamically import all modules under app.models
# import app.models
# for loader, module_name, is_pkg in pkgutil.walk_packages(app.models.__path__, app.models.__name__ + "."):
#     importlib.import_module(module_name)

# Alembic Config object
config = context.config

# Set up Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for 'autogenerate'
target_metadata = Base.metadata

# Build DB URL dynamically
driver = DB_DRIVER.replace(" ", "+")
db_url = f"mssql+pyodbc://@{DB_SERVER}/{DB_NAME}?driver={driver}&trusted_connection={DB_TRUSTED_CONNECTION.lower()}"
config.set_main_option("sqlalchemy.url", db_url)


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
