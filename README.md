# HRMS Lite 🏢

A **Lightweight Human Resource Management System** built using **FastAPI (Backend)** and **React + Vite (Frontend)**.  
This project allows basic employee management and attendance tracking with a clean UI and REST APIs.

---

## 🚀 Features

- ➕ Add Employees  
- ❌ Delete Employees  
- 🕒 Mark Attendance (Present / Absent)  
- 📅 View Attendance Records with Date Filters  
- 🔌 RESTful API built with FastAPI  
- ⚡ Fast and responsive frontend using React + Vite  

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- FastAPI
- SQLite
- SQLAlchemy

### Deployment
- **Backend** → Render  
- **Frontend** → Vercel  

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


## ▶️ Run Project Locally

### 🔹 Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Backend will run at:
👉 http://127.0.0.1:8000

Swagger Docs:
👉 http://127.0.0.1:8000/docs

🔹 Frontend (React + Vite)
cd frontend
npm install
npm run dev
Frontend will run at:
👉 http://localhost:5173

🌐 Live URLs

Frontend (Vercel):
👉 https://hrms-lite-lilac.vercel.app

Backend API (Render):
👉 https://hrms-lite-0pmp.onrender.com

📌 Notes
The frontend communicates with the backend using environment variables.
API base URL is configured using VITE_API_URL.

👨‍💻 Author

Samrat Manjeet
GitHub: https://github.com/samratmanjeet7

