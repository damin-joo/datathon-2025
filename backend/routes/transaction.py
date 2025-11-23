from flask import Blueprint, request, jsonify

transaction_bp = Blueprint("transaction_bp", __name__, url_prefix="/api/transactions")

dummyTransactions = [
    {"id": 1, "name": "Starbucks Coffee", "category": "Food & Drink", "amount": -8.75, "date": "2025-01-12"},
    {"id": 2, "name": "Whole Foods", "category": "Groceries", "amount": -54.20, "date": "2025-01-11"},
    {"id": 3, "name": "Uber Ride", "category": "Transport", "amount": -16.50, "date": "2025-01-10"},
    {"id": 4, "name": "Solar Credit", "category": "Eco Reward", "amount": 5.00, "date": "2025-01-08"},
]

@transaction_bp.route("/transactions", methods=["GET"])
def get_transactions():
    return jsonify(dummyTransactions)