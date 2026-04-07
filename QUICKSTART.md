# 🚀 EduPulse - Quick Start Guide

## System Status
✅ **Backend**: FastAPI + SQLite running on port 8000
✅ **Frontend**: Next.js running on port 3000
✅ **Database**: Local SQLite (no cloud services)
✅ **Authentication**: Working with test account
✅ **Test Data**: 5 students loaded with risk analysis

## 🔓 Login Credentials
```
Email: test@example.com
Password: password123
Role: Mentor
```

## 🎯 How to Run

### Option 1: Windows Batch File (Easiest)
Double-click: `START.bat`
- Opens 2 windows: Backend and Frontend
- Gives you 3 seconds between starts

### Option 2: Manual - Terminal 1 (Backend)
```bash
cd d:\pbl
.venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Option 3: Manual - Terminal 2 (Frontend)
```bash
cd d:\pbl\frontend
npm run dev
```

## 📱 Access Points
- **Application**: http://localhost:3000
- **API Documentation**: http://127.0.0.1:8000/docs
- **API ReDoc**: http://127.0.0.1:8000/redoc

## 📊 Features Available
✓ User Authentication (Sign In / Sign Up)
✓ Student Dashboard with Risk Analysis
✓ Risk-Level Filtering (High, Medium, Low)
✓ Student Details View
✓ Attendance & Performance Analytics
✓ Counselor Recommendations
✓ Light/Dark Mode

## 📁 File Locations
- **Frontend Code**: `d:\pbl\frontend\app\` and `d:\pbl\frontend\components\`
- **Backend Code**: `d:\pbl\backend\`
- **Database**: `d:\pbl\backend\edupulse.db`
- **Startup Docs**: `d:\pbl\START.md`

## 🗄️ Database
All data is stored locally in SQLite:
- Student records with attendance, marks, fees
- User accounts and passwords (hashed with bcrypt)
- Recommendations and follow-ups
- Risk calculations and alerts

## ⚙️ Creating New Users
1. Click "Sign Up" on the login page
2. Fill in: Email, Full Name, Password, Role (Mentor/Admin)
3. Password must be 8+ characters
4. New accounts are ready to use immediately

## ✅ If Something Breaks
1. **Backend not responding**: Kill Python process, restart
2. **Frontend hot reload failing**: Kill Node process, restart
3. **Database errors**: `rm d:/pbl/backend/edupulse.db` and restart (loses data)
4. **Port in use**: Change port in code or kill process using the port

## 🔐 Security Notes
- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire in 30 minutes (access) / 7 days (refresh)
- All data stays on your local machine
- CORS is open (for local development)

## 📝 Default Test Data
| Name | Roll No | Department | Risk Level | Reason |
|------|---------|-----------|-----------|---------|
| John Doe | A001 | CS | **Low** | Great attendance & marks |
| Jane Smith | A002 | IT | **High** | Low attendance & marks + fees |
| Bob Johnson | A003 | CS | **High** | Low marks + pending fees |
| Alice Brown | A004 | EC | **High** | Pending fees |
| Charlie Wilson | A005 | ME | **High** | Low attendance + high fees |

## 💡 Tips
- Check browser console (F12) for errors
- API logs show in backend terminal
- Frontend auto-saves to localStorage
- Logout clears all local auth tokens
- All new students need 5 subject marks (0-100)

---

**Created**: 3/30/2026
**Status**: Fully Functional ✅
**No External Services Required** 🚀
