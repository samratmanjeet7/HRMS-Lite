from datetime import date
from pydantic import BaseModel, EmailStr, Field

# -------------------
# Employee
# -------------------
class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=3)
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    department: str = Field(..., min_length=2)

class EmployeeOut(EmployeeCreate):
    id: int
    class Config:
        from_attributes = True

# -------------------
# Attendance
# -------------------
class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str  # Present / Absent

class AttendanceOut(AttendanceCreate):
    id: int
    class Config:
        from_attributes = True
