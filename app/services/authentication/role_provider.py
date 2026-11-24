# app\services\authentication\role_provider.py

from sqlalchemy.orm import Session
from app.models.user.role import Role


class RoleProvider:

    @staticmethod
    def seed_roles(db: Session):
        """
        Seed default system roles and migrate legacy 'User' role to 'Job Seeker'
        """

        roles_to_create = [
            "Job Seeker",
            "Employer"
        ]

        try:
            # Check if legacy "User" role exists
            existing_user_role = (
                db.query(Role)
                .filter(Role.Name == "User")
                .first()
            )

            # Check if "Job Seeker" role already exists
            existing_job_seeker_role = (
                db.query(Role)
                .filter(Role.Name == "Job Seeker")
                .first()
            )

            if existing_user_role:
                if not existing_job_seeker_role:
                    # Rename legacy "User" role directly to "Job Seeker"
                    existing_user_role.Name = "Job Seeker"
                    db.commit()
                else:
                    # "Job Seeker" already exists, re-assign any references from "User" to "Job Seeker"
                    from app.models.user.user_role import UserRole
                    db.query(UserRole).filter(UserRole.RoleId == existing_user_role.Id).update(
                        {UserRole.RoleId: existing_job_seeker_role.Id}
                    )
                    db.delete(existing_user_role)
                    db.commit()

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
