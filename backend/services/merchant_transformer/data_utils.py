"""Utilities for preparing merchant classification datasets."""

from __future__ import annotations

import csv
import os
from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence, Tuple

DEFAULT_CSV = os.path.join(os.path.dirname(__file__), "../../data/transactions.csv")


@dataclass
class TrainingExample:
    merchant: str
    category_id: str


def load_examples(csv_path: str = DEFAULT_CSV) -> List[TrainingExample]:
    """Return de-duplicated merchant/category examples from the CSV."""

    rows: List[TrainingExample] = []
    seen: set[Tuple[str, str]] = set()
    if not os.path.exists(csv_path):
        return rows

    with open(csv_path, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            merchant = (row.get("merchant") or "").strip()
            category = (row.get("category_id") or "").strip()
            if not merchant or not category:
                continue
            key = (merchant.lower(), category)
            if key in seen:
                continue
            seen.add(key)
            rows.append(TrainingExample(merchant=merchant, category_id=category))
    return rows


def build_label_mapping(examples: Sequence[TrainingExample]) -> Tuple[Dict[str, int], Dict[int, str]]:
    labels = sorted({ex.category_id for ex in examples})
    id2label = {idx: label for idx, label in enumerate(labels)}
    label2id = {label: idx for idx, label in id2label.items()}
    return label2id, id2label


def summarize_dataset(examples: Sequence[TrainingExample]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for ex in examples:
        counts[ex.category_id] = counts.get(ex.category_id, 0) + 1
    return counts
