"""Fine-tune a DistilBERT classifier for merchant categories."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List, Sequence

from .data_utils import DEFAULT_CSV, TrainingExample, build_label_mapping, load_examples

DEFAULT_MODEL_NAME = "distilbert-base-uncased"
DEFAULT_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../../json/merchant_transformer")


@dataclass
class MerchantDataset:
    """Torch dataset wrapper lazily importing torch when iterated."""

    encodings: dict
    labels: List[int]

    def __getitem__(self, idx):  # pragma: no cover - runtime dependency on torch
        import torch

        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):  # pragma: no cover
        return len(self.labels)


def _train_test_split(examples: Sequence[TrainingExample], test_ratio: float = 0.2):
    from sklearn.model_selection import train_test_split

    return train_test_split(examples, test_size=test_ratio, stratify=[ex.category_id for ex in examples])


def train_transformer_classifier(
    csv_path: str = DEFAULT_CSV,
    output_dir: str = DEFAULT_OUTPUT_DIR,
    model_name: str = DEFAULT_MODEL_NAME,
    epochs: int = 3,
    learning_rate: float = 5e-5,
    seed: int = 42,
):
    """Train a classifier and persist tokenizer + weights to ``output_dir``."""

    try:
        from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments
    except ImportError as exc:  # pragma: no cover - optional dependency
        raise RuntimeError("transformers is required for training") from exc

    examples = load_examples(csv_path)
    if not examples:
        raise RuntimeError(f"No merchant data found at {csv_path}")

    label2id, id2label = build_label_mapping(examples)
    train_examples, eval_examples = _train_test_split(examples)

    tokenizer = AutoTokenizer.from_pretrained(model_name)

    def _encode(examples_subset):
        texts = [ex.merchant for ex in examples_subset]
        encodings = tokenizer(texts, truncation=True, padding=True, max_length=48)
        labels = [label2id[ex.category_id] for ex in examples_subset]
        return MerchantDataset(encodings, labels)

    train_dataset = _encode(train_examples)
    eval_dataset = _encode(eval_examples)

    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=len(label2id),
        id2label=id2label,
        label2id=label2id,
    )

    os.makedirs(output_dir, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        learning_rate=learning_rate,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        seed=seed,
        report_to=[]
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
    )
    trainer.train()

    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    metrics = trainer.evaluate()
    metrics_path = os.path.join(output_dir, "metrics.json")
    import json

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    return {"metrics": metrics, "label2id": label2id, "id2label": id2label}


if __name__ == "__main__":  # pragma: no cover - convenience CLI
    import argparse

    parser = argparse.ArgumentParser(description="Train the transformer merchant classifier")
    parser.add_argument("--csv", default=DEFAULT_CSV)
    parser.add_argument("--output", default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--model", default=DEFAULT_MODEL_NAME)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=5e-5)
    args = parser.parse_args()

    train_transformer_classifier(
        csv_path=args.csv,
        output_dir=args.output,
        model_name=args.model,
        epochs=args.epochs,
        learning_rate=args.lr,
    )
