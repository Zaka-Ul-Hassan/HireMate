# app\models\audit_mixin.py
from sqlalchemy import Column,DateTime,String,Boolean
from datetime import datetime

class AuditMixin:
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    ModifiedAt = Column(DateTime, onupdate=datetime.utcnow)
    CreatedBy = Column(String(100), nullable=True)
    ModifiedBy = Column(String(100), nullable=True)
    IsDeleted = Column(Boolean, default=False)
    IsActive = Column(Boolean, default=True)