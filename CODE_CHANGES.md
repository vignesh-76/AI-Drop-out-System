# Code Changes Reference

## 1. Backend Database Persistence Fix
**File:** `backend/main.py` (Lines 59-162)

### Change: Made database check before initialization

```python
def init_db():
    """Initialize database only if it doesn't exist."""
    db_exists = os.path.exists(DB_PATH)  # ← NEW: Check if already exists
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Create tables with IF NOT EXISTS (preserves existing data)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mentors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT DEFAULT 'mentor',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # ... other table creations ...
        
        conn.commit()
        conn.close()
        return not db_exists  # ← NEW: Return True if newly created
    except Exception as e:
        print(f"[ERROR] Error initializing database: {str(e)}")
        raise
```

### Initialization (Lines 198-203)

```python
# BEFORE:
# init_db()
# print("[OK] Database initialized")
# seed_default_mentor()
# print("[OK] Authentication system ready")

# AFTER:
is_new_db = init_db()  # ← Returns True only on first run
print("[OK] Database initialized")
if is_new_db:  # ← Only seed if newly created
    seed_default_mentor()
    print("[OK] Default mentor seeded")
else:
    print("[OK] Using existing database")
print("[OK] Authentication system ready")
```

**Why:** Prevents database recreation and data loss on restart.

---

## 2. Frontend API URL Configuration
**File:** `frontend/lib/auth.ts` (Line 1-2)

### Change: Use environment variable for API base URL

```typescript
// BEFORE:
// const BASE_URL = "http://127.0.0.1:8000";

// AFTER:
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
```

**Why:** Makes API URL configurable via environment variables.

**Required:** Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 3. localStorage Safety Enhancement
**File:** `frontend/lib/auth.ts` (Lines 5-91)

### Change: Added safe localStorage with error handling

```typescript
// Local storage keys
const ACCESS_TOKEN_KEY = "edupulse_access_token";
const REFRESH_TOKEN_KEY = "edupulse_refresh_token";
const MENTOR_KEY = "edupulse_mentor";

// Token management with localStorage safety
export const tokenAPI = {
  setTokens: (tokens: AuthTokens, mentorData: MentorData) => {
    try {
      if (typeof window !== 'undefined' && localStorage) {  // ← Check availability
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        localStorage.setItem(MENTOR_KEY, JSON.stringify(mentorData));
        console.log('[AUTH] Tokens saved to localStorage');  // ← Log for debugging
      }
    } catch (e) {
      console.error('[AUTH] Failed to save tokens to localStorage:', e);  // ← Error handling
    }
  },

  getAccessToken: () => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
      }
    } catch (e) {
      console.error('[AUTH] Failed to read access token from localStorage:', e);
    }
    return null;
  },

  getRefreshToken: () => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      }
    } catch (e) {
      console.error('[AUTH] Failed to read refresh token from localStorage:', e);
    }
    return null;
  },

  getMentorData: () => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const data = localStorage.getItem(MENTOR_KEY);
        return data ? JSON.parse(data) : null;
      }
    } catch (e) {
      console.error('[AUTH] Failed to read mentor data from localStorage:', e);
    }
    return null;
  },

  clearTokens: () => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(MENTOR_KEY);
        console.log('[AUTH] Tokens cleared from localStorage');
      }
    } catch (e) {
      console.error('[AUTH] Failed to clear tokens from localStorage:', e);
    }
  },

  isTokenExpiringSoon: (expiresIn: number = 300000) => {
    try {
      const token = typeof window !== 'undefined' && localStorage ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
      if (!token) return true;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      return expiresAt - now < expiresIn;
    } catch (e) {
      console.error('[AUTH] Failed to check token expiration:', e);
      return true;
    }
  }
};
```

**Why:** Prevents crashes if localStorage is unavailable and enables debugging.

---

## 4. Enhanced Auth Initialization Logging
**File:** `frontend/hooks/useAuth.ts` (Lines 26-86)

### Change: Added console logging for auth flow tracking

```typescript
// Initialize auth state from localStorage
useEffect(() => {
  const initializeAuth = async () => {
    try {
      const accessToken = tokenAPI.getAccessToken()
      const mentorData = tokenAPI.getMentorData()

      console.log('[AUTH] Initializing auth state...', { hasToken: !!accessToken, hasMentor: !!mentorData })

      if (accessToken && mentorData) {
        // Check if token is expiring soon
        if (tokenAPI.isTokenExpiringSoon()) {
          console.log('[AUTH] Token expiring soon, attempting refresh...')
          const refreshToken = tokenAPI.getRefreshToken()
          if (refreshToken) {
            try {
              const response = await authAPI.refreshToken(refreshToken)
              tokenAPI.setTokens(
                {
                  access_token: response.access_token,
                  refresh_token: response.refresh_token,
                  token_type: response.token_type
                },
                {
                  mentor_id: response.mentor_id,
                  email: response.email,
                  full_name: response.full_name,
                  role: response.role
                }
              )
              setMentor({
                mentor_id: response.mentor_id,
                email: response.email,
                full_name: response.full_name,
                role: response.role
              })
              setIsAuthenticated(true)
              console.log('[AUTH] Token refreshed successfully')
            } catch (err) {
              console.log('[AUTH] Token refresh failed, clearing auth', err)
              tokenAPI.clearTokens()
              setIsAuthenticated(false)
              setMentor(null)
            }
          }
        } else {
          setMentor(mentorData)
          setIsAuthenticated(true)
          console.log('[AUTH] Auth state restored from localStorage')
        }
      } else {
        setIsAuthenticated(false)
        setMentor(null)
        console.log('[AUTH] No auth tokens found')
      }
    } catch (err) {
      console.error('[AUTH] Error during initialization:', err)
      setIsAuthenticated(false)
      setMentor(null)
    } finally {
      setIsLoading(false)
    }
  }

  initializeAuth()
}, [])
```

**Why:** Enables debugging by logging all authentication steps to browser console.

---

## Environment Files

### backend/.env
```env
SECRET_KEY=edupulse-local-secret-key-change-this-in-production-12345678
DATABASE_PATH=edupulse.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
HOST=127.0.0.1
PORT=8000
```

### frontend/.env.local (NEW/UPDATED)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Testing the Changes

### 1. Database Persistence
```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn main:app --reload

# Should show: [OK] Database initialized
# Check database exists
ls -la backend/edupulse.db
```

### 2. API Configuration
```bash
# Terminal 2: Check environment variable is set
cat frontend/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

npm run dev
```

### 3. localStorage Functionality
```javascript
// Open browser console (F12)
// Sign in, then check:
localStorage.getItem('edupulse_access_token')  // Should have token
localStorage.getItem('edupulse_mentor')        // Should have mentor info

// Refresh page - should stay logged in
// Check console for [AUTH] logs
```

### 4. Debug Logging
```javascript
// In browser console (F12)
// You should see these on each page load:
console.log('[AUTH] Initializing auth state...')
console.log('[AUTH] Auth state restored from localStorage')
console.log('[AUTH] Tokens saved to localStorage')
```

---

## Verification Checklist

- [ ] `backend/main.py` has `db_exists` check in `init_db()`
- [ ] `backend/main.py` has `is_new_db = init_db()` initialization
- [ ] `backend/main.py` only calls `seed_default_mentor()` if `is_new_db` is True
- [ ] `frontend/lib/auth.ts` uses `process.env.NEXT_PUBLIC_API_URL`
- [ ] `frontend/lib/auth.ts` has `typeof window !== 'undefined'` checks
- [ ] `frontend/lib/auth.ts` has try-catch blocks around localStorage
- [ ] `frontend/lib/auth.ts` has `console.log` statements for debugging
- [ ] `frontend/hooks/useAuth.ts` has `[AUTH]` console logs
- [ ] `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`
- [ ] `backend/.env` has all required variables

---

## Summary

These 4 changes fix the authentication system:

1. **Database persistence** - User data survives server restarts
2. **Environment configuration** - API URL configurable per environment
3. **localStorage safety** - No crashes from storage issues
4. **Debug logging** - Clear console output for troubleshooting

Total impact: **Sign in now works permanently!** 🎉
