import csv
import os
import tempfile
import unittest

from services.merchant_transformer import evaluator


class ClassifierEvaluatorTests(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.csv_path = os.path.join(self.tmp_dir.name, "transactions.csv")
        rows = [
            {"merchant": "Bike Share", "category_id": "TRANS"},
            {"merchant": "Metro Transit", "category_id": "TRANS"},
            {"merchant": "Local Market", "category_id": "GROC"},
            {"merchant": "Super Foods", "category_id": "GROC"},
            {"merchant": "Eco Airlines", "category_id": "TRAVEL"},
            {"merchant": "City Flights", "category_id": "TRAVEL"},
        ]
        with open(self.csv_path, "w", newline="") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=["merchant", "category_id"])
            writer.writeheader()
            writer.writerows(rows)

    def tearDown(self):
        self.tmp_dir.cleanup()

    def test_tfidf_evaluation_runs(self):
        result = evaluator.evaluate_classifiers(
            csv_path=self.csv_path,
            include_transformer=False,
            test_ratio=0.5,
            seed=1,
        )
        self.assertEqual(result["samples"], 6)
        self.assertIn("tfidf", result)
        self.assertNotIn("transformer", result)
        self.assertGreaterEqual(result["tfidf"]["accuracy"], 0.0)
        self.assertEqual(result["tfidf"]["support"], 3)


if __name__ == "__main__":
    unittest.main()
