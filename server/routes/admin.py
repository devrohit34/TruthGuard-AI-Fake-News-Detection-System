"""Admin routes."""
import csv
import io

from flask import Blueprint, Response, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database import execute, query

admin_bp = Blueprint("admin", __name__)


def is_admin(uid):
    user = query("SELECT role FROM users WHERE id=%s", (uid,), one=True)
    return user and user["role"] == "admin"


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    uid = get_jwt_identity()
    if not is_admin(uid):
        return jsonify({"error": "Admin access required"}), 403

    total_users = query("SELECT COUNT(*) as c FROM users", one=True)["c"]
    total_preds = query("SELECT COUNT(*) as c FROM predictions", one=True)["c"]
    fake = query("SELECT COUNT(*) as c FROM predictions WHERE label='Fake'", one=True)["c"]
    real = query("SELECT COUNT(*) as c FROM predictions WHERE label='Real'", one=True)["c"]

    return jsonify({"total_users": total_users, "total_predictions": total_preds,
                    "fake": fake, "real": real})


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def users():
    uid = get_jwt_identity()
    if not is_admin(uid):
        return jsonify({"error": "Admin access required"}), 403
    rows = query("SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC")
    return jsonify({"users": rows})


@admin_bp.route("/users/<user_id>/role", methods=["PUT"])
@jwt_required()
def update_role(user_id):
    admin_uid = get_jwt_identity()
    if not is_admin(admin_uid):
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json(silent=True) or {}
    new_role = data.get("role", "user")
    if new_role not in ("admin", "user"):
        return jsonify({"error": "Invalid role"}), 400
    execute("UPDATE users SET role=%s WHERE id=%s", (new_role, user_id))
    execute("INSERT INTO admin_logs (admin_id, action, detail) VALUES (%s,%s,%s)",
            (admin_uid, "change_role", f"User {user_id} -> {new_role}"))
    return jsonify({"updated": user_id, "role": new_role})


@admin_bp.route("/logs", methods=["GET"])
@jwt_required()
def logs():
    uid = get_jwt_identity()
    if not is_admin(uid):
        return jsonify({"error": "Admin access required"}), 403
    rows = query("SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 50")
    return jsonify({"logs": rows})


@admin_bp.route("/export", methods=["GET"])
@jwt_required()
def export_csv():
    uid = get_jwt_identity()
    if not is_admin(uid):
        return jsonify({"error": "Admin access required"}), 403
    rows = query(
        """SELECT p.id, p.created_at, u.email, p.label, p.confidence,
                  p.prob_fake, p.prob_real
           FROM predictions p JOIN users u ON p.user_id=u.id
           ORDER BY p.created_at DESC"""
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "created_at", "email", "label", "confidence", "prob_fake", "prob_real"])
    for r in rows:
        writer.writerow([r["id"], r["created_at"], r["email"], r["label"],
                         r["confidence"], r["prob_fake"], r["prob_real"]])
    return Response(output.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment; filename=predictions.csv"})
