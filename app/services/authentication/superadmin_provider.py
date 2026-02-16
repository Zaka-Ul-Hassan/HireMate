# app\services\authentication\superadmin_provider.py

from sqlalchemy.orm import Session
from app.models.user.role import Role
from app.utils.security import encrypt, hash_password
from app.models.user.user import User
from app.models.user.user_role import UserRole
from app.models.email.email_settings import EmailSettings
from load_env import SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD, FIRSTNAME, LASTNAME, EMAIL, PASSWORD, ROLE, PHONE

class SuperAdminProvider:

    @staticmethod
    def seed_superadmin(db: Session):
        """
        Seed SuperAdmin user, role, permissions, and email settings.
        """
        # Check if any user exists
        total_users = db.query(User).filter(User.IsDeleted == False).count()
        if total_users > 0:
            return None

        try:
            # Create SuperAdmin User
            user = User(
                FirstName=FIRSTNAME,
                LastName=LASTNAME,
                Email=EMAIL,
                PhoneNumber=PHONE,
                Password=hash_password(PASSWORD),
                IsDeleted=False,
                IsActive=True,
                CreatedByUserId=None,
                CreatedBy="System"
            )
            db.add(user)
            db.flush()

            # Create SuperAdmin Role
            role = db.query(Role).filter(Role.Name == ROLE).first()
            if not role:
                role = Role(
                    Name=ROLE,
                    CreatedBy="System"
                )
                db.add(role)
                db.flush()  # flush to get role.Id

            # Assign Role to User
            user_role = UserRole(UserId=user.Id, RoleId=role.Id)
            db.add(user_role)

            # Seed Email Settings
            existing_email_settings = db.query(EmailSettings).filter(
                EmailSettings.UserId == user.Id
            ).first()

            if not existing_email_settings:
                email_settings = EmailSettings(
                    UserId=user.Id,
                    EmailAddress=SMTP_EMAIL,
                    Password=encrypt(SMTP_PASSWORD),
                    SmtpServer=SMTP_SERVER,
                    SmtpPort=int(SMTP_PORT),
                    IsDeleted=False,
                    CreatedByUserId=user.Id,
                    CreatedBy=f"{user.FirstName} {user.LastName}"
                )
                db.add(email_settings)

            # Commit Everything in One Transaction
            db.commit()
            db.refresh(user)

            return user

        except Exception as e:
            db.rollback()
            raise e
