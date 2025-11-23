# Compute 7 day CO2 and simple eco score
from flask import Blueprint, session, jsonify
from datetime import datetime, timedelta
import os
import csv

scoring_bp = Blueprint("scoring", __name__)

# Keep the existing dummy endpoints for history/impact lists
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
    # Maintain backward compatibility: return the simple impact list
    return jsonify(dummyScores)


# New endpoint: compute an overall eco score for the user based on transactions
# This uses category CO2 per dollar to compute total CO2 impact for all transactions
# and then computes the percentile of that total among category totals (shared algorithm).
@scoring_bp.route("/score", methods=["GET"])
def get_overall_score():
    # locate transaction CSV and category mapping via the transaction route module if available
    try:
        from backend.routes.transaction import CSV_PATH, CATEGORY_MAP
    except Exception:
        try:
            from routes.transaction import CSV_PATH, CATEGORY_MAP
        except Exception:
            CSV_PATH = os.path.join(os.path.dirname(__file__), '../data/transactions.csv')
            CATEGORY_MAP = {}

    # import percentile helper with fallback
    try:
        from backend.services.calculate_percentile import percentile_of_value  # type: ignore
    except Exception:
        try:
            from services.calculate_percentile import percentile_of_value  # type: ignore
        except Exception:
            def percentile_of_value(val, arr):
                if not arr:
                    return 0.0
                count_below = sum(1 for x in arr if x < val)
                count_equal = sum(1 for x in arr if x == val)
                return (count_below + 0.5 * count_equal) / len(arr) * 100.0

    # aggregate category totals and compute user's total CO2 and spend
    try:
        category_co2_rates = []
        user_total_co2 = 0.0
        user_total_spend = 0.0

        # build list of category CO2 per dollar values for reference
        for cid, info in CATEGORY_MAP.items():
            try:
                val = float(info.get('co2e', 0.0) or 0.0)
            except Exception:
                val = 0.0
            category_co2_rates.append(val)

        with open(CSV_PATH, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
                    amt = float(row.get('amount', 0) or 0)
                except Exception:
                    amt = 0.0
                cid = (row.get('category_id') or '').strip()
                co2_per_dollar = CATEGORY_MAP.get(cid, {}).get('co2e', 0.0)
                total_co2 = amt * (co2_per_dollar or 0.0)
                user_total_co2 += total_co2
                user_total_spend += amt

        # compute user's average CO2 per dollar (guard zero spend)
        avg_co2_per_dollar = (user_total_co2 / user_total_spend) if user_total_spend > 0 else 0.0

        # if we have category rates, compute percentile of user's avg rate among them
        if category_co2_rates:
            p = percentile_of_value(avg_co2_per_dollar, category_co2_rates)
            # p is the percentile rank (0-100) of the user's avg CO2 rate among category rates
            percentile = max(0.0, min(100.0, float(p)))
        else:
            percentile = 50.0

        # Return percentile directly and keep `score` equal to percentile for compatibility.
        return jsonify({
            "score": round(float(percentile), 2),
            "percentile": round(float(percentile), 2),
            "total_co2e": round(float(user_total_co2), 2),
            "avg_co2_per_dollar": round(float(avg_co2_per_dollar), 6),
            "total_spend": round(float(user_total_spend), 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500