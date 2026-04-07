# Authentication System Updates

## Summary of Changes

### 1. **Removed unwanted files**
   - Deleted test files: `check_upload.py`, `quick_upload_test.py`, `final_upload_test.py`, `test_upload.py`, `verify_upload.py`, `run_upload_test.py`

### 2. **Backend Changes (models.py)**
   - Updated `SignUpRequest`: Changed role from `Literal["mentor", "admin"]` to `Literal["mentor", "student"]`
   - Updated `TokenResponse`: Now uses `mentor_id` instead of `student_id`
   - Updated class names: Changed `MentorResponse` (no change needed, already correct)

### 3. **Backend Changes (main.py)**
   - **Database**: 
     - Maintains `mentors` table (not renamed to students)
     - Kept all foreign key references to mentors table
   
   - **Authentication Endpoints**:
     - `/auth/signup`: Uses mentors table with role support for "mentor" and "student"
     - `/auth/signin`: Authenticates users and returns mentor_id with their role
     - `/auth/refresh`: Refreshes token using mentor_id
     - `/auth/forgot-password`: Password reset for mentors table
     - `/auth/reset-password`: Password reset confirmation
     - `/auth/me`: Get current user info from mentors table
   
   - **Dependencies**:
     - `get_current_mentor()`: Extracts JWT token and validates mentor_id

### 4. **Frontend Changes (login/page.tsx)**
   - Updated Role dropdown options:
     - Sign In: Changed from `["Mentor", "Admin"]` to `["Mentor", "Student"]`
     - Sign Up: Changed from `["Mentor", "Admin"]` to `["Mentor", "Student"]`
   - Default role remains "mentor"

### 5. **Database Structure**
   - **mentors table**: Stores user accounts (id, email, password_hash, full_name, role, timestamps)
   - **students table**: Stores academic data (id, name, roll_no, department, attendance, marks, fees_pending, etc.)
   - **Other tables**: alerts, recommendations, counselor_assignments, follow_ups (for student monitoring)

## Role System
- **mentor**: User who manages and monitors students
- **student**: User who has academic records and needs monitoring

## Authentication Flow
1. User signs up with email, password, full_name, and role (mentor or student)
2. Password is hashed using bcrypt
3. User is stored in mentors table with their role
4. JWT tokens are generated (access_token and refresh_token)
5. User can log in with email and password regardless of role
6. Token contains mentor_id, email, and role
7. All protected endpoints use get_current_mentor() to validate tokens

## Testing Instructions
1. Start backend: `uvicorn backend.main:app --reload`
2. Start frontend: `npm run dev`
3. Sign up with role "Mentor" or "Student"
4. Sign in with credentials
5. Test password reset functionality
6. Test token refresh after expiration

## Files Modified
- `/backend/models.py`
- `/backend/main.py`
- `/frontend/app/login/page.tsx`
- `/backend/edupulse.db` (deleted for reset)

## Database Reset
The database was deleted and will be recreated with proper schema on first startup.
A default mentor account is automatically created with:
- Email: mentor@example.com
- Password: Password123
- Name: Default Mentor
