# Authentication System - Complete Setup & Troubleshooting Guide

## ✅ Backend Status: WORKING

### Backend Health
- Database: ✓ Connected
- Default Mentor: ✓ Created (mentor@example.com / Password123)
- Sign In: ✓ Working
- Sign Up: ✓ Working

### Testing Backend Manually
```powershell
# Test Health
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get
$response | ConvertTo-Json

# Test Signin
$body = @{email="mentor@example.com"; password="Password123"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/auth/signin" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json

# Test Signup
$body = @{email="test@example.com"; password="Test123456789"; full_name="Test User"; role="student"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/auth/signup" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```

## 🚀 Frontend Setup Instructions

### Step 1: Install Dependencies
```bash
cd d:\pbl\frontend
npm install
```

### Step 2: Start the Frontend
```bash
npm run dev
```

### Step 3: Access the Application
- Open browser to: `http://localhost:3000`
- Login Page: Already at `/login` by default

## 🔑 Test Credentials

### Option 1: Use Default Mentor Account
- Email: `mentor@example.com`
- Password: `Password123`
- Role: Mentor

### Option 2: Create New Account
- Click "Sign Up" tab
- Enter email, password, full name, select role (Mentor or Student)
- Click "Sign Up"
- Automatically redirected to login
- Use created credentials to sign in

## ✓ Authentication Flow

1. **Sign Up** → User enters email, password, name, role
2. **Validation** → Frontend validates locally
3. **API Call** → POST /auth/signup with credentials
4. **Backend** → Creates user in mentors table
5. **Tokens** → Returns access_token & refresh_token
6. **Storage** → Frontend stores tokens in localStorage
7. **Redirect** → Navigate to dashboard
8. **Protected Routes** → useAuth hook checks authentication

## 🔧 Troubleshooting

### Issue: "Sign in failed" or "Cannot connect to server"
**Solution:**
1. Ensure backend is running: `python -m uvicorn backend.main:app --reload`
2. Check backend health: `http://127.0.0.1:8000/health`
3. Verify frontend BASE_URL in `/frontend/lib/auth.ts` is correct

### Issue: "Email already registered"
**Solution:**
- Use a different email address
- Or use the default mentor@example.com account
- Or delete `backend/edupulse.db` and restart to reset database

### Issue: "Invalid password" after signup
**Solution:**
- Ensure password is at least 8 characters
- Try using the default account first: mentor@example.com / Password123

### Issue: Frontend shows loading spinner but doesn't complete
**Solution:**
1. Check browser console for errors (F12)
2. Check backend terminal for error messages
3. Verify CORS is enabled in backend (it is by default)
4. Clear browser localStorage: `localStorage.clear()`

### Issue: Tokens not saving to localStorage
**Solution:**
1. Check if browser has localStorage enabled
2. Check if cookies are allowed
3. Try incognito/private mode
4. Clear browser data and try again

## 📋 Full System Verification

### Run This Checklist:

1. **Backend Running?**
   ```powershell
   curl http://127.0.0.1:8000/health
   # Should return: {"status":"ok","database":"connected","mentors_count":1}
   ```

2. **Can Create User?**
   ```powershell
   $body = @{email="test$(Get-Random)@test.com"; password="Test123456"; full_name="Test"; role="student"} | ConvertTo-Json
   curl -Method Post -Uri "http://127.0.0.1:8000/auth/signup" -Body $body -ContentType "application/json"
   # Should return: {...access_token..., mentor_id..., role...}
   ```

3. **Can Sign In?**
   ```powershell
   $body = @{email="mentor@example.com"; password="Password123"} | ConvertTo-Json
   curl -Method Post -Uri "http://127.0.0.1:8000/auth/signin" -Body $body -ContentType "application/json"
   # Should return: {...access_token..., mentor_id..., role...}
   ```

4. **Frontend Loads?**
   - Open `http://localhost:3000`
   - Should see login form

5. **Login Works?**
   - Enter mentor@example.com / Password123
   - Should redirect to dashboard

## 🎯 Quick Start Script

```bash
# Terminal 1 - Start Backend
cd d:\pbl
python -m uvicorn backend.main:app --reload

# Terminal 2 - Start Frontend  
cd d:\pbl\frontend
npm run dev

# Then:
# 1. Open http://localhost:3000
# 2. Use mentor@example.com / Password123
# 3. You're in!
```

## 📦 Key Files

- Backend: `d:\pbl\backend\main.py`
- Auth Logic: `d:\pbl\backend\auth.py`
- Frontend Auth: `d:\pbl\frontend\hooks\useAuth.ts`
- API Config: `d:\pbl\frontend\lib\auth.ts`
- Login Page: `d:\pbl\frontend\app\login\page.tsx`
- Database: `d:\pbl\backend\edupulse.db`

## 🔐 Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 30 minutes
- Refresh token expires after 7 days
- Tokens stored in localStorage
- CORS enabled for development (change for production)

## ✅ Everything is Ready!

- ✓ Backend fully functional
- ✓ Database initialized
- ✓ Authentication endpoints working
- ✓ Error handling improved
- ✓ Logging enabled
- ✓ Frontend configured correctly

**Just start the services and test in browser!**
