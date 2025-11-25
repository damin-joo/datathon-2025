import csv
import os
import tempfile
import unittest

from app import app
from services import eco_coach


class CoachingApiTests(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.csv_path = os.path.join(self.tmp_dir.name, "transactions.csv")
        self.category_path = os.path.join(self.tmp_dir.name, "categories.csv")
        rows = [
            {"merchant": "Bike Share", "category_id": "TRANS", "amount": 12.0, "date": "2025-11-01", "user_id": "alice"},
            {"merchant": "Airport Taxi", "category_id": "TRANS", "amount": 40.0, "date": "2025-11-02", "user_id": "alice"},
            {"merchant": "City Flights", "category_id": "TRAVEL", "amount": 120.0, "date": "2025-11-03", "user_id": "alice"},
            {"merchant": "Local Market", "category_id": "GROC", "amount": 25.0, "date": "2025-11-04", "user_id": "alice"},
        ]
        with open(self.csv_path, "w", newline="") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=["merchant", "category_id", "amount", "date", "user_id"])
            writer.writeheader()
            writer.writerows(rows)

        with open(self.category_path, "w", newline="") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=["category_id", "co2e_per_dollar", "hierarchy", "group"])
            writer.writeheader()
            writer.writerow({"category_id": "TRANS", "co2e_per_dollar": "75", "hierarchy": "Transport,Transit", "group": "Transit"})
            writer.writerow({"category_id": "TRAVEL", "co2e_per_dollar": "120", "hierarchy": "Travel,Flights", "group": "Flights"})
            writer.writerow({"category_id": "GROC", "co2e_per_dollar": "15", "hierarchy": "Food,Groceries", "group": "Groceries"})

        self.original_tx = eco_coach.TRANSACTION_CSV
        self.original_cat = eco_coach.CATEGORY_CSV_PATH
        self.original_map = eco_coach.CATEGORY_MAP

        eco_coach.TRANSACTION_CSV = self.csv_path
        eco_coach.CATEGORY_CSV_PATH = self.category_path
        eco_coach.CATEGORY_MAP = eco_coach._load_category_map(self.category_path)

        self.client = app.test_client()

    def tearDown(self):
        eco_coach.TRANSACTION_CSV = self.original_tx
        eco_coach.CATEGORY_CSV_PATH = self.original_cat
        eco_coach.CATEGORY_MAP = self.original_map
        self.tmp_dir.cleanup()

    def test_suggestions_endpoint_returns_payload(self):
        resp = self.client.get("/api/coaching/suggestions?user_id=alice")
        self.assertEqual(resp.status_code, 200)
        body = resp.get_json()
        self.assertEqual(body["user_id"], "alice")
        self.assertTrue(body["profiles"])
        self.assertTrue(body["suggestions"])
        top = body["suggestions"][0]
        self.assertIn(top["env_label"], {"good", "neutral", "bad"})

    def test_acknowledge_endpoint_accepts_actions(self):
        resp = self.client.post(
            "/api/coaching/suggestions/ack",
            json={"user_id": "alice", "suggestion_id": "abc123", "action": "accepted"},
        )
        self.assertEqual(resp.status_code, 200)
        body = resp.get_json()
        self.assertEqual(body["action"], "accepted")

        resp_bad = self.client.post(
            "/api/coaching/suggestions/ack",
            json={"user_id": "alice", "action": "accepted"},
        )
        self.assertEqual(resp_bad.status_code, 400)


if __name__ == "__main__":
    unittest.main()
