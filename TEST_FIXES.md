# 🚀 Quick Start - Test Authentication Fix

## 30 Second Setup

### Terminal 1: Backend
```bash
cd backend
python -m uvicorn main:app --reload
```
**Wait for:** `[OK] Authentication system ready`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
**Wait for:** `ready - started server on 0.0.0.0:3000`

---

## Test Sign In (Works Now!)

1. Go to http://localhost:3000/login
2. Click "Sign In" tab
3. Enter:
   - **Email:** `mentor@example.com`
   - **Password:** `Password123`
4. Click "Sign In"
5. ✅ **Should redirect to dashboard**

---

## Verify Persistence

### Test 1: Refresh Page
- Press `F5` to refresh
- ✅ Should stay logged in (not redirected to login)

### Test 2: Restart Servers
1. Stop both servers (Ctrl+C)
2. Start backend again
3. Start frontend again  
4. Go to http://localhost:3000
5. ✅ Should still be logged in (no need to sign in again)

### Test 3: Check Browser Console (F12)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Sign in
4. Should see:
   ```
   [AUTH] Tokens saved to localStorage
   [AUTH] Auth state restored from localStorage
   ```
5. ✅ Blue text (not red errors)

---

## Test Sign Up

1. Click "Sign Up" tab
2. Enter:
   - **Full Name:** Your name
   - **Email:** anything@example.com
   - **Password:** Password123  
   - **Confirm:** Password123
3. Click "Sign Up"
4. ✅ Should be logged in with new account

---

## Verify New Account Persists

1. Restart backend
2. Go to http://localhost:3000/login
3. Sign in with new email and password
4. ✅ Account still exists!

---

## If Something Goes Wrong

### Error: "Network Error" on Sign In
```bash
# Check backend is running
curl http://127.0.0.1:8000/docs
# If fails, start backend
```

### Error: Can't sign in with new account
```bash
# Clear cache and try again
# Press F12 > Application > Clear storage
# Sign up again
```

### Error: "Account lost after restart"
```bash
# Database corrupted? Reset it:
cd backend
rm edupulse.db
python -m uvicorn main:app --reload
```

---

## Success Indicators

✅ Can sign in with `mentor@example.com` / `Password123`  
✅ Redirects to dashboard  
✅ Page refresh keeps you logged in  
✅ Server restart keeps you logged in  
✅ Browser console shows `[AUTH]` logs (no red errors)  
✅ Can create and use new accounts  
✅ New accounts persist after restart  

If all ✅, **Authentication is fixed!**

---

## Next Steps

- **Detailed Setup:** See `SETUP_CHECKLIST.md`
- **Troubleshooting:** See `AUTH_FIX_PERMANENT.md`
- **Code Changes:** See `CODE_CHANGES.md`
- **Fix Summary:** See `FIXES_SUMMARY.md`

---

## Files That Were Fixed

1. `backend/main.py` - Database persistence
2. `backend/.env` - Configuration
3. `frontend/lib/auth.ts` - API URL + localStorage safety
4. `frontend/hooks/useAuth.ts` - Debug logging
5. `frontend/.env.local` - API URL configuration

---

**Your authentication system is now permanently fixed!** 🎉

If you see blue `[AUTH]` logs in console = everything working ✅
