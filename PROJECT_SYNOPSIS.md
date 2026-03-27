# Project Synopsis: Hybrid Entry System

## 1. Project Overview

**Project Name:** Hybrid Entry System  
**Project Type:** Full-Stack Web Application  
**Technology Stack:** MERN (MongoDB, Express, React, Node.js)

### 1.1 Introduction

The Hybrid Entry System is a comprehensive visitor management and entry tracking solution designed for educational institutions, particularly colleges. The system provides multiple authentication methods including traditional login, QR code scanning, and face recognition for seamless visitor check-in and check-out processes.

### 1.2 Objectives

- Provide a secure authentication system for staff and administrators
- Enable contactless visitor entry using QR codes
- Implement face recognition for identity verification
- Track and manage visitor statistics in real-time
- Offer a responsive admin dashboard for monitoring

---

## 2. Technical Architecture

### 2.1 Backend Architecture

**Framework:** Node.js with Express.js  
**Database:** MongoDB with Mongoose ODM  
**Authentication:** JWT (JSON Web Tokens)  
**Real-time Communication:** Socket.IO

#### Key Backend Components:

| Component | Description |
|-----------|-------------|
| `server.js` | Main Express server configuration |
| `auth.js` | JWT middleware for route protection |
| `User.js` | User model for staff/admin accounts |
| `Visitor.js` | Visitor registration and tracking |
| `EntryLog.js` | Entry/exit timestamp records |

#### API Endpoints:

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/users` - List all users (admin)

**Visitor Management:**
- `GET /api/visitor` - Get all visitors
- `POST /api/visitor` - Create new visitor
- `PUT /api/visitor/:id` - Update visitor
- `DELETE /api/visitor/:id` - Delete visitor
- `PUT /api/visitor/:id/approve` - Approve visitor
- `PUT /api/visitor/:id/reject` - Reject visitor

**Entry/Exit Scanning:**
- `POST /api/scan/entry` - Record visitor entry
- `POST /api/scan/exit` - Record visitor exit
- `POST /api/scan/verify` - Verify visitor QR code

**Statistics:**
- `GET /api/entry/stats` - Dashboard statistics
- `GET /api/entry/logs` - Entry history

### 2.2 Frontend Architecture

**Framework:** Next.js 14 (React)  
**Styling:** CSS-in-JS with inline styles  
**State Management:** React Context API  
**Real-time Updates:** Socket.IO Client

#### Key Frontend Pages:

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Staff/admin authentication |
| Home | `/` | Auto-redirect based on auth |
| Admin Dashboard | `/admin` | Statistics and entry logs |
| Visitors | `/visitors` | Manage visitor list |
| Visitor Form | `/visitor` | Register new visitor |
| Scan | `/scan` | QR code scanning interface |

---

## 3. Features Description

### 3.1 Authentication System

- **JWT-based Authentication:** Secure token-based login
- **Role-based Access:** Admin and Staff roles
- **Token Verification:** Automatic session validation
- **Secure Password Storage:** bcrypt password hashing

### 3.2 Visitor Management

- **Visitor Registration:** Create new visitor records
- **Photo Capture:** Camera integration for visitor photos
- **QR Code Generation:** Unique QR codes for each visitor
- **Approval Workflow:** Approve or reject visitors
- **Purpose Tracking:** Categorize visit reasons

### 3.3 Entry/Exit System

- **QR Code Scanning:** Quick check-in/check-out
- **Face Recognition:** Identity verification (placeholder)
- **Real-time Updates:** Socket.IO for live notifications
- **Entry Logging:** Complete audit trail

### 3.4 Admin Dashboard

- **Today's Visitors:** Current day statistics
- **Currently Inside:** Active visitors count
- **Weekly/Monthly Stats:** Historical data
- **Recent Entries:** Live entry feed

---

## 4. Database Schema

### 4.1 User Collection

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'staff',
  department: String,
  createdAt: Date
}
```

### 4.2 Visitor Collection

```javascript
{
  name: String,
  email: String,
  phone: String,
  aadharNumber: String,
  purpose: String,
  department: String,
  personToMeet: String,
  photo: String (base64),
  faceDescriptor: Array,
  qrCode: String (unique),
  status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out',
  checkInTime: Date,
  checkOutTime: Date,
  createdAt: Date
}
```

### 4.3 EntryLog Collection

```javascript
{
  visitorId: ObjectId,
  visitorName: String,
  visitorPhone: String,
  entryTime: Date,
  exitTime: Date,
  entryMethod: 'qr' | 'face',
  exitMethod: 'qr' | 'face',
  purpose: String,
  personToMeet: String,
  status: 'inside' | 'exited',
  approvedBy: ObjectId,
  entryPhoto: String,
  exitPhoto: String
}
```

---

## 5. Security Features

### 5.1 Authentication Security

- JWT tokens with 30-day expiration
- bcrypt password hashing with salt factor 10
- Protected routes with middleware
- Token extraction from Authorization header

### 5.2 API Security

- CORS configuration
- Helmet.js for HTTP headers
- Morgan for request logging
- Input validation

### 5.3 Socket.IO Security

- JWT token authentication for WebSocket connections
- User role-based room assignments
- Secure handshake process

---

## 6. Deployment

### 6.1 Development Setup

```bash
# Install dependencies
npm run install:all

# Start both servers
npm start
```

- Backend: http://localhost:5001
- Frontend: http://localhost:3000

### 6.2 Docker Deployment

```bash
docker-compose up --build -d
```

### 6.3 Production Considerations

- Set strong JWT_SECRET environment variable
- Use MongoDB Atlas or secure local MongoDB
- Configure CORS for production domains
- Enable HTTPS in production

---

## 7. Default Credentials

After deployment, create the admin user:

- **Email:** admin@college.com
- **Password:** password123

---

## 8. Project Structure

```
Hybrid Entry System/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Visitor.js
│   │   └── EntryLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── visitor.js
│   │   ├── scan.js
│   │   └── entry.js
│   ├── server.js
│   └── create-admin.js
│
├── frontend/
│   ├── components/
│   │   ├── FaceRecognition.js
│   │   ├── Layout.js
│   │   └── QRScanner.js
│   ├── context/AuthContext.js
│   ├── pages/
│   │   ├── _app.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── admin.js
│   │   ├── visitors.js
│   │   ├── visitor.js
│   │   └── scan.js
│   ├── services/api.js
│   └── styles/globals.css
│
└── README.md
```

---

## 9. Conclusion

The Hybrid Entry System provides a complete solution for college visitor management with multiple entry methods including traditional login, QR codes, and face recognition. The system is built with modern web technologies ensuring scalability, security, and real-time functionality.

---

*Generated on: February 2026*  
*Version: 1.0.0*

