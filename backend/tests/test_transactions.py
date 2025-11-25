import csv
import importlib
import os
import tempfile
import unittest

from app import app
from routes import transaction as tx_module
from services import merchant_classifier as classifier_module


class TransactionApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.csv_path = os.path.join(self.tmp_dir.name, "transactions.csv")
        self.model_cache = os.path.join(self.tmp_dir.name, "model.joblib")
        self.original_csv_path = tx_module.CSV_PATH
        self.original_category_map = tx_module.CATEGORY_MAP
        self.original_classifier_csv = classifier_module.TRANSACTION_CSV
        self.original_classifier_cache = classifier_module.MODEL_CACHE

        tx_module.CSV_PATH = self.csv_path
        tx_module.CATEGORY_MAP = {
            "TRANS": {"name": "Transit", "co2e": 2.0, "env_score": 6},
            "GROC": {"name": "Groceries", "co2e": 0.5, "env_score": 2},
        }

        classifier_module.TRANSACTION_CSV = self.csv_path
        classifier_module.MODEL_CACHE = self.model_cache
        classifier_module._classifier = None
        importlib.reload(classifier_module)

        self.sample_rows = [
            {"merchant": "Bike Share", "category_id": "TRANS", "amount": 12.0, "date": "2025-11-01", "user_id": "bob"},
            {"merchant": "Local Market", "category_id": "GROC", "amount": 20.0, "date": "2025-11-02", "user_id": "alice"},
        ]
        with open(self.csv_path, "w", newline="") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=["merchant", "category_id", "amount", "date", "user_id"])
            writer.writeheader()
            writer.writerows(self.sample_rows)

        self.client = app.test_client()

    def tearDown(self) -> None:
        tx_module.CSV_PATH = self.original_csv_path
        tx_module.CATEGORY_MAP = self.original_category_map
        classifier_module.TRANSACTION_CSV = self.original_classifier_csv
        classifier_module.MODEL_CACHE = self.original_classifier_cache
        classifier_module._classifier = None
        self.tmp_dir.cleanup()

    def test_transactions_include_env_labels(self):
        resp = self.client.get("/api/transactions")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), len(self.sample_rows))
        labels = {item["name"]: item["env_label"] for item in data}
        self.assertEqual(labels["Bike Share"], "neutral")
        self.assertEqual(labels["Local Market"], "good")

    def test_post_transaction_appends_row(self):
        payload = {
            "merchant": "Refill Shop",
            "category_id": "GROC",
            "amount": 15.5,
            "date": "2025-11-03",
            "user_id": "alice",
        }
        resp = self.client.post("/api/transactions", json=payload)
        self.assertEqual(resp.status_code, 201)
        with open(self.csv_path, newline="") as csvfile:
            rows = list(csv.DictReader(csvfile))
        self.assertEqual(len(rows), len(self.sample_rows) + 1)
        self.assertEqual(rows[-1]["merchant"], "Refill Shop")
        self.assertEqual(rows[-1]["user_id"], "alice")

    def test_post_transaction_auto_classifies_when_missing_category(self):
        payload = {
            "merchant": "Local Market",
            "amount": 33.0,
            "date": "2025-11-05",
            "user_id": "alice",
        }
        resp = self.client.post("/api/transactions", json=payload)
        self.assertEqual(resp.status_code, 201)
        data = resp.get_json()
        self.assertIn("predicted_category", data)
        self.assertEqual(data["predicted_category"]["category_id"], "GROC")

    def test_leaderboard_ranks_lowest_impact_first(self):
        resp = self.client.get("/api/leaderboard")
        self.assertEqual(resp.status_code, 200)
        leaderboard = resp.get_json()
        self.assertGreaterEqual(len(leaderboard), 2)
        self.assertEqual(leaderboard[0]["user_id"], "alice")  # lower CO2 => higher eco points
        self.assertEqual(leaderboard[1]["user_id"], "bob")
        self.assertGreater(leaderboard[0]["eco_points"], leaderboard[1]["eco_points"])

    def test_classify_endpoint_returns_predictions(self):
        resp = self.client.post("/api/transactions/classify", json={"merchant": "Local Market"})
        self.assertEqual(resp.status_code, 200)
        body = resp.get_json()
        self.assertTrue(body["predictions"])
        self.assertEqual(body["predictions"][0]["category_id"], "GROC")


if __name__ == "__main__":
    unittest.main()
