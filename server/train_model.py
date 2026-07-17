"""
TruthGuard — BERT Fine-tuning Script for Fake News Detection

Trains a bert-base-uncased model on the ISOT Fake and Real News Dataset (Kaggle).

Dataset: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset
Files:   Fake.csv, True.csv

Usage:
    pip install torch transformers scikit-learn pandas numpy nltk matplotlib
    python train_model.py

Output:
    ./model/fake_news_bert/  (saved model + tokenizer)
    ./model/metrics.json     (evaluation metrics)
    ./model/confusion_matrix.png
"""

import os
import numpy as np
import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
)
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# ---- Config ----
MODEL_NAME = "bert-base-uncased"
MAX_LEN = 256
BATCH_SIZE = 16
EPOCHS = 4
LEARNING_RATE = 2e-5
TEST_SIZE = 0.2
RANDOM_STATE = 42
OUTPUT_DIR = "./model/fake_news_bert"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs("./model", exist_ok=True)


def load_data():
    """Load and preprocess the ISOT dataset."""
    fake = pd.read_csv("data/Fake.csv")
    real = pd.read_csv("data/True.csv")

    fake["label"] = 0  # FAKE = 0
    real["label"] = 1  # REAL = 1

    # Combine text columns (title + body)
    fake["text"] = fake["title"].fillna("") + " " + fake["text"].fillna("")
    real["text"] = real["title"].fillna("") + " " + real["text"].fillna("")

    df = pd.concat([fake[["text", "label"]], real[["text", "label"]]], ignore_index=True)

    # Clean
    df = df.drop_duplicates(subset="text")
    df = df.dropna()
    df["text"] = df["text"].str.strip()
    df = df[df["text"].str.len() > 20]

    print(f"Dataset loaded: {len(df)} samples")
    print(f"  Fake: {(df['label'] == 0).sum()}")
    print(f"  Real: {(df['label'] == 1).sum()}")
    return df


def tokenize_data(texts, labels, tokenizer):
    """Tokenize texts with BERT WordPiece tokenizer."""
    encodings = tokenizer(
        texts.tolist(),
        truncation=True,
        max_length=MAX_LEN,
        padding="max_length",
        return_tensors="pt",
    )
    return {
        "input_ids": encodings["input_ids"],
        "attention_mask": encodings["attention_mask"],
        "labels": torch.tensor(labels.tolist(), dtype=torch.long),
    }


class NewsDataset(torch.utils.data.Dataset):
    def __init__(self, encodings):
        self.encodings = encodings

    def __len__(self):
        return len(self.encodings["input_ids"])

    def __getitem__(self, idx):
        return {
            "input_ids": self.encodings["input_ids"][idx],
            "attention_mask": self.encodings["attention_mask"][idx],
            "labels": self.encodings["labels"][idx],
        }


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "precision": precision_score(labels, preds),
        "recall": recall_score(labels, preds),
        "f1": f1_score(labels, preds),
    }


def plot_confusion_matrix(cm, save_path):
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(["Fake", "Real"])
    ax.set_yticklabels(["Fake", "Real"])
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(cm[i][j]), ha="center", va="center", fontsize=14, fontweight="bold")
    plt.colorbar(im)
    plt.title("Confusion Matrix — BERT Fake News Detection")
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()
    print(f"Confusion matrix saved to {save_path}")


def main():
    print("=" * 60)
    print("TruthGuard — BERT Fake News Detection Training")
    print("=" * 60)

    # 1. Load data
    df = load_data()

    # 2. Train/test split (stratified)
    train_df, test_df = train_test_split(
        df, test_size=TEST_SIZE, stratify=df["label"], random_state=RANDOM_STATE
    )
    print(f"Train: {len(train_df)} | Test: {len(test_df)}")

    # 3. Tokenize
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    train_enc = tokenize_data(train_df["text"], train_df["label"], tokenizer)
    test_enc = tokenize_data(test_df["text"], test_df["label"], tokenizer)

    train_dataset = NewsDataset(train_enc)
    test_dataset = NewsDataset(test_enc)

    # 4. Model
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=2
    )

    # 5. Training
    training_args = TrainingArguments(
        output_dir="./training_output",
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE * 2,
        learning_rate=LEARNING_RATE,
        weight_decay=0.01,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        warmup_steps=500,
        logging_steps=100,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        compute_metrics=compute_metrics,
    )

    print("Starting training...")
    trainer.train()

    # 6. Evaluate
    print("Evaluating on test set...")
    eval_results = trainer.evaluate()
    print(f"Eval results: {eval_results}")

    # 7. Confusion matrix
    preds_output = trainer.predict(test_dataset)
    preds = np.argmax(preds_output.predictions, axis=-1)
    cm = confusion_matrix(test_df["label"].values, preds)
    print(f"Confusion Matrix:\n{cm}")

    plot_confusion_matrix(cm, "./model/confusion_matrix.png")

    # 8. Save model + tokenizer
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"Model saved to {OUTPUT_DIR}")

    # 9. Save metrics
    import json
    metrics = {
        "accuracy": float(eval_results.get("eval_accuracy", 0)),
        "precision": float(eval_results.get("eval_precision", 0)),
        "recall": float(eval_results.get("eval_recall", 0)),
        "f1": float(eval_results.get("eval_f1", 0)),
        "confusion_matrix": cm.tolist(),
        "model_name": MODEL_NAME,
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "epochs": EPOCHS,
        "batch_size": BATCH_SIZE,
        "max_len": MAX_LEN,
    }
    with open("./model/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print("Metrics saved to ./model/metrics.json")
    print("Training complete!")


if __name__ == "__main__":
    main()
