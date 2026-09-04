# app\schemas\email\email_settings_schema.pyfrom typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class EmailSettingsBaseSchema(BaseModel):
    UserId: int
    EmailAddress: EmailStr
    Password: str

class EmailSettingsCreateSchema(EmailSettingsBaseSchema):
    pass

class EmailSettingsUpdateSchema(EmailSettingsBaseSchema):
    pass

class EmailSettingsResponseSchema(EmailSettingsBaseSchema):
    Id: int
    SmtpServer: str
    SmtpPort: int

    model_config = ConfigDict(from_attributes=True)