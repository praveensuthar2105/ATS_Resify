# OAuth2 Google Configuration & Troubleshooting Guide

## Issue Summary
Google OAuth is not working. This guide provides step-by-step instructions to fix it.

---

## ✅ Prerequisites Check

### 1. **Google OAuth Credentials Setup**
You need to create OAuth 2.0 credentials in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → Select **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"**
4. Add Authorized JavaScript origins:
   - `http://localhost:8081`
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:5175`
5. Add Authorized redirect URIs:
   - `http://localhost:8081/login/oauth2/code/google`
   - `http://localhost:5173/auth/callback`
6. Copy **Client ID** and **Client Secret**

---

## 🔧 Backend Configuration

### Step 1: Set Environment Variables (Windows PowerShell)

**Option A: Temporary (for current session only)**
```powershell
$env:GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET="your-client-secret-here"
$env:JWT_SECRET="aVeryStrongSecretKeyForJWTThatIsAtLeast256BitsLongAndSecure1234567890"
```

**Option B: Permanent (add to start script)**
Edit `start-backend.ps1`:
```powershell
$env:GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET="your-client-secret-here"
$env:JWT_SECRET="aVeryStrongSecretKeyForJWTThatIsAtLeast256BitsLongAndSecure1234567890"
$env:DB_URL="jdbc:mysql://localhost:3306/resume_builder_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD=""
```

### Step 2: Verify Backend Configuration
In `application.properties`:
```spring-boot-properties
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:}
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
```

### Step 3: Restart Backend
```powershell
# Kill existing process on port 8081
Get-Process | Where-Object {$_.ProcessName -eq "java"} | Stop-Process -Force

# Start backend with environment variables set
cd Backend
mvn clean package -DskipTests
mvn spring-boot:run
```

---

## 🎯 Frontend Configuration

### Step 1: Verify CORS Settings
In `application.properties`:
```spring-boot-properties
spring.web.cors.allowed-origins=http://localhost:5174,http://localhost:5173,http://localhost:5175,http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### Step 2: Check Frontend URLs
In `Navbar.jsx`, the login redirect should be:
```javascript
window.location.href = 'http://localhost:8081/oauth2/authorization/google';
```

### Step 3: AuthCallback Page
Ensure `AuthCallback.jsx` exists and handles the token:
- Receives `token`, `name`, `email` from redirect
- Stores in localStorage
- Redirects to dashboard

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Login with Google" button
4. Look for:
   - Request to `/oauth2/authorization/google`
   - Redirect to Google login
   - Redirect back to `/auth/callback?token=...`

### Step 2: Check Backend Logs
Look for messages like:
```
Successfully authenticated with provider: google
User saved/updated: sutharaarti1863@gmail.com
JWT token generated successfully
```

### Step 3: Verify OAuth Handler
Check `OAuth2LoginSuccessHandler.java` logs:
- Print email received
- Confirm role assignment (ADMIN for special email)
- JWT token generation

### Step 4: Test OAuth Endpoint
```powershell
# Test if OAuth2 endpoint is accessible
curl http://localhost:8081/oauth2/authorization/google -v
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Redirect URI mismatch" Error
**Cause**: Registered redirect URI doesn't match the one used in code.
**Solution**:
1. Go to Google Cloud Console
2. Edit OAuth credentials
3. Ensure these URIs are registered:
   - `http://localhost:8081/login/oauth2/code/google`
   - `http://localhost:5173/auth/callback`

### Issue 2: "Client ID is invalid" Error
**Cause**: GOOGLE_CLIENT_ID environment variable not set.
**Solution**:
```powershell
# Verify environment variable is set
$env:GOOGLE_CLIENT_ID
# If empty, set it again and restart backend
```

### Issue 3: "CORS error" When Redirecting
**Cause**: Origin not in allowed list.
**Solution**:
```spring-boot-properties
# Add your frontend URL to CORS config
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:5174
```

### Issue 4: Token Not Received at Frontend
**Cause**: AuthCallback page not rendering or token not stored.
**Solution**:
1. Check if `AuthCallback.jsx` exists
2. Verify it's reading URL parameters correctly:
```javascript
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
```
3. Check localStorage:
```javascript
// In browser console
localStorage.getItem('authToken')
```

### Issue 5: Login Button Not Working
**Cause**: onClick handler not properly configured.
**Solution**:
```javascript
const handleLogin = () => {
    // Must redirect to backend OAuth endpoint
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
};
```

---

## ✨ Special Privileges

**Email**: `sutharaarti1863@gmail.com`  
**Role**: `ADMIN`  
**Privileges**: Full access to admin panel and all features

When this email logs in via Google OAuth:
1. `OAuth2LoginSuccessHandler` detects the email
2. Sets role to `ADMIN` automatically
3. JWT token includes admin role
4. User can access `/admin` panel

---

## 🔐 Testing Checklist

- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] Environment variables set: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] Backend running on port 8081
- [ ] Frontend running on port 5173
- [ ] CORS settings include both URLs
- [ ] AuthCallback.jsx page exists and renders
- [ ] Click "Login with Google" redirects to Google
- [ ] After login, token received and stored
- [ ] Special email receives ADMIN role
- [ ] User can access dashboard after login

---

## 📋 Quick Start Script (Windows PowerShell)

Save this as `setup-oauth.ps1`:

```powershell
# Set OAuth Credentials
$env:GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_HERE"
$env:GOOGLE_CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE"
$env:JWT_SECRET = "aVeryStrongSecretKeyForJWTThatIsAtLeast256BitsLongAndSecure1234567890"

# Kill existing Java processes
Get-Process | Where-Object {$_.ProcessName -eq "java"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "Client ID: $env:GOOGLE_CLIENT_ID" -ForegroundColor Cyan
Write-Host "Starting backend..." -ForegroundColor Yellow

# Navigate and start backend
cd Backend
mvn clean package -DskipTests
mvn spring-boot:run
```

Run with:
```powershell
.\setup-oauth.ps1
```

---

## 📞 Support

If OAuth still doesn't work:
1. Check all environment variables are set
2. Verify Google Cloud Console credentials
3. Check browser console for errors
4. Check backend logs for exceptions
5. Verify CORS configuration
6. Test with curl if needed

