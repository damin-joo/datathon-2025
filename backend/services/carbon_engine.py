import pandas as pd

# Load CSVs
transactions = pd.read_csv("../data/transactions.csv")
co2e_data = pd.read_csv("../data/decarbon_categories.csv")

# Merge transaction data with CO2e per category
transactions = transactions.merge(
    co2e_data[['category_id', 'co2e_per_dollar', 'group', 'hierarchy', 'mods']],
    left_on='merchant_category',
    right_on='category_id',
    how='left'
)

# Apply any modifier if needed
transactions['adjusted_co2e_per_dollar'] = transactions['co2e_per_dollar'] * (transactions['mods'].fillna(1))

# Calculate CO2e per transaction
transactions['co2e'] = transactions['amount'] * transactions['adjusted_co2e_per_dollar']

# Aggregate total CO2e per user
user_totals = transactions.groupby('user_id').agg(
    total_co2e=('co2e', 'sum')
).reset_index()

# Optional: category-level summary
category_summary = transactions.groupby(['category_id', 'group', 'hierarchy']).agg(
    total_co2e=('co2e', 'sum'),
    avg_co2e_per_dollar=('adjusted_co2e_per_dollar', 'mean'),
    transaction_count=('amount', 'count')
).reset_index()

print("User Totals:")
print(user_totals)

print("\nCategory Summary:")
print(category_summary.sort_values('total_co2e', ascending=False))