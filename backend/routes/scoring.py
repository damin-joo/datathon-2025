# Compute 7 day CO2 and simple eco score
from flask import Blueprint, session, jsonify
# from services.local_db import load_transactions
from datetime import datetime, timedelta

scoring_bp = Blueprint("scoring", __name__)

dummyData = [
    {"month": "Jan", "score": 42},
    {"month": "Feb", "score": 48},
    {"month": "Mar", "score": 55},
    {"month": "Apr", "score": 61},
    {"month": "May", "score": 58},
    {"month": "Jun", "score": 67},
    {"month": "Jul", "score": 72},
]

dummyScores = [
    {"id": 1, "category": "Transportation", "impact": -12},
    {"id": 2, "category": "Electricity Usage", "impact": 20},
    {"id": 3, "category": "Waste Reduction", "impact": 14},
    {"id": 4, "category": "Food Consumption", "impact": -5},
    {"id": 5, "category": "Shopping Habits", "impact": 8},
]

@scoring_bp.route("/monthly-scores", methods=["GET"])
def get_monthly_scores():
    return jsonify(dummyData)

@scoring_bp.route("/scores", methods=["GET"])
def get_scores():
    return jsonify(dummyScores)