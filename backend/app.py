
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from functools import wraps
from hashlib import sha256

import psycopg
from psycopg.rows import dict_row
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load local environment variables.
load_dotenv()

app = Flask(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN", "http://localhost:5173"
).rstrip("/")
TOKEN_TTL_HOURS = int(os.getenv("TOKEN_TTL_HOURS", "24"))

allowed_origins = list({
    FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
})

CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"],
)


# ---------------- DATABASE ----------------

def get_db():
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is missing. Configure it in your environment."
        )

    return psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row,
        connect_timeout=10,
        sslmode=os.getenv("DB_SSLMODE", "require"),
    )


def init_db():
    """Create the database tables if they do not exist."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                email VARCHAR(254) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS contact_messages (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                email VARCHAR(254) NOT NULL,
                subject VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS auth_tokens (
                token_hash TEXT PRIMARY KEY,
                user_id BIGINT NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)


# ---------------- VALIDATION ----------------

def email_valid(email):
    return bool(
        re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email)
    )


# ---------------- AUTH TOKENS ----------------

def create_token(user_id):
    token = secrets.token_urlsafe(32)
    token_hash = sha256(token.encode("utf-8")).hexdigest()

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO auth_tokens
                (token_hash, user_id, expires_at)
            VALUES (%s, %s, %s)
            """,
            (
                token_hash,
                user_id,
                datetime.now(timezone.utc)
                + timedelta(hours=TOKEN_TTL_HOURS),
            ),
        )

    return token


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header.removeprefix("Bearer ").strip()

        if not token:
            return jsonify(error="Please log in first."), 401

        token_hash = sha256(token.encode("utf-8")).hexdigest()

        try:
            with get_db() as conn:
                user = conn.execute(
                    """
                    SELECT u.id, u.name, u.email
                    FROM auth_tokens t
                    JOIN users u ON u.id = t.user_id
                    WHERE t.token_hash = %s
                      AND t.expires_at > NOW()
                    """,
                    (token_hash,),
                ).fetchone()

        except Exception:
            app.logger.exception("Authentication lookup failed")
            return jsonify(
                error="Authentication service is unavailable."
            ), 503

        if not user:
            return jsonify(
                error="Session expired. Please log in again."
            ), 401

        g.user = user
        g.token_hash = token_hash

        return fn(*args, **kwargs)

    return wrapper


# ---------------- HOME & HEALTH ----------------

@app.get("/")
def home():
    return jsonify(
        service="Bite & Bloom API",
        status="running",
        health_endpoint="/api/health",
    )


@app.get("/api/health")
def health():
    try:
        with get_db() as conn:
            conn.execute("SELECT 1")

        return jsonify(
            status="ok",
            database="connected",
        ), 200

    except Exception:
        app.logger.exception("Health check failed")

        return jsonify(
            status="error",
            error="Database connection failed. Check DATABASE_URL.",
        ), 503


# ---------------- SIGNUP ----------------

@app.post("/api/auth/signup")
def signup():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not 2 <= len(name) <= 120:
        return jsonify(
            error="Name must be between 2 and 120 characters."
        ), 400

    if not email_valid(email) or len(email) > 254:
        return jsonify(error="Enter a valid email address."), 400

    if len(password) < 8:
        return jsonify(
            error="Password must contain at least 8 characters."
        ), 400

    try:
        with get_db() as conn:
            user = conn.execute(
                """
                INSERT INTO users (name, email, password_hash)
                VALUES (%s, %s, %s)
                RETURNING id, name, email
                """,
                (
                    name,
                    email,
                    generate_password_hash(password),
                ),
            ).fetchone()

        token = create_token(user["id"])

        return jsonify(
            message="Account created successfully.",
            user=dict(user),
            token=token,
        ), 201

    except psycopg.errors.UniqueViolation:
        return jsonify(
            error="An account with this email already exists. Please log in."
        ), 409

    except Exception:
        app.logger.exception("Signup failed")
        return jsonify(
            error="Could not create account. Check server logs and database configuration."
        ), 500


# ---------------- LOGIN ----------------

@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email_valid(email) or not password:
        return jsonify(
            error="Enter a valid email and password."
        ), 400

    try:
        with get_db() as conn:
            user = conn.execute(
                """
                SELECT id, name, email, password_hash
                FROM users
                WHERE email = %s
                """,
                (email,),
            ).fetchone()

        if not user or not check_password_hash(
            user["password_hash"], password
        ):
            return jsonify(
                error="Incorrect email or password."
            ), 401

        token = create_token(user["id"])

        return jsonify(
            message="Login successful.",
            user={
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
            },
            token=token,
        ), 200

    except Exception:
        app.logger.exception("Login failed")
        return jsonify(
            error="Login service is unavailable. Check database configuration."
        ), 500


# ---------------- CURRENT USER ----------------

@app.get("/api/auth/me")
@require_auth
def me():
    return jsonify(user=dict(g.user)), 200


# ---------------- LOGOUT ----------------

@app.post("/api/auth/logout")
@require_auth
def logout():
    try:
        with get_db() as conn:
            conn.execute(
                "DELETE FROM auth_tokens WHERE token_hash = %s",
                (g.token_hash,),
            )

        return jsonify(message="Logged out successfully."), 200

    except Exception:
        app.logger.exception("Logout failed")
        return jsonify(
            error="Could not log out. Please try again."
        ), 500


# ---------------- CONTACT FORM ----------------

@app.post("/api/contact")
def contact():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    subject = str(
        data.get("subject", "General question")
    ).strip()
    message = str(data.get("message", "")).strip()

    if not name or len(name) > 120:
        return jsonify(
            error="Enter a valid name (maximum 120 characters)."
        ), 400

    if not email_valid(email) or len(email) > 254:
        return jsonify(error="Enter a valid email address."), 400

    if not message or len(message) > 5000:
        return jsonify(
            error="Message is required and must be 5000 characters or fewer."
        ), 400

    allowed_subjects = {
        "General question",
        "Table reservation",
        "Private gathering",
        "Feedback",
    }

    if subject not in allowed_subjects:
        subject = "General question"

    try:
        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO contact_messages
                    (name, email, subject, message)
                VALUES (%s, %s, %s, %s)
                """,
                (name, email, subject, message),
            )

        return jsonify(
            message="Thanks! Your message has been sent."
        ), 201

    except Exception:
        app.logger.exception("Contact form submission failed")
        return jsonify(
            error="Message could not be saved. Please try again later."
        ), 500


# ---------------- LOCAL DEVELOPMENT ----------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
