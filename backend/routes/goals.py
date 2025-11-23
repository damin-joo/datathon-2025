from flask import Blueprint, request, jsonify

goals_bp = Blueprint("goals_bp", __name__, url_prefix="/api/goals")

dummyGoals = [
    {"id": 1, "title": "Reduce Monthly Plastic Waste", "current": 40, "target": 100},
    {"id": 2, "title": "Increase Eco-Score", "current": 62, "target": 80},
    {"id": 3, "title": "Lower Transportation Emissions", "current": 30, "target": 60},
]

# Get user goal
@goals_bp.route("/goals", methods=["GET"])
def get_goals():
    return jsonify(dummyGoals)