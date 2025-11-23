import pandas as pd
import numpy as np

EXISTING_DATA_PATH = "../data/1110022301-eng.csv"

def calculate_percentile_vs_total():
    df = pd.read_csv(EXISTING_DATA_PATH, header=12)
    df.describe()
    df = df[df["Household expenditures, summary-level categories"]=="Total expenditure"].tolist()

    print(df)
    """
    Calculate percentile-like scores of each row relative to the
    'Total expenditure' row (row-wise mean), scaled 0-100.
    """
    numeric_cols = df.columns[1:]  # skip category column

    # Compute row means
    df["row_mean"] = df[numeric_cols].mean(axis=1)

    # Get total expenditure mean
    total_mean = df.loc[df.iloc[:,0] == "Total expenditure", "row_mean"].values[0]

    # Scale all row means relative to total mean
    row_means = df["row_mean"]
    # Scale: 50 = total mean
    max_val = row_means.max()
    min_val = row_means.min()
    df["percentile_vs_total"] = 50 + (row_means - total_mean) / (max_val - min_val) * 50
    # Clamp 0-100
    df["percentile_vs_total"] = df["percentile_vs_total"].clip(0, 100)

    df.drop(columns=["row_mean"], inplace=True)
    return df

def main():
    df_with_percentile = calculate_percentile_vs_total()
    print(df_with_percentile.head())

if __name__ == "__main__":
    main()
