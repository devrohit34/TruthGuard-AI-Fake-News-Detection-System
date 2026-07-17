"""Authentication routes."""
import hashlib
import uuid

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from database import execute, query

auth_bp = Blueprint("auth", __name__)


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing = query("SELECT id FROM users WHERE email=%s", (email,), one=True)
    if existing:
        return jsonify({"error": "User already exists"}), 409

    user_id = str(uuid.uuid4())
    execute(
        "INSERT INTO users (id, email, password_hash, full_name, role) VALUES (%s,%s,%s,%s,'user')",
        (user_id, email, hash_password(password), full_name),
    )
    token = create_access_token(identity=user_id)
    return jsonify({"token": token, "user": {"id": user_id, "email": email, "role": "user"}}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = query("SELECT * FROM users WHERE email=%s", (email,), one=True)
    if not user or user["password_hash"] != hash_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=user["id"])
    return jsonify({
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "role": user["role"]},
    })


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    uid = get_jwt_identity()
    user = query("SELECT id, email, full_name, role, created_at FROM users WHERE id=%s", (uid,), one=True)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user})
