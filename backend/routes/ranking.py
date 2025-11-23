# Leaderboard route
from flask import Blueprint, jsonify
# from services.local_db import load_transactions

ranking_bp = Blueprint("ranking", __name__)

dummyRanking = [
    {"id": 1, "name": "Alice Kim", "score": 892, "rank": 1},
    {"id": 2, "name": "Ben Torres", "score": 874, "rank": 2},
    {"id": 3, "name": "Clara Wu", "score": 861, "rank": 3},
    {"id": 4, "name": "Daniel Park", "score": 830, "rank": 4},
    {"id": 5, "name": "Eli Johnson", "score": 804, "rank": 5},
    {"id": 6, "name": "Fatima Ali", "score": 790, "rank": 6},
    {"id": 7, "name": "George Liu", "score": 775, "rank": 7},
    {"id": 8, "name": "Heather Lee", "score": 760, "rank": 8},
    {"id": 9, "name": "Ian Foster", "score": 742, "rank": 9},
    {"id": 10, "name": "Jenny Cho", "score": 731, "rank": 10},
]

@ranking_bp.route("/rankings", methods=["GET"])
def get_rankings():
    return jsonify(dummyRanking)