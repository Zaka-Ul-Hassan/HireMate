# app\services\authentication\role_provider.py

from sqlalchemy.orm import Session
from app.models.user.role import Role


class RoleProvider:

    @staticmethod
    def seed_roles(db: Session):
        """
        Seed default system roles
        """

        roles_to_create = [
            "User",
            "Employer"
        ]

        try:
            for role_name in roles_to_create:
                existing_role = (
                    db.query(Role)
                    .filter(Role.Name == role_name)
                    .first()
                )

                if not existing_role:
                    role = Role(
                        Name=role_name,
                        CreatedBy="System"
                    )
                    db.add(role)

            db.commit()

        except Exception as e:
            db.rollback()
            raise e
