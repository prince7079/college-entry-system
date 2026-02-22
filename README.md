# College Entry System

A full-stack college entry management system with QR code, visitor management, scanning, face recognition and admin dashboard.

## Features

- **QR Code Scanning**: Scan visitor QR codes for entry/exit
- **Face Recognition**: Verify visitor identity using face recognition
- **Visitor Management**: Register, approve, and manage visitors
- **Admin Dashboard**: View statistics and entry logs
- **Authentication**: Secure login for staff and admins

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

### Frontend

- Next.js (React)
- HTML5 QR Code Scanner
- Face-API.js for face recognition
- Chart.js for statistics

## Project Structure

```text
college-entry-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── EntryLog.js
│   │   ├── User.js
│   │   └── Visitor.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── entry.js
│   │   ├── scan.js
│   │   └── visitor.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── components/
│   │   ├── FaceRecognition.js
│   │   ├── Layout.js
│   │   └── QRScanner.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── _app.js
│   │   ├── admin.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── scan.js
│   │   ├── visitor.js
│   │   └── visitors.js
│   ├── styles/
│   │   └── globals.css
│   ├── .env.local
│   ├── next.config.js
│   └── package.json
│
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Quick Start (Recommended)

Run both frontend and backend simultaneously with one command:

```bash
# Install dependencies
npm run install:all

# Start both servers
npm start
```

This will start:

- Backend API on `http://localhost:5001`
- Frontend on `http://localhost:3000`

### Manual Setup

#### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-entry
JWT_SECRET=your-secret-key
NODE_ENV=development
```

Start the backend:

```bash
npm start
# or for development
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Admin Account

After starting the server, create an admin user by sending a POST request:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@college.com",
    "password": "password123",
    "role": "admin"
  }'
```

Or use the login page - the first user can register through the API.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token

### Visitors

- `GET /api/visitor` - Get all visitors
- `POST /api/visitor` - Create visitor
- `PUT /api/visitor/:id` - Update visitor
- `DELETE /api/visitor/:id` - Delete visitor
- `PUT /api/visitor/:id/approve` - Approve visitor
- `PUT /api/visitor/:id/reject` - Reject visitor

### Entry/Exit

- `POST /api/scan/entry` - Record entry
- `POST /api/scan/exit` - Record exit
- `POST /api/scan/verify` - Verify visitor QR

### Statistics

- `GET /api/entry/stats` - Get entry statistics
- `GET /api/entry/logs` - Get entry logs

## Usage

1. **Login**: Access the admin dashboard at `/login`
2. **Add Visitors**: Register new visitors through `/visitor`
3. **Scan Entry**: Use `/scan` to record visitor entry
4. **Scan Exit**: Use `/scan` and switch to Exit mode
5. **View Stats**: Check the dashboard at `/admin` for statistics

## Deployment

Quick options to deploy this application in production:

- Using Docker Compose (recommended for simple deployments):

```bash
# Copy example env and edit values
cp .env.example .env

# Build and run
docker-compose up --build -d
```

This brings up `mongo`, `backend` (port 5001) and `frontend` (port 3000). Edit `.env` to set `JWT_SECRET` and `NEXT_PUBLIC_API_URL` for production.

- Building images separately:

```bash
docker build -t college-entry-backend -f backend/Dockerfile ./backend
docker build -t college-entry-frontend -f frontend/Dockerfile ./frontend
```

- Deploying to Heroku / similar PaaS: use the `Procfile` (runs backend). You will need to host the frontend separately (Vercel, Netlify) or serve built frontend from a CDN.

CI / CD

This repository includes GitHub Actions workflows for automatic deployments:

- Frontend: `.github/workflows/frontend-deploy.yml` — builds the Next.js app and deploys to Vercel using the `amondnet/vercel-action`. You must add the following repository secrets:
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

- Backend: `.github/workflows/backend-deploy.yml` — builds a Docker image for the backend and pushes it to Docker Hub. Add these repository secrets:
  - `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

After pushing to `main`, the workflow will run and deploy according to the configured provider. For Render or Railway, prefer connecting the repository directly in the provider UI and set environment variables there.

Socket authentication

Socket.IO connections now require a valid JWT. The frontend sends the token when initializing the socket. Make sure your production `JWT_SECRET` is set and clients obtain tokens via login.


Security notes:

- Do not commit real secrets. Use managed secret stores or CI/CD environment variables.
- Use a strong `JWT_SECRET` and rotate it when possible.
- Make sure MongoDB is not exposed publicly; use a managed DB or network restrictions.

For detailed managed deployment steps, see `DEPLOY.md`.



