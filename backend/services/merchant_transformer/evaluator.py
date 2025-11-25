"""Utilities for comparing TF-IDF vs transformer merchant classifiers."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Dict, List, Sequence

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB

from .data_utils import DEFAULT_CSV, TrainingExample, load_examples
from .predictor import DEFAULT_MODEL_DIR as DEFAULT_TRANSFORMER_DIR


@dataclass
class EvaluationResult:
    accuracy: float
    support: int
    details: Dict[str, float]


def _prepare_split(examples: Sequence[TrainingExample], test_ratio: float, seed: int):
    if not examples:
        raise RuntimeError("no examples to evaluate")
    labels = [ex.category_id for ex in examples]
    train, test = train_test_split(
        examples,
        test_size=test_ratio,
        stratify=labels if len(set(labels)) > 1 else None,
        random_state=seed,
    )
    return train, test


def _evaluate_tfidf(train: Sequence[TrainingExample], test: Sequence[TrainingExample]) -> EvaluationResult:
    vectorizer = TfidfVectorizer(lowercase=True, ngram_range=(1, 2))
    clf = MultinomialNB(alpha=0.5)
    X_train = vectorizer.fit_transform([ex.merchant.lower() for ex in train])
    y_train = [ex.category_id for ex in train]
    clf.fit(X_train, y_train)
    X_test = vectorizer.transform([ex.merchant.lower() for ex in test])
    y_test = [ex.category_id for ex in test]
    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    return EvaluationResult(accuracy=float(acc), support=len(y_test), details={})


def _evaluate_transformer(test: Sequence[TrainingExample], model_dir: str) -> EvaluationResult | Dict[str, str]:
    if not os.path.isdir(model_dir):
        return {"available": False, "reason": f"model dir not found: {model_dir}"}
    try:
        from .predictor import TransformerPredictor
    except Exception as exc:
        return {"available": False, "reason": f"transformer imports unavailable: {exc}"}

    try:
        predictor = TransformerPredictor(model_dir=model_dir)
    except Exception as exc:
        return {"available": False, "reason": f"failed to load model: {exc}"}

    correct = 0
    for ex in test:
        preds = predictor.predict(ex.merchant, top_k=1)
        if preds and preds[0].category_id == ex.category_id:
            correct += 1
    accuracy = correct / len(test) if test else 0.0
    return EvaluationResult(accuracy=float(accuracy), support=len(test), details={})


def evaluate_classifiers(
    csv_path: str = DEFAULT_CSV,
    transformer_model_dir: str = DEFAULT_TRANSFORMER_DIR,
    test_ratio: float = 0.2,
    seed: int = 42,
    include_transformer: bool = True,
) -> Dict[str, object]:
    """Return accuracy summaries for TF-IDF and transformer classifiers."""

    examples = load_examples(csv_path)
    if not examples:
        raise RuntimeError(f"No data found at {csv_path}")
    train, test = _prepare_split(examples, test_ratio=test_ratio, seed=seed)

    tfidf_result = _evaluate_tfidf(train, test)
    payload: Dict[str, object] = {
        "samples": len(examples),
        "split": {"train": len(train), "test": len(test)},
        "tfidf": {
            "accuracy": tfidf_result.accuracy,
            "support": tfidf_result.support,
        },
    }

    if include_transformer:
        transformer_eval = _evaluate_transformer(test, transformer_model_dir)
        if isinstance(transformer_eval, EvaluationResult):
            payload["transformer"] = {
                "accuracy": transformer_eval.accuracy,
                "support": transformer_eval.support,
            }
        else:
            payload["transformer"] = transformer_eval
    return payload


def _format_markdown(results: Dict[str, object]) -> str:
    lines = ["# Merchant Classifier Evaluation", ""]
    lines.append(f"- Samples: {results.get('samples')}")
    split = results.get("split") or {}
    lines.append(f"- Train/Test split: {split.get('train')} / {split.get('test')}")
    lines.append("")
    lines.append("| Model | Accuracy | Support | Notes |")
    lines.append("| --- | --- | --- | --- |")

    def _row(name: str, data: Dict[str, object]) -> str:
        if not isinstance(data, dict):
            return f"| {name} | n/a | n/a | unexpected payload |"
        if "accuracy" in data:
            acc = data.get("accuracy")
            support = data.get("support")
            return f"| {name} | {acc:.3f} | {support} | |"
        reason = data.get("reason", "unavailable")
        return f"| {name} | n/a | n/a | {reason} |"

    lines.append(_row("TF-IDF", results.get("tfidf", {})))
    if "transformer" in results:
        lines.append(_row("Transformer", results.get("transformer", {})))

    lines.append("")
    return "\n".join(lines)


def main():  # pragma: no cover - CLI helper
    import argparse

    parser = argparse.ArgumentParser(description="Compare TF-IDF vs transformer merchants classifier")
    parser.add_argument("--csv", default=DEFAULT_CSV)
    parser.add_argument("--transformer", default=DEFAULT_TRANSFORMER_DIR)
    parser.add_argument("--no-transformer", action="store_true", help="Skip transformer evaluation")
    parser.add_argument("--test-ratio", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--out", help="Optional file path for writing results")
    parser.add_argument(
        "--format",
        choices=("json", "md"),
        default="json",
        help="Output format for stdout/file",
    )
    args = parser.parse_args()

    results = evaluate_classifiers(
        csv_path=args.csv,
        transformer_model_dir=args.transformer,
        test_ratio=args.test_ratio,
        seed=args.seed,
        include_transformer=not args.no_transformer,
    )
    if args.format == "json":
        rendered = json.dumps(results, indent=2)
    else:
        rendered = _format_markdown(results)

    print(rendered)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(rendered)


if __name__ == "__main__":  # pragma: no cover
    main()
