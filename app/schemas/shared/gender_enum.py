# app\schemas\shared\gender_enum.py
# This file defines the GenderEnum enumeration used to restrict gender values
# in user-related schemas and models.
from enum import Enum

class GenderEnum(str, Enum):
    male = "Male"
    female = "Female"
    other = "Other"
