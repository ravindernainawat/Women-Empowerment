# WEIS Deployment Runbook & Cloud Guide

This guide details how to deploy the **Women Empowerment & Inclusion System (WEIS)** to production across popular cloud providers.

---

## Architecture Overview

```text
[ React 19 Frontend (Vite) ]  --->  [ FastAPI Backend ]  --->  [ MySQL 8.0 / SQLite ]
(Vercel / Netlify / Nginx)           (Render / Railway / Cloud Run)     (Cloud SQL / RDS / Volume)
```

---

## Strategy A: 1-Click Free Hosting (Recommended)

### 1. Option 1: Deploy Frontend on Netlify (100% Free, Auto-configured)
Netlify is the easiest free alternative. Because this repository includes `netlify.toml` at the root, Netlify requires **zero configuration**:
1. Log in to [Netlify](https://app.netlify.com/) (Sign up with GitHub).
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** and authorize access to `ravindernainawat/Women-Empowerment`.
4. Netlify will automatically detect:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. (Optional) Under **Environment variables**, add:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://weis-backend.onrender.com`).
6. Click **Deploy Women-Empowerment**. Within 60 seconds your site is live with free HTTPS at `https://<your-site-name>.netlify.app`!

---

### 2. Option 2: Deploy Frontend on Vercel
If you prefer Vercel (or want to use your current Vercel project):
1. In your Vercel Project Dashboard (`women-empowerment`):
2. Go to **Settings** -> **General**:
   - Scroll down to **Root Directory**.
   - Click **Edit**, enter `frontend`, and click **Save**.
3. Go to **Deployments** on the left sidebar:
   - Click **Redeploy** on the latest commit (or push a new commit to `main`).
4. In **Settings** -> **Environment Variables**:
   - Add `VITE_API_BASE_URL`: Your backend API URL.
5. Your production deployment will go live at `https://women-empowerment.vercel.app`.

---

### 3. Deploy Backend API on Render (100% Free Web Service)
Render offers a free tier for FastAPI/Python applications:
1. Log in to [Render](https://render.com/) with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your repository: `ravindernainawat/Women-Empowerment`.
4. Render will read `render.yaml` or you can verify:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Add Environment Variables:
   - `DATABASE_URL`: `sqlite:///./data/weis.db` (for quick testing) or a free managed PostgreSQL/MySQL database URL from [Neon](https://neon.tech) / [Aiven](https://aiven.io).
   - `SECRET_KEY`: Generate a 64-character secret key.
   - `CORS_ORIGINS`: Comma-separated list of your frontend URLs (e.g., `https://weis-women-empowerment.netlify.app,https://women-empowerment.vercel.app`).
   - `ENV`: `production`
6. Click **Create Web Service**. Render gives you a free live URL: `https://weis-backend.onrender.com`.

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
