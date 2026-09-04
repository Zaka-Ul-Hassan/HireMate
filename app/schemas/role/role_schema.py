# app\schemas\role\role_schema.py

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

# Permission schema for role
class PermissionSchema(BaseModel):
    Id: int
    Name: str
    DisplayName: Optional[str]
    ParentId: Optional[int] = None 

    model_config = ConfigDict(from_attributes=True)

# Base role schema
class RoleBaseSchema(BaseModel):
    Name: str = Field(..., max_length=100)

# Create role schema
class RoleCreateSchema(RoleBaseSchema):
    pass

# Update role schema
class RoleUpdateSchema(RoleBaseSchema):
    Id: int

# Role list schema with permissions
class RoleListSchema(RoleBaseSchema):
    Id: int
    CreatedAt: datetime
    ModifiedAt: Optional[datetime] = None
    CreatedBy: Optional[str] = None
    CreatedByUserId: Optional[int] = None
    ModifiedBy: Optional[str] = None
    ModifiedByUserId: Optional[int] = None
    IsDeleted: bool
    Permissions: Optional[List[PermissionSchema]] = None  # updated
    TotalUsers: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

#  Role Schema
class RoleSchema(BaseModel):
    Id: int
    Name: str

    model_config = ConfigDict(from_attributes=True)