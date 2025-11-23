from flask import Blueprint, jsonify

ranking_bp = Blueprint("ranking_bp", __name__, url_prefix="/api/rank")

# Get user rank
@ranking_bp.route("/<user_id>", methods=["GET"])
def get_rank(user_id):
    # TODO: Fetch rank from BigQuery
    return jsonify({"user_id": user_id, "rank": 42, "level": "Gold"})

# Global leaderboard
@ranking_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    # TODO: Query top 10 users from BigQuery
    leaderboard = [
        {"user_id": "1", "eco_score": 95, "level": "Platinum"},
        {"user_id": "2", "eco_score": 90, "level": "Gold"}
    ]
    return jsonify({"leaderboard": leaderboard})
