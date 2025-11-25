"""Generate lightweight eco coaching suggestions based on recent transactions."""

from __future__ import annotations

import csv
import os
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List

TRANSACTION_CSV_ENV = "ECO_COACH_TRANSACTIONS_CSV"
CATEGORY_CSV_ENV = "ECO_COACH_CATEGORIES_CSV"
_DEFAULT_TX = os.path.join(os.path.dirname(__file__), "../data/transactions.csv")
_DEFAULT_CATEGORY = os.path.join(os.path.dirname(__file__), "../data/decarbon_categories.csv")
TRANSACTION_CSV = globals().get("TRANSACTION_CSV") or os.getenv(TRANSACTION_CSV_ENV, _DEFAULT_TX)
CATEGORY_CSV_PATH = globals().get("CATEGORY_CSV_PATH") or os.getenv(CATEGORY_CSV_ENV, _DEFAULT_CATEGORY)


@dataclass
class CoachingSuggestion:
    suggestion_id: str
    title: str
    description: str
    category_id: str | None
    category_name: str | None
    estimated_savings_kg: float
    env_label: str
    status: str = "new"


def _load_category_map(path: str = CATEGORY_CSV_PATH):
    mapping: Dict[str, Dict[str, float | str]] = {}
    if not path or not os.path.exists(path):
        return mapping
    try:
        with open(path, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                cid = (row.get("category_id") or "").strip()
                if not cid:
                    continue
                co2_raw = (row.get("co2e_per_dollar") or "").strip()
                try:
                    co2 = float(co2_raw) if co2_raw else 0.0
                except Exception:
                    co2 = 0.0
                hier = (row.get("hierarchy") or "").replace('"', "")
                name = hier.split(",")[-1].strip() if hier else (row.get("group") or cid)
                mapping[cid] = {
                    "name": name or cid,
                    "co2e": co2,
                    "env_score": _score_for_co2(co2),
                }
    except Exception:
        return mapping
    return mapping


def _score_for_co2(value: float) -> int:
    if value <= 0:
        return 4
    if value < 10:
        return 3
    if value < 30:
        return 5
    if value < 60:
        return 7
    if value < 100:
        return 8
    return 9


CATEGORY_MAP = _load_category_map()


def _env_label(score: int | float | None) -> str:
    try:
        val = int(score or 5)
    except Exception:
        val = 5
    if val <= 3:
        return "good"
    if val <= 7:
        return "neutral"
    return "bad"


def _iter_transactions(csv_path: str | None = None):
    path = csv_path or TRANSACTION_CSV
    if not path or not os.path.exists(path):
        return
    try:
        with open(path, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                yield row
    except Exception:
        return


def build_weekly_profiles(user_id: str, max_weeks: int = 4) -> List[Dict[str, object]]:
    """Aggregate transactions into ISO week summaries for the user."""

    buckets: Dict[tuple[int, int], Dict[str, object]] = {}
    for row in _iter_transactions():
        uid = (row.get("user_id") or "guest").strip() or "guest"
        if uid != user_id:
            continue
        date_str = row.get("date", "")
        try:
            tx_date = datetime.strptime(date_str, "%Y-%m-%d")
        except Exception:
            continue
        iso_year, iso_week, _ = tx_date.isocalendar()
        key = (iso_year, iso_week)
        bucket = buckets.setdefault(
            key,
            {
                "year": iso_year,
                "week": iso_week,
                "total_spend": 0.0,
                "total_co2": 0.0,
                "category_impacts": defaultdict(float),
            },
        )
        try:
            amount = float(row.get("amount", 0) or 0)
        except Exception:
            amount = 0.0
        cat_id = (row.get("category_id") or "").strip()
        cat_info = CATEGORY_MAP.get(cat_id, {})
        co2e = float(cat_info.get("co2e", 0.0))
        impact = amount * co2e
        bucket["total_spend"] += amount
        bucket["total_co2"] += impact
        bucket["category_impacts"][cat_id or "UNKNOWN"] += impact

    profiles: List[Dict[str, object]] = []
    for key in sorted(buckets.keys(), reverse=True):
        bucket = buckets[key]
        impacts: Dict[str, float] = bucket.pop("category_impacts")  # type: ignore[assignment]
        top_categories = []
        for cat_id, total in sorted(impacts.items(), key=lambda item: item[1], reverse=True):
            info = CATEGORY_MAP.get(cat_id, {})
            env_score = info.get("env_score", 5)
            top_categories.append(
                {
                    "category_id": cat_id,
                    "category_name": info.get("name", cat_id),
                    "total_co2": round(total, 2),
                    "env_score": env_score,
                    "env_label": _env_label(env_score),
                }
            )
        bucket["top_categories"] = top_categories
        bucket["total_spend"] = round(bucket["total_spend"], 2)
        bucket["total_co2"] = round(bucket["total_co2"], 2)
        try:
            bucket["week_start"] = datetime.fromisocalendar(bucket["year"], bucket["week"], 1).strftime("%Y-%m-%d")
        except Exception:
            bucket["week_start"] = None
        profiles.append(bucket)
        if len(profiles) >= max_weeks:
            break
    return profiles


_SUGGESTION_LIB = {
    "bad": {
        "title": "Shrink high-impact purchases",
        "description": "Cut one {category} purchase this week or switch to a greener option to shave emissions quickly.",
        "savings_factor": 0.25,
    },
    "neutral": {
        "title": "Nudge toward greener picks",
        "description": "Swap a {category} spend for a lower-carbon alternative (local, seasonal, or thrifted).",
        "savings_factor": 0.15,
    },
    "good": {
        "title": "Lock in the good habits",
        "description": "Keep {category} spending steady and invite a friend to join—momentum keeps carbon low!",
        "savings_factor": 0.05,
    },
}


def _suggestions_from_profile(user_id: str, profile: Dict[str, object]) -> List[CoachingSuggestion]:
    suggestions: List[CoachingSuggestion] = []
    top_categories = profile.get("top_categories") or []
    for idx, cat in enumerate(top_categories[:3]):
        label = cat.get("env_label", "neutral")
        template = _SUGGESTION_LIB.get(label, _SUGGESTION_LIB["neutral"])
        category_name = cat.get("category_name") or "this category"
        savings_factor = template.get("savings_factor", 0.15)
        estimated = round(float(cat.get("total_co2", 0.0)) * savings_factor, 2)
        suggestion_id = f"{user_id}-{profile.get('year')}w{profile.get('week')}-{cat.get('category_id')}-{idx}"
        suggestions.append(
            CoachingSuggestion(
                suggestion_id=suggestion_id,
                title=template["title"],
                description=template["description"].format(category=category_name),
                category_id=cat.get("category_id"),
                category_name=category_name,
                estimated_savings_kg=estimated,
                env_label=label,
            )
        )
    if not suggestions:
        suggestion_id = f"{user_id}-{profile.get('year')}w{profile.get('week')}-general"
        suggestions.append(
            CoachingSuggestion(
                suggestion_id=suggestion_id,
                title="Log a low-carbon win",
                description="No recent purchases yet—plan one eco-friendly action (bike errand, veg meal) and log it to earn eco points.",
                category_id=None,
                category_name=None,
                estimated_savings_kg=1.0,
                env_label="neutral",
            )
        )
    return suggestions


def generate_coaching_payload(user_id: str, weeks: int = 4) -> Dict[str, object]:
    profiles = build_weekly_profiles(user_id, max_weeks=weeks)
    latest = profiles[0] if profiles else None
    suggestions: List[CoachingSuggestion] = []
    if latest:
        suggestions = _suggestions_from_profile(user_id, latest)
    else:
        suggestions = [
            CoachingSuggestion(
                suggestion_id=f"{user_id}-starter",
                title="Add your first eco-positive transaction",
                description="Log a recent sustainable purchase to unlock tailored coaching.",
                category_id=None,
                category_name=None,
                estimated_savings_kg=1.0,
                env_label="neutral",
            )
        ]

    return {
        "user_id": user_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "profiles": profiles,
        "suggestions": [s.__dict__ for s in suggestions],
    }