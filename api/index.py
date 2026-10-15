# Vercel Python Function entrypoint for the Flask API.
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
from app import app  # noqa: E402,F401
