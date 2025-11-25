"""Merchant category classifier using TF-IDF + MultinomialNB.

The trainer reads backend/data/transactions.csv and learns to map merchant names to
category_id values. Training is inexpensive (dataset is tiny) so we lazily fit the
model the first time it is requested and cache it for subsequent predictions.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List, Tuple, TYPE_CHECKING

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

CSV_ENV_VAR = "MERCHANT_CLASSIFIER_CSV"
_DEFAULT_CSV = os.path.join(os.path.dirname(__file__), "../data/transactions.csv")
TRANSACTION_CSV = globals().get("TRANSACTION_CSV") or os.getenv(CSV_ENV_VAR, _DEFAULT_CSV)
MODEL_CACHE = globals().get("MODEL_CACHE") or os.path.join(
    os.path.dirname(__file__), "../json/merchant_classifier.joblib"
)

ENGINE_ENV_VAR = "MERCHANT_CLASSIFIER_ENGINE"
TRANSFORMER_DIR_ENV = "MERCHANT_TRANSFORMER_MODEL_DIR"
DEFAULT_TRANSFORMER_DIR = os.path.join(os.path.dirname(__file__), "../json/merchant_transformer")
ENGINE_SETTING = os.getenv(ENGINE_ENV_VAR, "auto").strip().lower()
TRANSFORMER_MODEL_DIR = os.getenv(TRANSFORMER_DIR_ENV, DEFAULT_TRANSFORMER_DIR)

if TYPE_CHECKING:  # pragma: no cover - typing aid only
    from backend.services.merchant_transformer import TransformerPredictor


@dataclass
class Prediction:
    category_id: str
    confidence: float


class MerchantCategoryClassifier:
    def __init__(self, csv_path: str = TRANSACTION_CSV) -> None:
        self.csv_path = csv_path
        self.vectorizer: TfidfVectorizer | None = None
        self.model: MultinomialNB | None = None
        self._fit()

    def _iter_rows(self) -> List[Tuple[str, str]]:
        import csv

        rows: List[Tuple[str, str]] = []
        if not os.path.exists(self.csv_path):
            return rows
        with open(self.csv_path, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                merchant = (row.get("merchant") or "").strip()
                category = (row.get("category_id") or "").strip()
                if merchant and category:
                    rows.append((merchant.lower(), category))
        return rows

    def _fit(self) -> None:
        rows = self._iter_rows()
        if not rows:
            # create a stub model that always predicts "UNKNOWN"
            self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
            self.vectorizer.fit(["unknown"])
            self.model = MultinomialNB()
            self.model.fit([[0]], ["UNKNOWN"])
            return

        merchants, categories = zip(*rows)
        self.vectorizer = TfidfVectorizer(lowercase=True, ngram_range=(1, 2))
        X = self.vectorizer.fit_transform(merchants)
        self.model = MultinomialNB(alpha=0.5)
        self.model.fit(X, categories)

        try:
            joblib.dump({"vectorizer": self.vectorizer, "model": self.model}, MODEL_CACHE)
        except Exception:
            pass

    def predict(self, merchant: str, top_k: int = 3) -> List[Prediction]:
        merchant = (merchant or "").strip()
        if not merchant or self.model is None or self.vectorizer is None:
            return []
        vec = self.vectorizer.transform([merchant.lower()])
        proba = self.model.predict_proba(vec)[0]
        classes = self.model.classes_
        pairs = sorted(zip(classes, proba), key=lambda x: x[1], reverse=True)
        output = [Prediction(category_id=cid, confidence=float(conf)) for cid, conf in pairs[:top_k]]
        return output


_classifier: MerchantCategoryClassifier | None = None
_transformer_predictor: "TransformerPredictor | None" = None
_transformer_failed = False


def get_classifier() -> MerchantCategoryClassifier:
    global _classifier
    if _classifier is not None:
        return _classifier

    if os.path.exists(MODEL_CACHE):
        try:
            artefact = joblib.load(MODEL_CACHE)
            clf = MerchantCategoryClassifier(csv_path=TRANSACTION_CSV)
            clf.vectorizer = artefact["vectorizer"]
            clf.model = artefact["model"]
            _classifier = clf
            return clf
        except Exception:
            pass

    _classifier = MerchantCategoryClassifier(csv_path=TRANSACTION_CSV)
    return _classifier


def _should_use_transformer() -> bool:
    return ENGINE_SETTING in {"auto", "transformer"}


def _get_transformer_predictor():
    global _transformer_predictor, _transformer_failed
    if _transformer_failed:
        return None
    if _transformer_predictor is not None:
        return _transformer_predictor
    if not _should_use_transformer():
        return None

    try:
        from backend.services.merchant_transformer import TransformerPredictor as TP  # type: ignore
    except Exception:
        try:
            from services.merchant_transformer import TransformerPredictor as TP  # type: ignore
        except Exception:
            _transformer_failed = True
            return None

    try:
        _transformer_predictor = TP(model_dir=TRANSFORMER_MODEL_DIR)
    except Exception:
        _transformer_failed = True
        return None
    return _transformer_predictor


def predict_category(merchant: str) -> List[Prediction]:
    merchant = (merchant or "").strip()
    if not merchant:
        return []

    if _should_use_transformer():
        predictor = _get_transformer_predictor()
        if predictor is not None:
            try:
                preds = predictor.predict(merchant, top_k=3)
                if preds:
                    return [Prediction(category_id=p.category_id, confidence=p.confidence) for p in preds]
            except Exception:
                pass

    classifier = get_classifier()
    return classifier.predict(merchant)
