from flask import Blueprint, request, jsonify

scoring_bp = Blueprint("scoring_bp", __name__, url_prefix="/api/score")

# Calculate EcoScore
@scoring_bp.route("/calculate", methods=["POST"])
def calculate_score():
    transactions = request.json.get("transactions", [])
    # TODO: Implement carbon calculation logic
    eco_score = 80  # placeholder
    return jsonify({"eco_score": eco_score, "transactions": transactions})
