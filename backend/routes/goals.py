from flask import Blueprint, request, jsonify

goals_bp = Blueprint("goals_bp", __name__, url_prefix="/api/goals")

# Set user goal
@goals_bp.route("/set", methods=["POST"])
def set_goal():
    data = request.json
    # TODO: Save goal to BigQuery
    return jsonify({"status": "success", "goal": data})

# Get user goal
@goals_bp.route("/<user_id>", methods=["GET"])
def get_goal(user_id):
    # TODO: Fetch goal from BigQuery
    return jsonify({
        "user_id": user_id,
        "weekly_goal": 22.0,
        "monthly_goal": 100.0,
        "weekly_progress": 36.2
    })
