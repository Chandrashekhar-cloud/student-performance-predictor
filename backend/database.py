"""
Student Performance Prediction System - Database & Auth Manager
Handles SQLite database initialization, user credentials with secure hashing (werkzeug.security),
session tokens, and prediction history tracking.
"""

import os
import sqlite3
import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.db")


def get_db_connection():
    """Create a database connection with dict-like row factory."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables and seed initial demo accounts."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            token TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Predictions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            student_name TEXT NOT NULL,
            study_hours REAL NOT NULL,
            attendance REAL NOT NULL,
            previous_score REAL NOT NULL,
            assignment_score REAL NOT NULL,
            sleep_hours REAL NOT NULL,
            predicted_score INTEGER NOT NULL,
            performance_level TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    conn.commit()

    # Seed demo users if not present
    seed_demo_accounts(cursor, conn)
    conn.close()


def seed_demo_accounts(cursor, conn):
    """Seed ready-to-use demo accounts for quick showcase and evaluation."""
    demo_users = [
        {
            "email": "student@demo.edu",
            "name": "Alex Mercer",
            "password": "demopassword",
            "role": "student",
            "token": "demo-student-token-2026",
        },
        {
            "email": "professor@demo.edu",
            "name": "Dr. Sarah Jenkins",
            "password": "demopassword",
            "role": "educator",
            "token": "demo-professor-token-2026",
        },
    ]

    for u in demo_users:
        cursor.execute("SELECT id FROM users WHERE email = ?", (u["email"],))
        existing = cursor.fetchone()
        if not existing:
            pwd_hash = generate_password_hash(u["password"])
            cursor.execute(
                """
                INSERT INTO users (email, name, password_hash, role, token)
                VALUES (?, ?, ?, ?, ?)
                """,
                (u["email"], u["name"], pwd_hash, u["role"], u["token"]),
            )
            user_id = cursor.lastrowid

            # Seed sample prediction history for the demo student
            if u["role"] == "student":
                sample_predictions = [
                    ("Alex Mercer", 6.5, 88.0, 74.0, 82.0, 7.5, 76, "Good", "Midterm evaluation"),
                    ("Alex Mercer", 8.0, 95.0, 78.0, 90.0, 7.0, 84, "Good", "Final exam preparation review"),
                    ("Alex Mercer", 5.0, 78.0, 68.0, 72.0, 6.0, 68, "Average", "Early semester baseline"),
                ]
                for sp in sample_predictions:
                    cursor.execute(
                        """
                        INSERT INTO predictions (user_id, student_name, study_hours, attendance, previous_score, assignment_score, sleep_hours, predicted_score, performance_level, notes)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (user_id, *sp),
                    )

    conn.commit()


def register_user(name, email, password, role="student"):
    """Register a new user, returning user data and session token."""
    email = email.strip().lower()
    name = name.strip()

    if not email or "@" not in email:
        return None, "A valid email address is required."
    if not name or len(name) < 2:
        return None, "Name must be at least 2 characters long."
    if not password or len(password) < 6:
        return None, "Password must be at least 6 characters long."
    if role not in ["student", "educator"]:
        role = "student"

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return None, "An account with this email already exists."

    token = f"tok_{uuid.uuid4().hex}"
    pwd_hash = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO users (name, email, password_hash, role, token)
        VALUES (?, ?, ?, ?, ?)
        """,
        (name, email, pwd_hash, role, token),
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return {
        "id": user_id,
        "name": name,
        "email": email,
        "role": role,
        "token": token,
    }, None


def login_user(email, password):
    """Authenticate user credentials and issue a new token."""
    email = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
        (email,),
    )
    user = cursor.fetchone()

    if not user or not check_password_hash(user["password_hash"], password):
        conn.close()
        return None, "Invalid email or password."

    token = f"tok_{uuid.uuid4().hex}"
    cursor.execute("UPDATE users SET token = ? WHERE id = ?", (token, user["id"]))
    conn.commit()
    conn.close()

    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "token": token,
    }, None


def get_user_by_token(token):
    """Lookup a user by session token."""
    if not token:
        return None
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, email, role, token, created_at FROM users WHERE token = ?",
        (token,),
    )
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None


def save_prediction(user_id, student_name, features, predicted_score, performance_level, notes=""):
    """Save a prediction result linked to a user account."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO predictions (
            user_id, student_name, study_hours, attendance, previous_score,
            assignment_score, sleep_hours, predicted_score, performance_level, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            student_name or "Student",
            float(features["study_hours"]),
            float(features["attendance"]),
            float(features["previous_score"]),
            float(features["assignment_score"]),
            float(features["sleep_hours"]),
            int(predicted_score),
            performance_level,
            notes or "",
        ),
    )
    conn.commit()
    record_id = cursor.lastrowid
    conn.close()
    return record_id


def get_user_predictions(user_id, limit=50):
    """Fetch prediction history for a user sorted by most recent."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT * FROM predictions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
        """,
        (user_id, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_prediction(prediction_id, user_id):
    """Delete a prediction record owned by the user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM predictions WHERE id = ? AND user_id = ?",
        (prediction_id, user_id),
    )
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted
