from flask import Blueprint, request, jsonify
import csv
import os
import math
import json
from collections import defaultdict
from datetime import datetime, timedelta

transaction_bp = Blueprint("transaction_bp", __name__)
CSV_PATH = os.path.join(os.path.dirname(__file__), "../data/transactions.csv")
CATEGORY_CSV_PATH = os.path.join(os.path.dirname(__file__), "../data/decarbon_categories.csv")
USER_PROFILE_PATH = os.path.join(os.path.dirname(__file__), "../data/user_profiles.json")

# Try to import the percentile helper from services; fall back to a local implementation if unavailable.
try:
    from backend.services.calculate_percentile import percentile_of_value  # type: ignore
except Exception:
    try:
        from services.calculate_percentile import percentile_of_value  # type: ignore
    except Exception:
        def percentile_of_value(importingData, raw_data):
            try:
                import numpy as np
            except Exception:
                if not raw_data:
                    return 0.0
                count_below = sum(1 for x in raw_data if x < importingData)
                count_equal = sum(1 for x in raw_data if x == importingData)
                return (count_below + 0.5 * count_equal) / len(raw_data) * 100.0

            raw_array = np.array(raw_data)
            if raw_array.size == 0:
                return 0.0
            count_below = np.sum(raw_array < importingData)
            count_equal = np.sum(raw_array == importingData)
            percentile = (count_below + 0.5 * count_equal) / raw_array.size * 100.0
            return float(percentile)

try:
    from backend.services.merchant_classifier import predict_category as ml_predict
except Exception:
    try:
        from services.merchant_classifier import predict_category as ml_predict
    except Exception:  # pragma: no cover - fallback for missing dependency
        def ml_predict(_merchant):
            return []


def _load_category_map():
    """Load category metadata and attach env scores."""
    cat_map = {}
    try:
        with open(CATEGORY_CSV_PATH, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                cid = (row.get("category_id") or "").strip()
                if not cid:
                    continue
                co2_raw = (row.get("co2e_per_dollar") or "").strip()
                try:
                    co2 = float(co2_raw) if co2_raw != "" else 0.0
                except Exception:
                    co2 = 0.0

                hier = row.get("hierarchy") or ""
                name = hier.replace('"', "").split(",")[-1].strip() if hier else (row.get("group") or "").strip()
                cat_map[cid] = {"name": name or cid, "co2e": co2}
    except FileNotFoundError:
        return {}
    except Exception:
        return {}

    co2_values = [v["co2e"] for v in cat_map.values()]
    if not co2_values:
        return cat_map

    min_co2 = min(co2_values)
    max_co2 = max(co2_values)

    def score_for(co2):
        try:
            if max_co2 == min_co2:
                return 5
            frac = (co2 - min_co2) / (max_co2 - min_co2)
            score = 1 + int(frac * 9)
            return max(1, min(score, 10))
        except Exception:
            return 5

    for cid, info in cat_map.items():
        info["env_score"] = score_for(info.get("co2e", 0.0))

    return cat_map


CATEGORY_MAP = _load_category_map()


def _load_user_profiles():
    try:
        with open(USER_PROFILE_PATH) as fp:
            raw = json.load(fp)
    except FileNotFoundError:
        return {}
    except Exception:
        return {}

    profiles = {}
    for entry in raw if isinstance(raw, list) else []:
        uid = (entry.get("user_id") or "").strip()
        if not uid:
            continue
        profiles[uid] = entry
    return profiles


USER_PROFILES = _load_user_profiles()


def _predict_category(merchant_name: str):
    try:
        return ml_predict(merchant_name)
    except Exception:
        return []


def _pick_prediction(merchant_name: str):
    predictions = _predict_category(merchant_name)
    if not predictions:
        return None
    top = predictions[0]
    return {"category_id": top.category_id, "confidence": round(top.confidence, 4)}


def _env_label_for_score(score):
    try:
        value = int(score)
    except Exception:
        value = 5
    if value <= 3:
        return "good"
    if value <= 7:
        return "neutral"
    return "bad"


def _profile_for_user(user_id):
    profile = USER_PROFILES.get(user_id)
    if profile:
        return profile
    local = user_id.split("@")[0]
    return {
        "user_id": user_id,
        "display_name": local or user_id,
        "persona": "Eco citizen",
        "focus_area": "Balanced habits",
        "highlight_action": "Tracking first week of emissions",
        "team": "Open cohort",
        "location": "",
    }


def _badge_for(eco_points, low_impact_ratio):
    try:
        points = float(eco_points)
    except Exception:
        points = None

    ratio = low_impact_ratio or 0.0

    if (points is not None and points >= 90) or ratio >= 0.7:
        return "Guardian"
    if (points is not None and points >= 75) or ratio >= 0.55:
        return "Trailblazer"
    if (points is not None and points >= 60) or ratio >= 0.4:
        return "Earth Ally"
    return "Sprout"


def _parse_date(value):
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except Exception:
            continue
    return None


def _streak_days(dates):
    if not dates:
        return 0
    ordered = sorted(dates)
    current = ordered[-1]
    streak = 0
    probe = current
    while probe in dates:
        streak += 1
        probe = probe - timedelta(days=1)
    return streak


def _category_mix(spend_map, total_spend):
    if not spend_map or not total_spend:
        return []
    top_entries = sorted(spend_map.items(), key=lambda item: item[1], reverse=True)[:3]
    mix = []
    for cid, spend in top_entries:
        share = spend / total_spend if total_spend else 0.0
        cat_info = CATEGORY_MAP.get(cid, {})
        mix.append({
            "category_id": cid,
            "name": cat_info.get("name", cid),
            "share": round(share, 4),
            "env_score": cat_info.get("env_score", 5),
            "spend": round(spend, 2),
        })
    return mix


def _impact_delta(value, cohort_average):
    if cohort_average is None or cohort_average == 0 or value is None:
        return None
    try:
        delta = (float(value) - float(cohort_average)) / float(cohort_average) * 100.0
        return round(delta, 1)
    except Exception:
        return None


@transaction_bp.route("/transactions", methods=["GET"])
def api_transactions():
    transactions = []
    try:
        with open(CSV_PATH, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for idx, row in enumerate(reader, start=1):
                cat_id = (row.get("category_id") or "").strip()
                cat_info = CATEGORY_MAP.get(cat_id, {})
                env_score = cat_info.get("env_score", 5)
                amount_val = row.get("amount", 0)
                try:
                    amount_val = float(amount_val)
                except Exception:
                    amount_val = 0.0

                transactions.append({
                    "id": idx,
                    "name": row.get("merchant", ""),
                    "category": cat_id,
                    "category_name": cat_info.get("name", cat_id),
                    "env_score": env_score,
                    "env_label": _env_label_for_score(env_score),
                    "user_id": row.get("user_id") or "guest",
                    "amount": amount_val,
                    "price": amount_val,
                    "date": row.get("date", "")
                })
    except FileNotFoundError:
        return jsonify([])
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify(transactions)


@transaction_bp.route("/leaderboard", methods=["GET"])
def api_leaderboard():
    """Return leaderboard of users ranked by eco points (higher is better)."""

    try:
        per_user = {}
        with open(CSV_PATH, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                uid = (row.get("user_id") or "guest")
                try:
                    amt = float(row.get("amount", 0) or 0)
                except Exception:
                    amt = 0.0
                cid = (row.get("category_id") or "").strip()
                cat_info = CATEGORY_MAP.get(cid, {})
                co2e = cat_info.get("co2e", 0.0)
                total_co2 = amt * co2e
                stats = per_user.setdefault(uid, {
                    "total_spend": 0.0,
                    "total_co2": 0.0,
                    "tx_count": 0,
                    "env_score_sum": 0.0,
                    "low_impact_count": 0,
                    "low_impact_dates": set(),
                    "active_dates": set(),
                    "category_spend": defaultdict(float),
                    "category_counts": defaultdict(int),
                })
                stats["total_spend"] += amt
                stats["total_co2"] += total_co2
                stats["tx_count"] += 1
                env_score = cat_info.get("env_score", 5)
                stats["env_score_sum"] += env_score

                tx_date = _parse_date(row.get("date", ""))
                if tx_date:
                    stats["active_dates"].add(tx_date)
                if env_score <= 4:
                    stats["low_impact_count"] += 1
                    if tx_date:
                        stats["low_impact_dates"].add(tx_date)

                if cid:
                    stats["category_spend"][cid] += amt
                    stats["category_counts"][cid] += 1

        totals = [v["total_co2"] for v in per_user.values()]
        avg_total = sum(totals) / len(totals) if totals else None
        out = []
        for uid, v in per_user.items():
            pct = percentile_of_value(v["total_co2"], totals) if totals else 0.0
            try:
                eco_points = round(100.0 - float(pct), 2)
            except Exception:
                eco_points = None

            avg_env_score = round(v["env_score_sum"] / v["tx_count"], 2) if v["tx_count"] else None
            low_impact_ratio = round(v["low_impact_count"] / v["tx_count"], 3) if v["tx_count"] else 0.0
            streak_days = _streak_days(v["low_impact_dates"])
            category_mix = _category_mix(v["category_spend"], v["total_spend"])
            top_category = category_mix[0] if category_mix else None
            impact_delta_pct = _impact_delta(v["total_co2"], avg_total)
            trend = None
            if impact_delta_pct is not None:
                if impact_delta_pct <= -5:
                    trend = "up"
                elif impact_delta_pct >= 5:
                    trend = "down"
                else:
                    trend = "steady"

            profile = _profile_for_user(uid)
            badge = profile.get("badge") or _badge_for(eco_points, low_impact_ratio)
            focus_area = profile.get("focus_area") or (f"{top_category['name']} focus" if top_category else "Balanced habits")

            out.append({
                "user_id": uid,
                "display_name": profile.get("display_name") or uid,
                "persona": profile.get("persona"),
                "team": profile.get("team"),
                "focus_area": focus_area,
                "highlight_action": profile.get("highlight_action"),
                "location": profile.get("location"),
                "avatar_color": profile.get("avatar_color"),
                "badge": badge,
                "trend": trend or "steady",
                "streak_days": streak_days,
                "low_impact_ratio": low_impact_ratio,
                "avg_env_score": avg_env_score,
                "impact_delta_pct": impact_delta_pct,
                "category_mix": category_mix,
                "top_category": top_category,
                "days_active": len(v["active_dates"]),
                "total_spend": round(v["total_spend"], 2),
                "total_co2": round(v["total_co2"], 4),
                "tx_count": v["tx_count"],
                "eco_score_percentile": round(pct, 2) if pct is not None else None,
                "eco_points": eco_points,
            })

        out.sort(key=lambda x: (x["eco_points"] is None, -(x["eco_points"] or 0)))
        for idx, entry in enumerate(out, start=1):
            entry["rank"] = idx
        try:
            limit = int(request.args.get("limit", 50))
        except Exception:
            limit = 50
        return jsonify(out[: max(0, limit)])
    except FileNotFoundError:
        return jsonify([])
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@transaction_bp.route("/transactions/categories", methods=["GET"])
def api_transaction_categories():
    try:
        out = []
        for cid, info in sorted(CATEGORY_MAP.items(), key=lambda item: item[0]):
            out.append({
                "category_id": cid,
                "name": info.get("name"),
                "co2e_per_dollar": info.get("co2e"),
                "env_score": info.get("env_score"),
            })
        return jsonify(out)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@transaction_bp.route("/transactions/top", methods=["GET"])
def api_transactions_top_categories():
    try:
        limit = int(request.args.get("limit", 10))
    except Exception:
        limit = 10

    agg = {}
    try:
        with open(CSV_PATH, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                cid = (row.get("category_id") or "").strip()
                try:
                    amt = float(row.get("amount", 0) or 0)
                except Exception:
                    amt = 0.0
                agg.setdefault(cid, {"total_spend": 0.0, "count": 0})
                agg[cid]["total_spend"] += amt
                agg[cid]["count"] += 1
    except FileNotFoundError:
        return jsonify([])
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    result = []
    for cid, data in agg.items():
        cat_info = CATEGORY_MAP.get(cid, {})
        co2 = cat_info.get("co2e", 0.0)
        env_score = cat_info.get("env_score", 5)
        total_spend = data["total_spend"]
        total_co2e = total_spend * co2
        result.append({
            "category_id": cid,
            "name": cat_info.get("name", cid),
            "total_spend": round(total_spend, 2),
            "transaction_count": data["count"],
            "co2e_per_dollar": co2,
            "env_score": env_score,
            "total_co2e": round(total_co2e, 2),
            "_total_co2e_raw": total_co2e,
        })

    result.sort(key=lambda item: item.get("total_co2e", 0), reverse=True)

    try:
        vals = [entry["_total_co2e_raw"] for entry in result]
        for entry in result:
            try:
                v = entry.get("_total_co2e_raw", 0.0)
                pct = percentile_of_value(v, vals)
                if pct is None or (isinstance(pct, float) and (math.isnan(pct) or math.isinf(pct))):
                    entry["percentile"] = None
                else:
                    entry["percentile"] = round(float(pct), 2)
            except Exception:
                entry["percentile"] = None
    except Exception:
        for entry in result:
            entry["percentile"] = None

    for entry in result:
        entry.pop("_total_co2e_raw", None)

    return jsonify(result[: max(0, limit)])


@transaction_bp.route("/transactions", methods=["POST"])
def api_add_transaction():
    """Add a new transaction, auto-classifying the category when missing."""

    data = request.get_json(silent=True) or {}
    merchant = (data.get("merchant") or "").strip()
    category_id = (data.get("category_id") or "").strip()
    amount = data.get("amount", 0.0)
    date = (data.get("date") or "").strip()
    user_id = (data.get("user_id") or "guest").strip() or "guest"

    if not merchant or not date:
        return jsonify({"error": "merchant and date are required"}), 400

    prediction_meta = None
    if not category_id:
        pred = _pick_prediction(merchant)
        if pred:
            category_id = pred["category_id"]
            prediction_meta = pred

    if not category_id:
        return jsonify({"error": "category_id is required when classifier has no prediction"}), 400

    try:
        amount = float(amount)
    except Exception:
        amount = 0.0

    try:
        file_exists = os.path.isfile(CSV_PATH)
        with open(CSV_PATH, "a", newline="") as csvfile:
            fieldnames = ["merchant", "category_id", "amount", "date", "user_id"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            if not file_exists or os.stat(CSV_PATH).st_size == 0:
                writer.writeheader()
            writer.writerow({
                "merchant": merchant,
                "category_id": category_id,
                "amount": amount,
                "date": date,
                "user_id": user_id,
            })
        resp = {"success": True}
        if prediction_meta:
            resp["predicted_category"] = prediction_meta
        return jsonify(resp), 201
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@transaction_bp.route("/transactions/classify", methods=["POST"])
def api_transactions_classify():
    payload = request.get_json(silent=True) or {}
    merchant = (payload.get("merchant") or "").strip()
    if not merchant:
        return jsonify({"error": "merchant is required"}), 400
    predictions = [
        {"category_id": prediction.category_id, "confidence": round(prediction.confidence, 4)}
        for prediction in _predict_category(merchant)
    ]
    return jsonify({"merchant": merchant, "predictions": predictions})


@transaction_bp.route("/transactions/eco-score", methods=["GET"])
def api_eco_score():
    """Return the user's eco score (percentile of total CO2 vs. all users)."""

    try:
        user_id = request.args.get("user_id")
        per_user = {}
        with open(CSV_PATH, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                uid = (row.get("user_id") or "guest")
                try:
                    amt = float(row.get("amount", 0) or 0)
                except Exception:
                    amt = 0.0
                cid = (row.get("category_id") or "").strip()
                cat_info = CATEGORY_MAP.get(cid, {})
                co2e = cat_info.get("co2e", 0.0)
                total_co2 = amt * co2e
                per_user.setdefault(uid, {"total_spend": 0.0, "total_co2": 0.0, "tx_count": 0})
                per_user[uid]["total_spend"] += amt
                per_user[uid]["total_co2"] += total_co2
                per_user[uid]["tx_count"] += 1

        totals = [info["total_co2"] for info in per_user.values()]
        target_uid = user_id or "guest"
        target_total = per_user.get(target_uid, {"total_co2": 0.0})["total_co2"]
        percentile = percentile_of_value(target_total, totals) if totals else 0.0
        try:
            eco_points = round(100.0 - float(percentile), 2)
        except Exception:
            eco_points = None
        return jsonify({
            "user_id": target_uid,
            "total_co2": target_total,
            "eco_score_percentile": percentile,
            "eco_points": eco_points,
        })
    except FileNotFoundError:
        return jsonify({"user_id": request.args.get("user_id") or "guest", "total_co2": 0, "eco_score_percentile": 0, "eco_points": 100})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@transaction_bp.route("/transactions/total", methods=["GET"])
def api_transactions_total():
    """Return total spend for a given month (YYYY-MM)."""

    from datetime import datetime

    month_param = request.args.get("month")
    try:
        if month_param:
            target = datetime.strptime(month_param, "%Y-%m")
        else:
            target = datetime.now()
        target_year = target.year
        target_month = target.month

        total = 0.0
        with open(CSV_PATH, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                date_str = row.get("date", "")
                try:
                    tx_date = datetime.strptime(date_str, "%Y-%m-%d")
                except Exception:
                    continue
                if tx_date.year == target_year and tx_date.month == target_month:
                    try:
                        amt = float(row.get("amount", 0))
                    except Exception:
                        amt = 0.0
                    total += amt

        return jsonify({"month": f"{target_year}-{str(target_month).zfill(2)}", "total": total})
    except ValueError:
        return jsonify({"error": "invalid month param, use YYYY-MM"}), 400
    except FileNotFoundError:
        return jsonify({"month": month_param or target.strftime("%Y-%m"), "total": 0.0})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

