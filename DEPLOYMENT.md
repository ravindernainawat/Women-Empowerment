# WEIS Deployment Runbook & Cloud Guide

This guide details how to deploy the **Women Empowerment & Inclusion System (WEIS)** to production across popular cloud providers.

---

## Architecture Overview

```text
[ React 19 Frontend (Vite) ]  --->  [ FastAPI Backend ]  --->  [ MySQL 8.0 / SQLite ]
(Vercel / Netlify / Nginx)           (Render / Railway / Cloud Run)     (Cloud SQL / RDS / Volume)
```

---

## Strategy A: 1-Click Cloud (Recommended)

### 1. Deploy Frontend on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository: `ravindernainawat/Women-Empowerment`.
3. In **Build & Development Settings**:
   - **Root Directory**: Click **Edit** and select or type `frontend` (⚠️ Essential: Do not leave as `./` because the React/Vite app is located inside the `frontend` directory).
   - Framework Preset: **Vite** (Vercel auto-detects this once Root Directory is set to `frontend`)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. In **Environment Variables**:
   - `VITE_API_BASE_URL`: Set to your deployed backend URL (e.g., `https://weis-api.onrender.com`).
5. Click **Deploy**. Vercel will automatically read `frontend/vercel.json` and `_redirects` to enable smooth client-side routing.

### 2. Deploy Backend on Render / Railway
1. Create a **Web Service** pointing to the GitHub repo.
2. Build Settings:
   - Environment: **Python 3** (or Docker)
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `DATABASE_URL`: Your managed MySQL connection string.
   - `SECRET_KEY`: A 64-char hex string generated with `python -c "import secrets; print(secrets.token_hex(32))"`.
   - `CORS_ORIGINS`: Comma-separated URL of your Vercel frontend (e.g., `https://your-app.vercel.app`).
   - `ENV`: `production`
   - `DEBUG`: `False`

---

## Strategy B: Docker Compose (Single VPS / AWS EC2 / DigitalOcean)

To spin up the complete platform (Backend API + MySQL 8.0 + Frontend Nginx) in one command:

```bash
# 1. Clone repository
git clone https://github.com/ravindernainawat/Women-Empowerment.git
cd Women-Empowerment

# 2. Configure production secrets
cp .env.production.example .env
# Edit .env with your desired DB credentials and SECRET_KEY

# 3. Build and launch containers
docker compose up -d --build

# 4. Check status
docker compose ps
docker compose logs -f backend
```

- **Frontend**: Accessible on port `5173` (served via Nginx)
- **Backend API**: Accessible on port `8000` (FastAPI Docs on `/docs`)
- **Database**: MySQL 8.0 on port `3306`

---

## Strategy C: Serverless / Google Cloud Run

1. Build container image:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/weis-backend
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy weis-backend \
     --image gcr.io/YOUR_PROJECT_ID/weis-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars ENV=production,SECRET_KEY=YOUR_SECRET,DATABASE_URL=YOUR_DB_URL
   ```
