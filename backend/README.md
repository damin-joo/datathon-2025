# Backend Service

## Resources
- Carbon Emission Data: https://decarbonapp.com/data/

## Stack
- Flask + Flask-CORS
- Google BigQuery client (used in data ingestion utilities)

## Setup & Run
- Python version: 3.12.3
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py  # starts server on http://127.0.0.1:5000
```

The frontend expects the API to be reachable at `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://127.0.0.1:5000`).

## API Overview
All endpoints are served under `/api`:

| Endpoint | Method | Description |
| --- | --- | --- |
| `/transactions` | GET | List enriched transactions (category name, env score/label, user id). |
| `/transactions` | POST | Append `{merchant, category_id?, amount, date, user_id}` (auto-fills `category_id` via ML classifier when omitted). |
| `/transactions/categories` | GET | List category metadata (`co2e_per_dollar`, `env_score`). |
| `/transactions/top` | GET | Aggregate top emitting categories. |
| `/transactions/total?month=YYYY-MM` | GET | Monthly spend total. |
| `/transactions/eco-score?user_id=alice` | GET | Per-user CO₂ total, percentile, and eco points. |
| `/transactions/classify` | POST | Return top predicted categories for a merchant `{merchant}`. |
| `/leaderboard` | GET | Rank users globally by eco points (lower CO₂ → higher points). |
| `/coaching/suggestions` | GET | Return recent weekly profiles plus personalized eco coaching ideas. |
| `/coaching/suggestions/ack` | POST | Record whether a suggestion was accepted or dismissed. |
| `/goals`, `/monthly-scores`, `/score` | GET | Goal and scoring data for dashboard widgets. |

### Leaderboard metadata

The `/leaderboard` endpoint now attaches persona and trend metadata to every row so the frontend no longer needs fallback demo data. Each entry contains:

- `display_name`, `persona`, `team`, `focus_area`, `highlight_action`, `location`, `avatar_color`
- Derived stats such as `badge`, `streak_days`, `low_impact_ratio`, `avg_env_score`, `impact_delta_pct`, `category_mix`, `rank`, and `top_category`

Profile details live in `data/user_profiles.json`. Add or edit an object in that file to override how a given `user_id` should appear. Any user missing from the JSON still receives auto-generated defaults (the service humanizes the email/local-part and infers the badge from eco points and low-impact ratios).

### Merchant classifier

The `/transactions` POST route now falls back to a lightweight merchant classifier whenever `category_id` is omitted. Two engines are available:

- **TF-IDF + Naive Bayes** (default, zero-dependency, trains on demand). Artifacts: `backend/json/merchant_classifier.joblib`.
- **DistilBERT transformer** (set `MERCHANT_CLASSIFIER_ENGINE=transformer` or leave at `auto` once a model exists). Artifacts live under `backend/json/merchant_transformer/` (override with `MERCHANT_TRANSFORMER_MODEL_DIR`) and are trained via `python -m services.merchant_transformer.trainer --csv backend/data/transactions.csv --output backend/json/merchant_transformer`.

You can point both trainers at a different dataset by exporting `MERCHANT_CLASSIFIER_CSV=/path/to/transactions.csv` (TF-IDF) and/or `MERCHANT_CLASSIFIER_CSV` before training the transformer as well. Use `/transactions/classify` to inspect predictions directly:

```bash
curl -X POST http://127.0.0.1:5000/api/transactions/classify \
  -H 'Content-Type: application/json' \
  -d '{"merchant": "Local Market"}'

# compare TF-IDF vs transformer accuracy (prints JSON)
python -m services.merchant_transformer.evaluator --csv backend/data/transactions.csv

# write a markdown summary for CI artifacts
python -m services.merchant_transformer.evaluator \
  --csv backend/data/transactions.csv \
  --out backend/json/classifier_report.md \
  --format md

### Eco coaching

The `/coaching/suggestions` endpoint aggregates each user's recent ISO weeks of spending/carbon data and returns a few ranked coaching ideas (e.g., trim high-impact purchases, keep good habits). It relies on the same CSV data source and category metadata as the transaction routes. Optional query params:

- `user_id`: defaults to `guest`.
- `weeks`: max number of historical weeks to include (capped at 8).

Use `/coaching/suggestions/ack` to record whether the user accepted or dismissed an idea—handy for future reinforcement logic.
```

## Tests
Minimal regression tests cover the CSV-backed transaction routes, including the classifier-powered POST flow and `/transactions/classify` endpoint.

```bash
cd backend
source .venv/bin/activate  # if not already active
python -m unittest tests/test_transactions.py
```