"""BERT fake-news inference with graceful fallback."""
import math
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "model", "fake_news_bert"))

_model = None
_tokenizer = None
_device = None

try:
    import torch
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    _HAS_TORCH = True
except ImportError:
    _HAS_TORCH = False


def _load_model():
    global _model, _tokenizer, _device
    if not _HAS_TORCH:
        return False

    os.makedirs(MODEL_PATH, exist_ok=True)
    try:
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        _model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
        _model.to(_device)
        _model.eval()
        return True
    except Exception:
        _model = None
        _tokenizer = None
        _device = None
        return False


STOPWORDS = set("a an the and or but for of to in on at by with from as is are was were be this that it he she they we you i have has do will not no so than too very just about up out over into more most some any all each".split())
SENSATIONAL = {"shocking": 3, "bombshell": 3, "scandal": 2.5, "outrageous": 2.5,
               "unbelievable": 2.5, "horrific": 2.5, "explosive": 2, "breaking": 1.5,
               "leaked": 2, "secret": 1.5, "conspiracy": 2.5, "hoax": 3, "corrupt": 2,
               "rigged": 2.5, "fabricated": 3, "smear": 2}
CREDIBILITY = {"according": 2, "spokesperson": 2, "official": 1.5, "statement": 1.5,
               "confirmed": 2, "reported": 1.5, "ministry": 1.5, "committee": 1.5,
               "announced": 1.5, "research": 1.5, "university": 1.5, "published": 1}


def _fallback_detect(text):
    tokens = [t.lower() for t in text.split() if t.isalpha() and t.lower() not in STOPWORDS]
    fake_signal = sum(SENSATIONAL.get(t, 0) for t in tokens)
    real_signal = sum(CREDIBILITY.get(t, 0) for t in tokens)
    diff = fake_signal - real_signal
    prob_fake = 1 / (1 + math.exp(-diff * 0.45))
    prob_real = 1 - prob_fake
    label = "Fake" if prob_fake >= 0.5 else "Real"
    suspicious = [t for t in tokens if t in SENSATIONAL][:15]
    return {
        "label": label,
        "confidence": max(prob_fake, prob_real),
        "prob_fake": prob_fake,
        "prob_real": prob_real,
        "suspicious_words": suspicious,
        "explanation": f"{'Sensational language' if fake_signal > real_signal else 'Credibility markers'} detected.",
    }


def detect_fake_news(text):
    if _model is None:
        _load_model()

    if _model is not None and _tokenizer is not None and _HAS_TORCH:
        inputs = _tokenizer(text, return_tensors="pt", truncation=True, max_length=256, padding=True).to(_device)
        with torch.no_grad():
            logits = _model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)[0]
        prob_fake = probs[0].item()
        prob_real = probs[1].item()
        label = "Fake" if prob_fake >= 0.5 else "Real"
        return {
            "label": label,
            "confidence": max(prob_fake, prob_real),
            "prob_fake": prob_fake,
            "prob_real": prob_real,
            "suspicious_words": [],
            "explanation": "Classified by fine-tuned BERT model.",
        }

    return _fallback_detect(text)
