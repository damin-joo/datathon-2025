"""Inference utilities for the transformer merchant classifier."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import List

DEFAULT_MODEL_DIR = os.path.join(os.path.dirname(__file__), "../../json/merchant_transformer")


@dataclass
class TransformerPrediction:
    category_id: str
    confidence: float


def transformer_available() -> bool:
    try:
        import transformers  # noqa: F401
        import torch  # noqa: F401
    except Exception:
        return False
    return os.path.isdir(DEFAULT_MODEL_DIR)


class TransformerPredictor:
    def __init__(self, model_dir: str = DEFAULT_MODEL_DIR, device: str | None = None):
        if not os.path.isdir(model_dir):
            raise RuntimeError(f"Transformer model directory not found: {model_dir}")
        try:
            from transformers import AutoModelForSequenceClassification, AutoTokenizer
        except ImportError as exc:  # pragma: no cover - optional dependency
            raise RuntimeError("transformers not installed") from exc
        import torch

        self.model_dir = model_dir
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_dir)
        self.model.to(self.device)
        self.model.eval()
        config = self.model.config
        self.id2label = config.id2label or {idx: label for label, idx in (config.label2id or {}).items()}

    @lru_cache(maxsize=1024)
    def _tokenize(self, text: str):
        return self.tokenizer(text, truncation=True, padding=True, max_length=48, return_tensors="pt")

    def predict(self, merchant: str, top_k: int = 3) -> List[TransformerPrediction]:
        import torch

        merchant = (merchant or "").strip()
        if not merchant:
            return []
        batch = self._tokenize(merchant)
        batch = {k: v.to(self.device) for k, v in batch.items()}
        with torch.no_grad():
            outputs = self.model(**batch)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)[0]
        values, indices = torch.topk(probs, min(top_k, probs.shape[-1]))
        results: List[TransformerPrediction] = []
        for score, label_idx in zip(values.tolist(), indices.tolist()):
            label = self.id2label.get(label_idx, str(label_idx))
            results.append(TransformerPrediction(category_id=label, confidence=float(score)))
        return results
