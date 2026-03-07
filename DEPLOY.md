# Deployment Guide — Managed Platforms

This document describes recommended steps to deploy the College Entry System to managed platforms (Vercel for frontend, Render for backend) and Atlas for MongoDB.

## Overview
- Frontend: Next.js app — deploy to Vercel (recommended) or Netlify.
- Backend: Express app with Socket.IO — deploy as a Docker container to Render or a Cloud VM. Use Docker Hub or GHCR for images.
- Database: MongoDB Atlas — recommended for production.

## Prerequisites
- GitHub repository connected to your account
- Accounts: Vercel (frontend), Render (backend), Docker Hub or GitHub Packages (container registry)
- MongoDB Atlas cluster and connection string

## Required Secrets / Environment Variables
Add these to your platform or GitHub Actions secrets:

- `MONGODB_URI` — MongoDB connection string (Atlas)
- `JWT_SECRET` — strong secret for JWT signing
- `NEXT_PUBLIC_API_URL` — public API base URL for the frontend (e.g. `https://api.example.com/api`)
- `FRONTEND_ORIGIN` — full origin of frontend (e.g. `https://app.example.com`)

If using GitHub Actions to deploy:
- For Vercel: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- For Docker Hub: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` (or use GHCR PAT)

## Frontend (Vercel)
1. Import the repository into Vercel (https://vercel.com/new).
2. Set build command: `npm run build` and output directory: default (`.next`).
3. Add environment variable `NEXT_PUBLIC_API_URL` pointing to your backend API URL.
4. Deploy — Vercel will handle builds and CDN delivery.

## Backend (Render using Docker)
1. Push a Docker image to Docker Hub or GHCR. Example with Docker Hub:

```bash
docker build -t your-dockerhub-username/college-entry-backend:latest -f backend/Dockerfile ./backend
docker push your-dockerhub-username/college-entry-backend:latest
```

2. Create a new Web Service on Render and choose Docker image deployment (from Docker Hub or GHCR).
3. Set environment variables on Render: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_ORIGIN`, `NODE_ENV=production`.
4. For WebSocket support, Render handles sticky sessions; if using another provider, ensure WebSocket support or use a separate socket server.

## Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas and add a network allowlist for your platform.
2. Create a database user and copy the connection string into `MONGODB_URI`.

## GitHub Actions
The repository contains example workflows in `.github/workflows/`. To enable CI/CD:
1. Add the secrets described above to the GitHub repository settings.
2. Confirm workflow branches (e.g., `main`) match your default branch.

## Post-deploy Checks
- Verify `NEXT_PUBLIC_API_URL` points to the production backend.
- Login and confirm JWT-based Socket.IO connections succeed.
- Test entry/exit flows and confirm real-time updates on the admin dashboard.

## Rollback
- For Vercel, deployments are immutable — use the Vercel UI to rollback.
- For Render, redeploy a previous Docker tag.

## Notes
- Keep your `JWT_SECRET` safe and rotate it if needed.
- Use HTTPS and secure headers (the backend already uses `helmet`).

If you want, I can open a PR with these files and minor workflow tweaks to document where secrets must be set.
