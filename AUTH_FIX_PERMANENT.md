# Authentication Fix - Permanent Solution

## Problem Analysis

Your sign up/sign in pages were not working permanently because:

1. **Database was reinitializing on every restart** - All user accounts were deleted when the backend restarted
2. **API URL was hardcoded** - Frontend couldn't find the backend server in different environments
3. **localStorage wasn't properly handled** - Auth tokens weren't persisting across page reloads
4. **Insufficient error logging** - Debugging auth issues was difficult

## Solutions Applied

### 1. Fixed Database Persistence (backend/main.py)

**Before:** `init_db()` recreated all tables every time, losing user data.

**After:** Modified to:
- Check if database already exists
- Only create tables if they don't exist (IF NOT EXISTS)
- Only seed default mentor on first initialization
- Preserve all existing user data on restart

```python
# Only run once on first start, preserve data on restart
is_new_db = init_db()  # Returns True if database was newly created
if is_new_db:
    seed_default_mentor()  # Only seed on fresh database
```

### 2. Fixed API URL Configuration (frontend/lib/auth.ts)

**Before:** Hardcoded to `http://127.0.0.1:8000`

**After:** Uses environment variable with fallback:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
```

### 3. Enhanced localStorage Handling (frontend/lib/auth.ts)

Added proper error handling:
- Check if window/localStorage exists (for SSR compatibility)
- Wrap all operations in try-catch
- Log operations for debugging
- Graceful fallback if localStorage unavailable

```typescript
try {
  if (typeof window !== 'undefined' && localStorage) {
    localStorage.setItem(key, value);
  }
} catch (e) {
  console.error('[AUTH] Failed to save to localStorage:', e);
}
```

### 4. Added Debug Logging (frontend/hooks/useAuth.ts)

- Logs auth initialization steps
- Logs token refresh attempts
- Helps identify authentication issues

```typescript
console.log('[AUTH] Initializing auth state...', { hasToken, hasMentor })
console.log('[AUTH] Tokens saved to localStorage')
console.log('[AUTH] Token refreshed successfully')
```

## Setup Instructions

### Step 1: Verify Backend Environment (.env)

Ensure `backend/.env` contains:
```env
SECRET_KEY=edupulse-local-secret-key-change-this-in-production-12345678
DATABASE_PATH=edupulse.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
HOST=127.0.0.1
PORT=8000
```

### Step 2: Verify Frontend Environment (.env.local)

Ensure `frontend/.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
python -m pip install -r requirements.txt  # First time only
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

### Step 4: Initial Sign In

1. Go to `http://localhost:3000/login`
2. Click "Sign In" tab
3. Use default credentials:
   - Email: `mentor@example.com`
   - Password: `Password123`
4. **You should now be logged in permanently** (tokens saved to localStorage)

### Step 5: Create Additional Accounts

1. Click "Sign Up" tab
2. Register with your details
3. Sign in with your new credentials
4. **Account data persists across browser reloads**

## How It Works Now

### Sign Up Flow:
1. User enters email, password, full name
2. Backend creates user in database (preserved on restart)
3. Backend returns JWT tokens (access + refresh)
4. Frontend stores tokens in localStorage
5. User redirected to dashboard
6. **Authentication persists across page reloads**

### Sign In Flow:
1. User enters email and password
2. Backend validates against database
3. Backend generates new JWT tokens
4. Frontend stores tokens in localStorage
5. **User stays logged in until logout or token expires (30 days)**

### Token Refresh Flow:
1. On page load, check if token exists in localStorage
2. If token will expire soon (<5 min), request new token
3. Backend validates refresh token, issues new access token
4. Update localStorage with new tokens
5. **User never needs to log in again unless they logout**

## Database Persistence

### Database File
- Location: `backend/edupulse.db` (SQLite)
- Created on first run
- **Preserved on every restart**
- Contains all user accounts and student data

### To Reset Database (if needed)
```bash
cd backend
rm edupulse.db  # Delete old database
python -m uvicorn main:app --reload  # Creates fresh database with default mentor
```

## Troubleshooting

### "Sign in failed" or "Network error"

**Check 1: Backend is running**
```bash
curl http://127.0.0.1:8000/docs  # Should show Swagger UI
```

**Check 2: Frontend .env.local is correct**
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

**Check 3: CORS is enabled in backend .env**
```
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Check 4: Open browser DevTools**
- Press F12 > Console tab
- Look for `[AUTH]` console logs
- Check Network tab for `/auth/signin` request

### "Not logged in after refresh"

**Check localStorage:**
```javascript
// In browser console:
console.log('Access Token:', localStorage.getItem('edupulse_access_token'));
console.log('Mentor Data:', localStorage.getItem('edupulse_mentor'));
```

If tokens exist but you're not logged in:
1. Open browser console
2. Look for `[AUTH]` error messages
3. Check if `frontend/.env.local` has correct API URL

### "Account lost after restart"

This should no longer happen! If it does:

**Check if database exists:**
```bash
ls -la backend/edupulse.db  # Should exist and have size > 0
```

**Check database integrity:**
```bash
cd backend
python db_check.py  # View all mentors and students
```

**If database was corrupted, reset it:**
```bash
cd backend
rm edupulse.db
python -m uvicorn main:app --reload
```

## Console Debugging

When you open the browser console (F12), you should see:

**On page load:**
```
[AUTH] Initializing auth state... {hasToken: true, hasMentor: true}
[AUTH] Auth state restored from localStorage
```

**On login:**
```
[AUTH] Tokens saved to localStorage
```

**On token refresh:**
```
[AUTH] Token expiring soon, attempting refresh...
[AUTH] Token refreshed successfully
```

**If something goes wrong:**
```
[AUTH] Failed to save tokens to localStorage: Error: ...
[AUTH] Error during initialization: Error: ...
```

## Security Notes

⚠️ **For Production:**

1. Change SECRET_KEY in `backend/.env`
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

2. Set secure CORS_ORIGINS:
```env
CORS_ORIGINS=https://yourdomain.com
```

3. Use HTTPS instead of HTTP

4. Set secure SESSION cookie flags

5. Use environment variables for credentials

## Summary

Your authentication system now:
- ✅ Preserves user accounts across restarts
- ✅ Uses environment-based configuration
- ✅ Properly stores and validates tokens
- ✅ Handles localStorage errors gracefully
- ✅ Provides detailed console logging
- ✅ Automatically refreshes expired tokens
- ✅ Persists authentication across page reloads

**Your sign in will now work permanently!**
