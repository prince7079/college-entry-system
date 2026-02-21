# TODO: API Service Implementation Plan

## Task Summary
Connect Next.js frontend to Express.js backend with proper API service, CORS handling, and authentication.

## Steps to Complete:

### Step 1: Create API Service File (services/api.js)
- [x] Create services directory in frontend
- [x] Create api.js with:
  - Base URL configuration using NEXT_PUBLIC_API_URL
  - Modern fetch with async/await
  - Proper error handling
  - Authentication helpers
  - API endpoint methods

### Step 2: Create Environment Variables File
- [x] Create .env.local.example for frontend with NEXT_PUBLIC_API_URL

### Step 3: Update AuthContext to Use New API Service
- [x] Refactor AuthContext to use the new api.js service
- [x] Remove axios dependency or keep minimal

### Step 4: Update Login Page with API Service
- [x] Update pages/login.js to use the new login function from api.js
- [x] Login already uses AuthContext which now uses API service

### Step 5: Create Example Usage in pages/index.js
- [x] Show example of fetching data from backend

### Step 6: Update Backend CORS (if needed)
- [x] Backend CORS is already properly configured in server.js

## COMPLETED: All tasks finished!

## Files Created:
1. frontend/services/api.js - Main API service file
2. frontend/.env.local.example - Environment variables template

## Files Modified:
1. frontend/context/AuthContext.js - Now uses new API service
2. frontend/pages/index.js - Added example API fetch
3. frontend/pages/admin.js - Updated to use API service
4. frontend/pages/visitors.js - Updated to use API service
5. frontend/pages/scan.js - Updated to use API service
6. frontend/pages/visitor.js - Updated to use API service

## Notes:
- Backend runs on port 5001
- API base URL: http://localhost:5001/api
- Use NEXT_PUBLIC_API_URL environment variable
- Login endpoint: POST /api/auth/login
- All pages now use the centralized API service with automatic token handling

