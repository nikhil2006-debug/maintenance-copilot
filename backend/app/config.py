import os

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./maintenance_copilot.db")