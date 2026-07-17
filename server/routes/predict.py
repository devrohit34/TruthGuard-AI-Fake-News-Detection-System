"""Prediction routes."""
import uuid
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database import execute, query
from model.bert_detector import detect_fake_news

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/detect", methods=["POST"])
@jwt_required()
def detect():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    source = data.get("source", "manual")

    if len(text) < 10:
        return jsonify({"error": "Text too short"}), 400

    result = detect_fake_news(text)

    uid = get_jwt_identity()
    pred_id = str(uuid.uuid4())
    execute(
        """INSERT INTO predictions
           (id, user_id, input_text, label, confidence, prob_fake, prob_real,
            suspicious_words, explanation, source, created_at)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (pred_id, uid, text, result["label"], result["confidence"],
         result["prob_fake"], result["prob_real"],
         str(result["suspicious_words"]), result["explanation"], source,
         datetime.utcnow()),
    )

    return jsonify({"prediction_id": pred_id, **result})


@predict_bp.route("/history", methods=["GET"])
@jwt_required()
def history():
    uid = get_jwt_identity()
    search = request.args.get("q", "")
    label_filter = request.args.get("label", "all")

    sql = "SELECT * FROM predictions WHERE user_id=%s"
    args = [uid]
    if label_filter in ("Fake", "Real"):
        sql += " AND label=%s"
        args.append(label_filter)
    if search:
        sql += " AND input_text LIKE %s"
        args.append(f"%{search}%")
    sql += " ORDER BY created_at DESC LIMIT 200"
    rows = query(sql, tuple(args))
    return jsonify({"predictions": rows})


@predict_bp.route("/<pred_id>", methods=["DELETE"])
@jwt_required()
def delete_prediction(pred_id):
    uid = get_jwt_identity()
    execute("DELETE FROM predictions WHERE id=%s AND user_id=%s", (pred_id, uid))
    return jsonify({"deleted": pred_id})
