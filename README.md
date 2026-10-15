# Bite & Bloom — React + Flask + PostgreSQL

## Requirements
- Node.js 18+ and npm
- Python 3.10+
- A PostgreSQL database (Neon is a convenient hosted option)

## 1. Set up PostgreSQL
Create a PostgreSQL project/database in your provider dashboard and copy its connection string. Use SSL-enabled connection details.

## 2. Configure Flask
Open a terminal in the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
python -m pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to the connection string from your database provider. Never commit this file. Tables are created automatically when the health endpoint is checked? To initialize them, run the command below from `backend` after configuring `.env`:

```powershell
python -c "from app import init_db; init_db(); print('Database tables created')"
python app.py
```

Flask runs at `http://127.0.0.1:5000`. Check `http://127.0.0.1:5000/api/health`.

## 3. Set up React
Open a second terminal at the project root (not the backend folder):

```powershell
npm install
copy .env.example .env
npm run dev
```

Vite runs at `http://localhost:5173`. Login, signup and contact forms send requests to Flask and save data in PostgreSQL. Signup requires a password of at least 8 characters.

## Commands summary (Windows PowerShell)
```powershell
# Terminal 1 — backend
cd backend
python -m venv venv
.\venv\Scripts\activate
python -m pip install -r requirements.txt
copy .env.example .env
# Edit backend/.env before continuing
python -c "from app import init_db; init_db(); print('Database tables created')"
python app.py

# Terminal 2 — frontend, from the project root
npm install
copy .env.example .env
npm run dev
```

## Deployment notes
- Frontend on Vercel: set `VITE_API_URL` to your deployed API base URL if frontend and API are separate.
- Flask API on Vercel: configure `DATABASE_URL` as a Vercel environment variable, plus `FRONTEND_ORIGIN` to your deployed frontend origin. The Python function entrypoint is `api/index.py`. Verify Vercel's current Python runtime support and function packaging before deploying.
- For local development, `VITE_API_URL=http://127.0.0.1:5000`.
- Do not commit `.env` files. If credentials were exposed, rotate them immediately.
- This starter uses a bearer token in browser localStorage for simplicity. For production, consider secure HttpOnly cookies, rate limiting, email verification, and password reset.
