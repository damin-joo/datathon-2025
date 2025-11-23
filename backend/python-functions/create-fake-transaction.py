import csv
import random
from datetime import datetime, timedelta

# Plaid category IDs (example)
category_ids = [13005000, 13005001, 13005002, 13005003, 13005004, 13005005, 13005006, 22001000, 22001001]
merchants = {
    13005000: ['Starbucks', 'Dunkin'],
    13005001: ['Amazon', 'Best Buy'],
    13005002: ['Target', 'Walmart'],
    13005003: ['Whole Foods', 'Trader Joe\'s', 'Farmers Market'],
    13005004: ['Apple Store', 'Microsoft Store'],
    13005005: ['McDonald\'s', 'Burger King'],
    13005006: ['Netflix', 'Spotify'],
    22001000: ['Uber', 'Lyft'],
    22001001: ['City Bike Share', 'Lime Scooter']
}

# Generate 200 transactions
transactions = []
start_date = datetime(2025, 11, 1)
for _ in range(200):
    cat_id = random.choice(category_ids)
    merchant = random.choice(merchants[cat_id])
    date = start_date + timedelta(days=random.randint(0, 29))
    amount = round(random.uniform(2, 1000), 2)
    transactions.append([date.strftime('%Y-%m-%d'), merchant, cat_id, amount])

# Write CSV
with open('../data/transactions.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['date', 'merchant', 'category_id', 'amount'])
    writer.writerows(transactions)

print("Fake transactions.csv generated with 200 rows.")