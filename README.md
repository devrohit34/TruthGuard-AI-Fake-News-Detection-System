# TruthGuard — AI-Based Fake News Detection System Using NLP and BERT

A full-stack AI web application that detects whether a news article is **Fake** or **Real** using Natural Language Processing and a fine-tuned BERT Transformer model.

## Live Demo (Frontend)
The React frontend runs in the dev server. It includes a client-side NLP detection engine that mirrors the BERT pipeline (tokenization → stopword removal → lemmatization → feature extraction → classification) for instant, explainable predictions.

## Features
- Paste news text or upload .txt/.csv files for instant analysis
- Fake/Real classification with confidence percentage
- Suspicious word highlighting (inline)
- Plain-English prediction explanation
- Prediction history with search and filtering
- User authentication (register/login)
- Admin dashboard with analytics charts, user management, CSV export, and audit logs
- Model evaluation metrics (accuracy, precision, recall, F1, confusion matrix)

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS + Lucide Icons
- **Backend:** Python Flask REST API + JWT auth (in `/server`)
- **Database:** MySQL schema (in `/server/database_schema.sql`); hosted demo uses Supabase/PostgreSQL
- **AI:** Fine-tuned BERT (bert-base-uncased) + Hugging Face Transformers + PyTorch

## Project Structure
- `src/` — React frontend (pages, components, lib, NLP detection engine)
- `server/` — Python Flask API + BERT model code + training script + MySQL schema
- `docs/` — API documentation + full project documentation (ER, DFD, UML, testing, research paper)

## Running the Frontend
The dev server runs automatically. The app uses hash-based routing.

## Running the Backend + Training BERT
See `docs/PROJECT_DOCUMENTATION.md` and `server/README` comments. In short:
```bash
cd server
pip install -r requirements.txt
mysql -u root -p < database_schema.sql
python train_model.py   # needs ISOT dataset in data/
python app.py           # serves API on :5000
```

## Dataset
[ISOT Fake and Real News Dataset (Kaggle)](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset) — ~44,900 articles.

## Documentation
- `docs/API_DOCUMENTATION.md` — Full REST API reference
- `docs/PROJECT_DOCUMENTATION.md` — Complete project report (architecture, ER diagram, DFD, UML, testing, research paper format)


Developed by Rohit Kumar

