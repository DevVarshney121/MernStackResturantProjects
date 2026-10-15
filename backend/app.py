import os
import re
from datetime import datetime, timedelta, timezone
from functools import wraps

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

load_dotenv()
app = Flask(__name__)
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_ORIGIN, "http://127.0.0.1:5173"]}})
DATABASE_URL = os.getenv("DATABASE_URL", "")
TOKEN_TTL_HOURS = int(os.getenv("TOKEN_TTL_HOURS", "24"))

def get_db():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is missing. Configure it in backend/.env")
    return psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=10, sslmode=os.getenv("DB_SSLMODE", "require"))

def init_db():
    with get_db() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS users (id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(254) UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())""")
        conn.execute("""CREATE TABLE IF NOT EXISTS contact_messages (id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL, subject VARCHAR(100) NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())""")
        conn.execute("""CREATE TABLE IF NOT EXISTS auth_tokens (token_hash TEXT PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())""")

def email_valid(email):
    return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email))

def create_token(user_id):
    token = secrets.token_urlsafe(32)
    from hashlib import sha256
    token_hash = sha256(token.encode()).hexdigest()
    with get_db() as conn:
        conn.execute("INSERT INTO auth_tokens(token_hash,user_id,expires_at) VALUES (%s,%s,%s)", (token_hash, user_id, datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)))
    return token

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        from hashlib import sha256
        header = request.headers.get("Authorization", "")
        token = header.removeprefix("Bearer ").strip()
        if not token:
            return jsonify(error="Please log in first."), 401
        token_hash = sha256(token.encode()).hexdigest()
        with get_db() as conn:
            row = conn.execute("SELECT u.id,u.name,u.email FROM auth_tokens t JOIN users u ON u.id=t.user_id WHERE t.token_hash=%s AND t.expires_at>NOW()", (token_hash,)).fetchone()
        if not row:
            return jsonify(error="Session expired. Please log in again."), 401
        g.user = row
        return fn(*args, **kwargs)
    return wrapper

@app.get("/api/health")
def health():
    try:
        with get_db() as conn:
            conn.execute("SELECT 1")
        return jsonify(status="ok", database="connected")
    except Exception as exc:
        app.logger.exception("Health check failed")
        return jsonify(status="error", error="Database connection failed. Check DATABASE_URL."), 503

@app.post("/api/auth/signup")
def signup():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if len(name) < 2 or len(name) > 120:
        return jsonify(error="Name must be between 2 and 120 characters."), 400
    if not email_valid(email) or len(email) > 254:
        return jsonify(error="Enter a valid email address."), 400
    if len(password) < 8:
        return jsonify(error="Password must contain at least 8 characters."), 400
    try:
        with get_db() as conn:
            user = conn.execute("INSERT INTO users(name,email,password_hash) VALUES (%s,%s,%s) RETURNING id,name,email", (name,email,generate_password_hash(password))).fetchone()
        token = create_token(user["id"])
        return jsonify(message="Account created successfully.", user=user, token=token), 201
    except psycopg.errors.UniqueViolation:
        return jsonify(error="An account with this email already exists. Please log in."), 409
    except Exception:
        app.logger.exception("Signup failed")
        return jsonify(error="Could not create account. Check the server/database configuration."), 500

@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if not email_valid(email) or not password:
        return jsonify(error="Enter a valid email and password."), 400
    try:
        with get_db() as conn:
            user = conn.execute("SELECT id,name,email,password_hash FROM users WHERE email=%s", (email,)).fetchone()
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify(error="Incorrect email or password."), 401
        token = create_token(user["id"])
        return jsonify(message="Login successful.", user={"id":user["id"],"name":user["name"],"email":user["email"]}, token=token)
    except Exception:
        app.logger.exception("Login failed")
        return jsonify(error="Login service is unavailable. Check database configuration."), 500

@app.get("/api/auth/me")
@require_auth
def me():
    return jsonify(user=dict(g.user))

@app.post("/api/auth/logout")
@require_auth
def logout():
    from hashlib import sha256
    token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    with get_db() as conn:
        conn.execute("DELETE FROM auth_tokens WHERE token_hash=%s", (sha256(token.encode()).hexdigest(),))
    return jsonify(message="Logged out successfully.")

@app.post("/api/contact")
def contact():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    subject = str(data.get("subject", "General question")).strip()
    message = str(data.get("message", "")).strip()
    if not name or len(name)>120 or not email_valid(email) or not message or len(message)>5000:
        return jsonify(error="Please provide a valid name, email and message (maximum 5000 characters)."), 400
    if subject not in {"General question", "Table reservation", "Private gathering", "Feedback"}:
        subject = "General question"
    try:
        with get_db() as conn:
            conn.execute("INSERT INTO contact_messages(name,email,subject,message) VALUES (%s,%s,%s,%s)", (name,email,subject,message))
        return jsonify(message="Thanks! Your message has been sent."), 201
    except Exception:
        app.logger.exception("Contact form submission failed")
        return jsonify(error="Message could not be saved. Please try again later."), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG", "false").lower()=="true")
