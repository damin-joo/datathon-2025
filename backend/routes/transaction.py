from flask import Blueprint, request, jsonify
import csv
import os

transaction_bp = Blueprint("transaction_bp", __name__)

CSV_PATH = os.path.join(os.path.dirname(__file__), '../data/transactions.csv')
CATEGORY_CSV_PATH = os.path.join(os.path.dirname(__file__), '../data/decarbon_categories.csv')


# Load category metadata (name, co2e_per_dollar) and compute an env score (1..10)
def _load_category_map():
    cat_map = {}
    try:
        with open(CATEGORY_CSV_PATH, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                cid = (row.get('category_id') or '').strip()
                if not cid:
                    continue
                # parse co2e_per_dollar, default 0.0 when missing or non-numeric
                co2_raw = (row.get('co2e_per_dollar') or '').strip()
                try:
                    co2 = float(co2_raw) if co2_raw != '' else 0.0
                except Exception:
                    co2 = 0.0

                # hierarchy field contains quoted comma-separated names; pick the last segment as the most specific name
                hier = row.get('hierarchy') or ''
                # remove stray double-quotes and split by comma
                name = hier.replace('"', '').split(',')[-1].strip() if hier else (row.get('group') or '').strip()

                cat_map[cid] = {"name": name or cid, "co2e": co2}
    except FileNotFoundError:
        # If categories file is missing, return empty map
        return {}
    except Exception:
        return {}

    # compute min/max co2e for scoring
    co2_values = [v['co2e'] for v in cat_map.values()]
    if not co2_values:
        return cat_map

    min_co2 = min(co2_values)
    max_co2 = max(co2_values)

    # scoring: 1 (best/lowest emissions) .. 10 (worst/highest emissions)
    def score_for(co2):
        try:
            if max_co2 == min_co2:
                return 5
            frac = (co2 - min_co2) / (max_co2 - min_co2)
            s = 1 + int(frac * 9)
            if s < 1:
                s = 1
            if s > 10:
                s = 10
            return s
        except Exception:
            return 5

    for cid, info in cat_map.items():
        info['env_score'] = score_for(info.get('co2e', 0.0))

    return cat_map


# load at module import so endpoints can use it
CATEGORY_MAP = _load_category_map()

@transaction_bp.route("/transactions", methods=["GET"])
def api_transactions():
    transactions = []
    try:
        with open(CSV_PATH, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for idx, row in enumerate(reader, start=1):
                cat_id = (row.get("category_id", "") or '').strip()
                cat_info = CATEGORY_MAP.get(cat_id, None)
                category_name = cat_info['name'] if cat_info else cat_id
                env_score = cat_info['env_score'] if cat_info else 5

                amount_val = 0.0
                try:
                    amount_val = float(row.get("amount", 0))
                except Exception:
                    amount_val = 0.0

                transactions.append({
                    "id": idx,
                    "name": row.get("merchant", ""),
                    "category": cat_id,
                    "category_name": category_name,
                    "env_score": env_score,
                    "amount": amount_val,
                    # keep `price` for compatibility / explicit naming
                    "price": amount_val,
                    "date": row.get("date", "")
                })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify(transactions)


@transaction_bp.route("/categories", methods=["GET"])
def api_transaction_categories():
    """Return a summary list of categories with name, co2e_per_dollar and env_score.

    Response: [{ "category_id": "13005000", "name": "Coffee Shop", "co2e": 67.0, "env_score": 3 }, ...]
    """
    try:
        out = []
        for cid, info in sorted(CATEGORY_MAP.items(), key=lambda x: x[0]):
            out.append({
                "category_id": cid,
                "name": info.get('name'),
                "co2e_per_dollar": info.get('co2e'),
                "env_score": info.get('env_score')
            })
        return jsonify(out)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@transaction_bp.route("/top", methods=["GET"])
def api_transactions_top_categories():
    """Return top categories by total CO2 impact (total_spend * co2e_per_dollar).

    Query params:
      - limit: number of categories to return (default 10)

    Response: [{ "category_id": "13005000", "name": "Coffee Shop", "total_spend": 1234.5,
                 "transaction_count": 12, "co2e_per_dollar": 67.0, "env_score": 3,
                 "total_co2e": 82651.5 }, ...]
    """
    try:
        limit = int(request.args.get('limit', 10))
    except Exception:
        limit = 10

    # aggregate transactions by category id
    agg = {}
    try:
        with open(CSV_PATH, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                cid = (row.get('category_id') or '').strip()
                try:
                    amt = float(row.get('amount', 0) or 0)
                except Exception:
                    amt = 0.0

                if cid not in agg:
                    agg[cid] = {'total_spend': 0.0, 'count': 0}
                agg[cid]['total_spend'] += amt
                agg[cid]['count'] += 1
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # build result list including category metadata
    result = []
    for cid, data in agg.items():
        cat_info = CATEGORY_MAP.get(cid, {})
        co2 = cat_info.get('co2e', 0.0)
        env_score = cat_info.get('env_score', 5)
        name = cat_info.get('name', cid)
        total_spend = data['total_spend']
        total_co2e = total_spend * co2
        result.append({
            'category_id': cid,
            'name': name,
            'total_spend': round(total_spend, 2),
            'transaction_count': data['count'],
            'co2e_per_dollar': co2,
            'env_score': env_score,
            'total_co2e': round(total_co2e, 2)
        })

    # sort by total_co2e desc
    result.sort(key=lambda x: x.get('total_co2e', 0), reverse=True)

    return jsonify(result[:max(0, limit)])


@transaction_bp.route("/total", methods=["GET"])
def api_transactions_total():
    """
    Return total spend for a given month.
    Query params:
      - month: in format YYYY-MM (e.g. 2025-11). If omitted, uses current month.

    Response: { "month": "YYYY-MM", "total": 1234.56 }
    """
    from datetime import datetime
    month_param = request.args.get("month")
    try:
        if month_param:
            # expect YYYY-MM
            target = datetime.strptime(month_param, "%Y-%m")
        else:
            target = datetime.now()
        target_year = target.year
        target_month = target.month

        total = 0.0
        with open(CSV_PATH, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                date_str = row.get("date", "")
                try:
                    d = datetime.strptime(date_str, "%Y-%m-%d")
                except Exception:
                    # skip malformed dates
                    continue
                if d.year == target_year and d.month == target_month:
                    amt = float(row.get("amount", 0))
                    total += amt

        return jsonify({"month": f"{target_year}-{str(target_month).zfill(2)}", "total": total})
    except ValueError:
        return jsonify({"error": "invalid month param, use YYYY-MM"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
