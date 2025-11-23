import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # services/
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

CATEGORIES_FILE = os.path.join(DATA_DIR, "decarbon_categories.csv")
cat_df = pd.read_csv(CATEGORIES_FILE, dtype={"category_id": str}).set_index("category_id")

def get_category_info(category_id):
    if str(category_id) not in cat_df.index:
        return None
    row = cat_df.loc[str(category_id)]
    return {
        "group": row["group"],
        "co2e_per_dollar": float(row["co2e_per_dollar"])
    }

def compute_co2_grams(amount, category_id):
    info = get_category_info(category_id)
    if not info:
        return 0
    return float(amount) * info["co2e_per_dollar"]

POINTS = {"good": 10, "neutral": 0, "bad": -20}

def classify_transaction(category_id):
    info = get_category_info(category_id)
    if not info:
        return "neutral", "Unknown category"

    g = info["group"]
    co2 = info["co2e_per_dollar"]

    if g in ["renewable_energy", "public_transport"] or co2 < 0.1:
        return "good", "Sustainable category or low CO₂ intensity"

    if g in ["fast_fashion", "electronics"] or co2 > 1.0:
        return "bad", "High CO₂ intensity category"

    return "neutral", "Moderate CO₂"
