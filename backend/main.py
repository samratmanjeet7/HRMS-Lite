from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from datetime import date

from database import Base, engine, get_db
from models import Employee, Attendance
from schemas import EmployeeCreate, EmployeeOut, AttendanceCreate, AttendanceOut

app = FastAPI(title="HRMS Lite", version="1.0.0")

# CORS (frontend connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # deployment me isko specific domain se replace kar dena
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "HRMS Lite Backend Running 🚀"}

# --------------------
# Employees
# --------------------
@app.get("/employees", response_model=list[EmployeeOut])
def get_employees(db: Session = Depends(get_db)):
    employees = db.execute(select(Employee).order_by(Employee.id.desc())).scalars().all()
    return employees

@app.post("/employees", response_model=EmployeeOut, status_code=201)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    # Duplicate employee_id
    exists_emp_id = db.execute(
        select(Employee).where(Employee.employee_id == payload.employee_id)
    ).scalar_one_or_none()
    if exists_emp_id:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    # Duplicate email
    exists_email = db.execute(
        select(Employee).where(Employee.email == payload.email)
    ).scalar_one_or_none()
    if exists_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    emp = Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

@app.delete("/employees/{emp_id}", status_code=200)
def delete_employee(emp_id: str, db: Session = Depends(get_db)):
    emp = db.execute(select(Employee).where(Employee.employee_id == emp_id)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(emp)  # cascade attendance delete
    db.commit()
    return {"message": f"Employee {emp_id} deleted"}

# --------------------
# Attendance
# --------------------
@app.post("/attendance", response_model=AttendanceOut, status_code=201)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    emp = db.execute(select(Employee).where(Employee.employee_id == payload.employee_id)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if payload.status not in ["Present", "Absent"]:
        raise HTTPException(status_code=400, detail="Status must be Present or Absent")

    # duplicate check (employee + date)
    exists = db.execute(
        select(Attendance).where(
            Attendance.employee_id == payload.employee_id,
            Attendance.date == payload.date
        )
    ).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")

    att = Attendance(employee_id=payload.employee_id, date=payload.date, status=payload.status)
    db.add(att)
    db.commit()
    db.refresh(att)
    return att

@app.get("/attendance/{employee_id}", response_model=list[AttendanceOut])
def get_attendance(
    employee_id: str,
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    emp = db.execute(select(Employee).where(Employee.employee_id == employee_id)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    q = select(Attendance).where(Attendance.employee_id == employee_id).order_by(Attendance.date.desc())

    if from_date:
        q = q.where(Attendance.date >= from_date)
    if to_date:
        q = q.where(Attendance.date <= to_date)

    records = db.execute(q).scalars().all()
    return records

@app.get("/attendance/{employee_id}/summary")
def attendance_summary(employee_id: str, db: Session = Depends(get_db)):
    emp = db.execute(select(Employee).where(Employee.employee_id == employee_id)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    records = db.execute(select(Attendance).where(Attendance.employee_id == employee_id)).scalars().all()
    present_days = sum(1 for r in records if r.status == "Present")
    absent_days = sum(1 for r in records if r.status == "Absent")

    return {
        "employee_id": employee_id,
        "total_records": len(records),
        "present_days": present_days,
        "absent_days": absent_days,
    }
