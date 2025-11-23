import pandas as pd

# Load CSVs
transactions = pd.read_csv("transactions.csv")
co2e_data = pd.read_csv("co2e_categories.csv")

# Low-impact alternatives (example mapping)
low_impact = {
    'fast_fashion': 0.1,
    'electronics': 0.05,
    'rideshare': 0.02,
    'groceries': 0.03,
    'public_transport': 0.01,
    'renewable_energy': 0.0
}

# Merge CO2e data
transactions = transactions.merge(
    co2e_data[['category_id', 'co2e_per_dollar', 'group', 'hierarchy', 'mods']],
    left_on='merchant_category',
    right_on='category_id',
    how='left'
)

transactions['adjusted_co2e_per_dollar'] = transactions['co2e_per_dollar'] * transactions['mods'].fillna(1)
transactions['co2e'] = transactions['amount'] * transactions['adjusted_co2e_per_dollar']

# Classification
high_impact_categories = ['fast_fashion', 'electronics', 'rideshare']
essential_sustainable_categories = ['groceries', 'public_transport', 'renewable_energy']

def classify(row):
    if row['co2e_per_dollar'] < 0.1 or row['group'] in essential_sustainable_categories:
        return 'good', 'Low CO2 or sustainable essential'
    elif row['group'] in high_impact_categories or row['co2e_per_dollar'] > 1:
        return 'bad', 'High CO2 or high-impact industry'
    else:
        return 'neutral', 'Moderate impact'

transactions[['classification', 'reason']] = transactions.apply(classify, axis=1, result_type='expand')

# Eco points
def score_transaction(row):
    if row['classification'] == 'good':
        return 10
    elif row['classification'] == 'bad':
        return -20
    else:
        return 0

transactions['eco_points'] = transactions.apply(score_transaction, axis=1)

# CO2 saved calculation
transactions['low_impact_co2e'] = transactions['group'].map(low_impact).fillna(transactions['co2e_per_dollar'])
transactions['co2_saved'] = (transactions['co2e_per_dollar'] - transactions['low_impact_co2e']) * transactions['amount']
transactions['co2_saved'] = transactions['co2_saved'].clip(lower=0)

# Aggregate per user
user_scores = transactions.groupby('user_id').agg(
    total_points=('eco_points', 'sum'),
    total_co2e=('co2e', 'sum'),
    total_co2_saved=('co2_saved', 'sum'),
    good_count=('classification', lambda x: (x=='good').sum()),
    bad_count=('classification', lambda x: (x=='bad').sum())
).reset_index()

# Percentile & badges
user_scores['percentile'] = user_scores['total_points'].rank(pct=True) * 100

def assign_badge(pct):
    if pct >= 99:
        return 'Echo Elite'
    elif pct >= 90:
        return 'Planet Guardian'
    elif pct >= 75:
        return 'Green Advocate'
    else:
        return 'Eco Starter'

user_scores['badge'] = user_scores['percentile'].apply(assign_badge)

# --- Category info page ---
category_info = co2e_data.copy()
category_info['sustainability'] = category_info['group'].apply(
    lambda g: 'good' if g in essential_sustainable_categories else ('bad' if g in high_impact_categories else 'neutral')
)
category_info['notes'] = category_info['mods'].fillna('No special notes')

print(user_scores)
print(category_info)