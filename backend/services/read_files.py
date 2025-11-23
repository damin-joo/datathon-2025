import pandas as pd
import os
from usd_to_cad import convert_usd_to_cad

ROUTE_TO_TRANSACTION_DATA = os.path.join("..", "data", "transactions.csv")
ROUTE_TO_CARBON_DATA = os.path.join("..", "data", "decarbon_categories.csv")
USD_TOCAD_API_URL = "http://127.0.0.1:5000/api/convert"

def main():
    total_score = calculate_cumulated_carbon_score()
    if total_score is not None:
        print(f"Transaction data read successfully. Total carbon score (CAD): {total_score}")
    else:
        print("Failed to read transaction data.")

def read_carbon_data():
    try:
        df = pd.read_csv(ROUTE_TO_CARBON_DATA)
        df = df[["category_id", "co2e_per_dollar"]]
        return df
    except Exception as e:
        print(f"Error importing carbon data: {e}")
        return None

def calculate_carbon_score(category_id, carbon_df):
    try:
        if category_id in carbon_df["category_id"].tolist():
            return carbon_df.loc[carbon_df["category_id"] == category_id, "co2e_per_dollar"].values[0]
        else:
            return 0
    except Exception as e:
        print(f"Error calculating carbon score for {category_id}: {e}")
        return 0

def calculate_cumulated_carbon_score():
    try:
        carbon_df = read_carbon_data()
        if carbon_df is None:
            return None

        transaction_df = pd.read_csv(ROUTE_TO_TRANSACTION_DATA)
        if "category_id" not in transaction_df.columns or "amount" not in transaction_df.columns:
            print("Transaction CSV missing required columns.")
            return None

        # Calculate total CO2e for each transaction (score * amount)
        transaction_df["carbon_score"] = transaction_df.apply(
            lambda row: calculate_carbon_score(row["category_id"], carbon_df) * row["amount"], axis=1
        )

        total_co2e_usd = transaction_df["carbon_score"].sum()
        total_co2e_cad = convert_usd_to_cad(total_co2e_usd)

        return total_co2e_cad

    except Exception as e:
        print(f"Error reading transaction data: {e}")
        return None

if __name__ == "__main__":
    main()