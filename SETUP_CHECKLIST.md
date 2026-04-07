# Quick Setup Checklist

## Before Starting

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ and npm installed
- [ ] Two terminal windows open

## Backend Setup

### Terminal 1: Backend
```bash
cd backend
```

- [ ] `.env` file exists with SECRET_KEY and DATABASE_PATH
- [ ] `/edupulse.db` should be created (if first time)
```bash
python -m pip install -r requirements.txt  # First time only
python -m uvicorn main:app --reload
```

**Expected output:**
```
[OK] Database initialized
[OK] Default mentor seeded
[OK] Authentication system ready
Uvicorn running on http://127.0.0.1:8000
```

### Test Backend:
```bash
# In another terminal, test the API:
curl http://127.0.0.1:8000/docs
```
✅ Should show Swagger UI

## Frontend Setup

### Terminal 2: Frontend
```bash
cd frontend
```

- [ ] `.env.local` file exists with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`
- [ ] `/node_modules` directory exists (has dependencies)

```bash
npm install  # First time only
npm run dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Testing Sign In/Sign Up

1. Go to `http://localhost:3000/login`

2. **Sign In Test:**
   - Email: `mentor@example.com`
   - Password: `Password123`
   - Click "Sign In"
   - ✅ Should redirect to dashboard
   - ✅ No errors in console

3. **Check Console (F12):**
   - Should see: `[AUTH] Auth state restored from localStorage`
   - Should see: `[AUTH] Tokens saved to localStorage`
   - No red error messages

4. **Persistence Test:**
   - Refresh page (F5)
   - ✅ Should stay logged in
   - ✅ Should see mentor info in dashboard

5. **Sign Up Test:**
   - Click "Sign Up" tab
   - Create new account
   - ✅ Should redirect to dashboard
   - ✅ Verify new mentor exists

6. **Restart Test:**
   - Close both terminals (Ctrl+C)
   - Start backend again
   - Start frontend again
   - Go to `http://localhost:3000`
   - ✅ Should NOT need to login again (if not cleared localStorage)
   - ✅ Should see mentor info

## Troubleshooting Quick Guide

### Problem: "Network Error" on Sign In

**Step 1:** Is backend running?
```bash
curl http://127.0.0.1:8000/docs
```
- ❌ No response → Start backend
- ✅ Shows Swagger UI → Backend OK

**Step 2:** Check frontend .env.local
```bash
cat frontend/.env.local
```
- Should have: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`
- If missing, add it and restart frontend

**Step 3:** Check browser console (F12 > Console)
- Look for `[AUTH]` error messages
- Take screenshot and check error details

### Problem: "Account lost after restart"

**Database still exists?**
```bash
ls -la backend/edupulse.db
```
- ❌ File not found → Database was deleted
- ✅ File exists → Check file size > 0

**Check database content:**
```bash
cd backend
python db_check.py
```
- Should list mentors and students

**Reset if needed:**
```bash
cd backend
rm edupulse.db
python -m uvicorn main:app --reload
```

### Problem: "Can't stay logged in"

**Check localStorage (F12 > Console):**
```javascript
localStorage.getItem('edupulse_access_token')
localStorage.getItem('edupulse_mentor')
```
- ❌ null → Tokens not saved (check for errors)
- ✅ Shows data → Tokens saved OK

**Clear and try again:**
```javascript
// In browser console:
localStorage.clear()
```
Then sign in again.

## Environment Variables Reference

### backend/.env
```env
SECRET_KEY=edupulse-local-secret-key-change-this-in-production-12345678
DATABASE_PATH=edupulse.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
HOST=127.0.0.1
PORT=8000
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## File Checklist

- [ ] `backend/.env` exists ✅
- [ ] `backend/edupulse.db` exists (created after first run) ✅
- [ ] `frontend/.env.local` exists ✅
- [ ] `backend/main.py` has database persistence fix ✅
- [ ] `frontend/lib/auth.ts` uses environment variable for API URL ✅
- [ ] `frontend/hooks/useAuth.ts` has debug logging ✅

## Success Indicators

After following setup:

✅ Can sign in with `mentor@example.com` / `Password123`
✅ Redirects to dashboard
✅ Page refresh keeps you logged in
✅ Console shows `[AUTH]` debug messages
✅ Backend doesn't lose accounts on restart
✅ Can create new accounts
✅ New accounts persist after restart

## Need Help?

1. Check browser console (F12)
2. Look for `[AUTH]` messages
3. Check all .env files exist
4. Verify both servers running
5. Clear localStorage and try again
6. Check AUTH_FIX_PERMANENT.md for detailed info

---

**Status:** ✅ Authentication Permanently Fixed
- Database persistence: ✅
- Environment configuration: ✅
- localStorage handling: ✅
- Error logging: ✅
