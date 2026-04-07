# EduPulse - Student Risk Prediction System

## Quick Start

This is a local-only application that uses SQLite for data storage. No cloud services or external APIs required.

### Prerequisites
- Python 3.9+ with pip/venv
- Node.js 16+

### Setup & Run

#### 1. Install Backend Dependencies
```bash
cd d:/pbl
.venv/Scripts/pip install FastAPI uvicorn PyJWT bcrypt python-multipart email-validator pydantic
```

#### 2. Install Frontend Dependencies
```bash
cd d:/pbl/frontend
npm install
```

#### 3. Start Backend Server
Open a terminal and run:
```bash
cd d:/pbl
.venv/Scripts/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will be available at: **http://127.0.0.1:8000**

#### 4. Start Frontend Development Server
Open another terminal and run:
```bash
cd d:/pbl/frontend
npm run dev
```

The frontend will be available at: **http://localhost:3000**

### Default Login Credentials
- **Email**: test@example.com
- **Password**: password123
- **Role**: Mentor

### Database
- SQLite database is stored at: `d:/pbl/backend/edupulse.db`
- All student data and login credentials are stored locally
- No internet connection required

### Project Structure
```
d:/pbl/
├── backend/              # FastAPI backend
│   ├── main.py          # Main application
│   ├── auth.py          # Authentication logic
│   ├── models.py        # Data models
│   └── edupulse.db      # SQLite database
├── frontend/            # Next.js frontend
│   ├── app/             # Pages and components
│   ├── components/      # React components
│   └── lib/             # Utility functions
└── .venv/              # Python virtual environment
```

### Creating New Users
You can create new user accounts directly from the frontend's Sign Up tab on the login page.

### API Documentation
Once the backend is running, view the interactive API docs at:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

### Features
- User authentication with JWT tokens
- Student data management with local SQLite
- Risk analysis and predictions
- Dashboard with analytics
- Counselor recommendations
- Student filtering by risk level

### Data Format
When importing students via CSV, use this format:
```
name,roll_no,department,attendance,subject1_marks,subject2_marks,subject3_marks,subject4_marks,subject5_marks,fees_pending
John Doe,A001,CS,95,88,90,92,85,87,0
```

All numeric values should be 0-100, except fees_pending (in currency units).
