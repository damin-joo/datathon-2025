from flask import Blueprint, request, jsonify

user_bp = Blueprint("user_bp", __name__, url_prefix="/api/user")

# Get user profile
@user_bp.route("/profile/<user_id>", methods=["GET"])
def profile(user_id):
    # TODO: Fetch user from BigQuery
    return jsonify({"user_id": user_id, "eco_score": 72, "eco_level": "Silver"})

# Create or update user
@user_bp.route("/create", methods=["POST"])
def create_user():
    data = request.json
    # TODO: Insert user into BigQuery
    return jsonify({"status": "success", "user": data})