from __future__ import annotations

from flask import Blueprint, jsonify, request

try:
    from backend.services.eco_coach import generate_coaching_payload  # type: ignore
except Exception:  # pragma: no cover
    from services.eco_coach import generate_coaching_payload  # type: ignore

coach_bp = Blueprint("coach_bp", __name__)


@coach_bp.route("/coaching/suggestions", methods=["GET"])
def api_coaching_suggestions():
    user_id = (request.args.get("user_id") or "guest").strip() or "guest"
    try:
        weeks = int(request.args.get("weeks", 4))
    except Exception:
        weeks = 4
    if weeks <= 0:
        weeks = 4
    payload = generate_coaching_payload(user_id=user_id, weeks=min(weeks, 8))
    return jsonify(payload)


@coach_bp.route("/coaching/suggestions/ack", methods=["POST"])
def api_coaching_ack():
    body = request.get_json(silent=True) or {}
    user_id = (body.get("user_id") or "guest").strip() or "guest"
    suggestion_id = (body.get("suggestion_id") or "").strip()
    action = (body.get("action") or "").strip().lower()
    if not suggestion_id or action not in {"accepted", "dismissed"}:
        return jsonify({"error": "suggestion_id and action (accepted|dismissed) are required"}), 400
    return jsonify(
        {
            "status": "recorded",
            "user_id": user_id,
            "suggestion_id": suggestion_id,
            "action": action,
        }
    )
