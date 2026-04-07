# Sign-In Page - Complete Guide

## 🔐 Login Page Overview
The login page is the entry point to EduPulse. It's a beautiful, modern interface with smooth animations and two modes: **Sign In** and **Sign Up**.

## ✅ How to Access Sign-In

1. Open your browser and go to: **http://localhost:3000**
2. You'll automatically see the login page (if not already logged in)
3. Two tabs at the top:
   - **Sign In** (default) - Login with existing account
   - **Sign Up** - Create new account

## 🔑 Test Account Credentials
```
Email: test@example.com
Password: password123
Role: Mentor (selected by default)
```

## 📝 Sign In Steps

1. Start with the **Sign In** tab (already selected)
2. Enter your email: `test@example.com`
3. Select role: Keep as **Mentor** (or choose Admin)
4. Enter password: `password123`
5. Click **"Sign In"** button
6. You'll be redirected to the Dashboard

## ✍️ Sign Up Steps (Creating New Account)

1. Click the **Sign Up** tab
2. Fill in:
   - **Full Name**: Your name
   - **Email**: Valid email address (must not exist)
   - **Role**: Choose Mentor or Admin
   - **Password**: 8+ characters required
   - **Confirm Password**: Must match password
3. Click **"Create Account"** button
4. Success message appears
5. You can immediately click Sign In tab and login with new account

## ✨ Sign-In Page Features

### Visual Features
- 🎨 **Glass-morphism design** - Modern frosted glass effect
- 🌙 **Light/Dark mode** - Automatically uses system preference
- ✨ **Smooth animations** - Polished transitions between tabs
- 📱 **Responsive** - Works on mobile, tablet, desktop

### Form Features
- 👁️ **Show/Hide password** - Eye icon to toggle password visibility
- 🔒 **Password validation** - Minimum 8 characters
- 📧 **Email validation** - Checks format
- ⚠️ **Error messages** - Clear feedback if something's wrong
- ⏳ **Loading state** - Shows spinner while logging in

### Security Features
- 🔐 Passwords are hashed (bcrypt, 12 rounds)
- 🔑 JWT tokens stored in localStorage
- 🚨 Invalid credentials show error message
- ⏱️ Tokens auto-refresh before expiring
- 🔄 Automatically logs out on token expiration

## 🎯 What Happens After Login

1. **Success**: Redirected to Dashboard
2. **Invalid credentials**: Error message appears
3. **Network error**: Toast notification at top-right
4. **Session expired**: Automatically refreshes token or sends back to login

## ❌ Troubleshooting Sign-In

| Problem | Solution |
|---------|----------|
| "Invalid or missing token" | Backend not running, restart it |
| "Sign in failed" | Check email and password are correct |
| Page won't load | Clear browser cache (Ctrl+Shift+Del) |
| Can't see form | Check light/dark mode setting |
| Stuck on loading | Check browser console (F12) for errors |

## 🔄 Forgot Password

Currently not implemented in this version. To reset a password:
1. Contact admin to manually reset in database, or
2. Create a new account with different email

## 💾 Session Management

- ✅ **Access Token**: 30 minutes validity
- ✅ **Refresh Token**: 7 days validity
- ✅ **Auto-refresh**: Happens before token expires
- ✅ **Logout**: Clears all tokens from browser
- ✅ **Remember me**: Browser cookies store tokens

## 🛡️ Default Test Mentors

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| test@example.com | password123 | mentor | General testing |

## 🧪 Testing the Sign-In Page

### Test Cases to Try:

```
1. Valid Login
   Email: test@example.com
   Password: password123
   Expected: Dashboard loads

2. Wrong Password
   Email: test@example.com
   Password: wrongpassword
   Expected: Error message

3. Non-existent Email
   Email: notfound@example.com
   Password: password123
   Expected: Error message

4. Empty Fields
   Leave fields blank
   Expected: Validation errors

5. New Account
   Click Sign Up, fill form
   Expected: Account created, can sign in
```

## 📲 Mobile Sign-In

The sign-in page works on mobile devices:
- Touch-friendly buttons and inputs
- Responsive layout adapts to screen size
- Keyboard automatically appears for inputs
- Full functionality on phones and tablets

## 🔗 Login Page URL
- Direct: http://localhost:3000/login
- From anywhere: Redirects here if not authenticated
- Logout: Returns to this page

## 📊 Behind the Scenes

When you sign in:
1. Frontend sends email + password to `/auth/signin` endpoint
2. Backend verifies credentials against database
3. Returns JWT tokens (access + refresh)
4. Frontend stores tokens in localStorage
5. Tokens used for all subsequent API calls
6. Automatic refresh before token expires

## ✅ Sign-Out

To logout:
1. Go to sidebar (usually top-right or bottom-left)
2. Click logout/profile menu
3. Click "Logout" or "Sign Out"
4. Tokens cleared from browser
5. Redirected back to login page

---

**Status**: Sign-in page fully functional ✅
**Database**: All data stored locally ✅
**Security**: Passwords hashed, JWT tokens used ✅
