# HRMS Lite 🏢

Lightweight **Human Resource Management System** built using **FastAPI (Backend)** and **React (Frontend)**.

---

## 🚀 Features
- Add / Delete Employees
- Mark Employee Attendance (Present / Absent)
- View Attendance Records with Date Filter
- REST API using FastAPI
- Frontend built with React + Vite

---

## 🛠 Tech Stack
- **Frontend:** React, Vite, CSS
- **Backend:** FastAPI, SQLite
- **Deployment:**  
  - Backend → Render  
  - Frontend → Vercel

---

## 📁 Project Structure
hrms-lite/
│
├── backend/
│ ├── main.py
│ ├── models.py
│ ├── schemas.py
│ ├── database.py
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
└── .gitignore


---

## ▶️ Run Project Locally

### 🔹 Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Backend will run at:
👉 http://127.0.0.1:8000

👉 Swagger Docs: http://127.0.0.1:8000/docs

🔹 Frontend
cd frontend
npm install
npm run dev


Frontend will run at:
👉 http://localhost:5173

🌐 Live URLs

Backend API: (Render URL here)

Frontend App: (Vercel URL here)
