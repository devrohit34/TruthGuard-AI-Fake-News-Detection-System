"""Database connection layer with MySQL support and SQLite fallback."""
import os
import sqlite3
import pymysql
from flask import g

DB_BACKEND = os.getenv("DB_BACKEND", "sqlite").lower()
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "truthguard"),
    "cursorclass": pymysql.cursors.DictCursor,
}
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "truthguard.db"))


def _normalize_sql(sql: str) -> str:
    return sql.replace("%s", "?")


def init_db_schema(db):
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS predictions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            input_text TEXT NOT NULL,
            title TEXT,
            label TEXT NOT NULL,
            confidence REAL NOT NULL,
            prob_fake REAL NOT NULL,
            prob_real REAL NOT NULL,
            suspicious_words TEXT,
            explanation TEXT,
            source TEXT NOT NULL DEFAULT 'manual',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            summary TEXT,
            data TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS admin_logs (
            id TEXT PRIMARY KEY,
            admin_id TEXT,
            action TEXT NOT NULL,
            detail TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    db.commit()


def get_db():
    if "db" not in g:
        try:
            if DB_BACKEND == "sqlite":
                conn = sqlite3.connect(SQLITE_DB_PATH)
                conn.row_factory = sqlite3.Row
            else:
                conn = pymysql.connect(**DB_CONFIG)
                conn.cursorclass = pymysql.cursors.DictCursor
        except Exception:
            conn = sqlite3.connect(SQLITE_DB_PATH)
            conn.row_factory = sqlite3.Row
        g.db = conn
        init_db_schema(g.db)
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def query(sql, args=(), one=False):
    db = get_db()
    cur = db.cursor()
    normalized_sql = _normalize_sql(sql)
    cur.execute(normalized_sql, tuple(args))
    rows = cur.fetchall()
    db.commit()
    cur.close()
    return (rows[0] if rows else None) if one else rows


def execute(sql, args=()):
    db = get_db()
    cur = db.cursor()
    normalized_sql = _normalize_sql(sql)
    cur.execute(normalized_sql, tuple(args))
    db.commit()
    last_id = cur.lastrowid
    cur.close()
    return last_id
