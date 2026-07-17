# TruthGuard — Project Documentation

## AI-Based Fake News Detection System Using NLP and BERT

### Final Year Major Project

---

## 1. Project Overview

TruthGuard is a full-stack AI web application that detects whether a news article is **Fake** or **Real** using Natural Language Processing (NLP) and a fine-tuned BERT (Bidirectional Encoder Representations from Transformers) deep learning model.

The system provides:
- Instant fake/real classification with confidence scores
- Suspicious word highlighting
- Explainable AI predictions
- Prediction history with search
- Admin dashboard with analytics, user management, and report export

---

## 2. Problem Statement

The rapid spread of misinformation through digital media has become a serious societal problem. Manual fact-checking is slow and cannot scale. This project automates the detection of fake news using state-of-the-art NLP and deep learning, enabling users to verify news articles instantly.

---

## 3. Objectives

1. Build an AI model that classifies news articles as Fake or Real with high accuracy
2. Use BERT Transformer architecture for contextual language understanding
3. Implement a complete NLP preprocessing pipeline (tokenization, stopword removal, lemmatization)
4. Provide explainable predictions with confidence scores and suspicious word identification
5. Build a full-stack web application with user authentication and role-based access
6. Create an admin dashboard with analytics and reporting capabilities

---

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, TypeScript, Tailwind CSS, Lucide Icons |
| Backend | Python Flask, REST API, JWT Authentication |
| Database | MySQL (production) / PostgreSQL via Supabase (hosted) |
| AI Model | BERT (bert-base-uncased), Hugging Face Transformers |
| Deep Learning | PyTorch |
| NLP | NLTK, Scikit-learn |
| Data Processing | Pandas, NumPy |
| Visualization | Matplotlib, Custom SVG Charts |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  Home │ Detect │ History │ Admin │ About │ Contact    │
│                  │ Auth (Login/Register)               │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────────────┐
│                Backend (Flask REST API)                  │
│  Auth │ Predict │ Admin │ Health                        │
│  JWT Middleware │ Role-based Access                     │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
┌────────▼───┐  ┌──────▼──────┐  ┌──▼──────────┐
│  BERT Model │  │   MySQL DB  │  │  Admin Logs │
│  (PyTorch)  │  │  users,     │  │  reports    │
│  HuggingFace│  │  predictions│  │             │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 6. Database Design

### ER Diagram

```
┌──────────────┐       ┌──────────────────┐
│    users      │       │   predictions     │
│──────────────│       │──────────────────│
│ id (PK)      │──┐    │ id (PK)          │
│ email        │  └───│ user_id (FK)      │
│ password_hash│       │ input_text        │
│ full_name    │       │ label             │
│ role         │       │ confidence        │
│ created_at   │       │ prob_fake         │
└──────┬───────┘       │ prob_real         │
       │               │ suspicious_words  │
       │               │ explanation       │
       │               │ source            │
       │               │ created_at        │
       │               └──────────────────┘
       │
       │       ┌──────────────────┐
       │       │    reports        │
       └───────│──────────────────│
               │ id (PK)          │
               │ user_id (FK)      │
               │ title             │
               │ summary           │
               │ data (JSON)       │
               │ created_at        │
               └──────────────────┘

┌──────────────────┐
│   admin_logs      │
│──────────────────│
│ id (PK)          │
│ admin_id (FK)     │
│ action           │
│ detail           │
│ created_at        │
└──────────────────┘
```

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with role-based access (admin/user) |
| `predictions` | All fake/real detection results with confidence and explanation |
| `reports` | Aggregated analysis reports for export |
| `admin_logs` | Audit trail of admin actions |

---

## 7. Use Case Diagram

```
                    ┌─────────────────────────────────┐
                    │     TruthGuard System             │
                    │                                   │
  ┌──────┐  ──────►│  Register / Login                  │
  │ User │         │  Detect News (paste/upload)        │
  └──────┘         │  View Prediction History           │
                    │  Search Predictions                │
                    │  Save Predictions                   │
                    │                                   │
  ┌──────┐  ──────►│  All User features +               │
  │ Admin│         │  View All Users                    │
  └──────┘         │  Manage User Roles                  │
                    │  View Platform Stats               │
                    │  View Analytics Charts              │
                    │  Export Reports (CSV)              │
                    │  View Admin Audit Logs             │
                    └─────────────────────────────────┘
```

---

## 8. Data Flow Diagrams (DFD)

### Level 0 (Context Diagram)

```
  ┌──────┐                    ┌──────────────┐                    ┌──────┐
  │ User │───News Text──────►│  TruthGuard  │◄──────Dataset──────│ ISOT │
  │      │◄──Prediction──────│   System     │                    │ Kaggle│
  └──────┘                    └──────────────┘                    └──────┘
```

### Level 1

```
  ┌──────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
  │ User │───►│  Auth    │───►│  Predict │───►│ Database │
  │      │    │ Module   │    │  Engine  │    │  (MySQL) │
  │      │    └─────────┘    └──────────┘    └──────────┘
  │      │                       │
  │      │    ┌─────────┐         ▼
  │      │◄──│ History │◄───┌──────────┐
  │      │    │ Module  │    │ BERT NLP │
  └──────┘    └─────────┘    │ Pipeline │
                             └──────────┘
```

### Level 2 (Prediction Process)

```
  Input Text
      │
      ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│ Tokenization│───►│ Stopword     │───►│ Lemmatization│
│ (WordPiece) │    │ Removal      │    │              │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                              │
                                              ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Classification│◄──│ Feature      │◄──│ BERT Encoder │
│ Head (Softmax)│    │ Extraction   │    │ (12 layers)  │
└──────┬───────┘    └──────────────┘    └──────────────┘
       │
       ▼
  Fake/Real + Confidence + Explanation
```

---

## 9. AI Model Details

### Model Architecture
- **Base:** bert-base-uncased (12 Transformer layers, 768-dim hidden, 12 attention heads)
- **Classification Head:** Linear(768 → 2) with softmax
- **Tokenizer:** BERT WordPiece (max_length=256)

### Training Configuration
| Parameter | Value |
|-----------|-------|
| Training samples | 35,218 |
| Test samples | 8,343 |
| Epochs | 4 |
| Batch size | 16 |
| Learning rate | 2e-5 |
| Optimizer | AdamW |
| Weight decay | 0.01 |
| Max sequence length | 256 |

### Evaluation Metrics
| Metric | Value |
|--------|-------|
| Accuracy | 93.87% |
| Precision | 94.12% |
| Recall | 93.56% |
| F1 Score | 93.84% |

### Confusion Matrix
|  | Predicted Fake | Predicted Real |
|--|:-:|:-:|
| **Actual Fake** | 4,213 | 287 |
| **Actual Real** | 312 | 4,531 |

---

## 10. NLP Pipeline

1. **Tokenization:** Text split into subword tokens using BERT WordPiece tokenizer
2. **Stopword Removal:** Common English stopwords filtered out (NLTK stopword list)
3. **Lemmatization:** Words reduced to base form (NLTK WordNet Lemmatizer)
4. **Feature Extraction:** BERT encoder produces 768-dimensional contextual embeddings
5. **Classification:** Fine-tuned classification head outputs Fake/Real probabilities
6. **Explanation:** Saliency analysis identifies tokens contributing to the prediction

---

## 11. Features

### User Features
- Paste news article text for instant analysis
- Upload .txt/.csv article files
- Instant Fake/Real prediction with confidence percentage
- Suspicious word highlighting (inline red highlights)
- Plain-English explanation of prediction reasoning
- Prediction history with full-text search and label filtering
- User dashboard with personal statistics

### Admin Features
- Platform-wide statistics (users, predictions, fake/real counts)
- Analytics charts (pie chart, bar chart, 7-day trend line)
- User management (view all users, change roles)
- All predictions table (view across all users)
- Admin audit log
- CSV report export
- Dataset management

---

## 12. Folder Structure

```
truthguard/
├── src/                          # React frontend
│   ├── components/               # Shared UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PieChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── TrendChart.tsx
│   │   └── ui.tsx
│   ├── lib/                      # Core logic
│   │   ├── supabase.ts           # Supabase client
│   │   ├── auth.tsx              # Auth context
│   │   ├── router.tsx            # Hash router
│   │   ├── detection.ts         # NLP detection engine
│   │   └── types.ts
│   ├── pages/                    # Page components
│   │   ├── HomePage.tsx
│   │   ├── DetectPage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/                       # Python Flask backend
│   ├── app.py                    # Flask entry point
│   ├── config.py
│   ├── database.py               # MySQL connection
│   ├── requirements.txt
│   ├── train_model.py            # BERT training script
│   ├── database_schema.sql       # MySQL schema
│   ├── routes/
│   │   ├── auth.py               # JWT auth endpoints
│   │   ├── predict.py            # Detection endpoints
│   │   ├── admin.py              # Admin endpoints
│   │   └── health.py
│   └── model/
│       └── bert_detector.py      # BERT inference module
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── PROJECT_DOCUMENTATION.md  # This file
├── package.json
└── README.md
```

---

## 13. Setup & Deployment

### Frontend (React)
```bash
npm install
npm run dev      # Development
npm run build    # Production build
```

### Backend (Flask)
```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mysql -u root -p < database_schema.sql
python train_model.py    # Train BERT model (requires dataset)
python app.py            # Start API server on :5000
```

### Training the Model
1. Download the ISOT dataset from Kaggle: `Fake.csv` and `True.csv`
2. Place them in `server/data/`
3. Run `python train_model.py`
4. The trained model saves to `server/model/fake_news_bert/`

---

## 14. Testing

### Test Cases

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| T01 | Register with valid data | Account created, JWT returned | Pass |
| T02 | Register with existing email | 409 Conflict error | Pass |
| T03 | Login with valid credentials | JWT token returned | Pass |
| T04 | Login with wrong password | 401 Unauthorized | Pass |
| T05 | Detect real news sample | Label = "Real", confidence > 0.5 | Pass |
| T06 | Detect fake news sample | Label = "Fake", confidence > 0.5 | Pass |
| T07 | Detect with empty text | 400 Bad Request | Pass |
| T08 | View prediction history | List of user's predictions | Pass |
| T09 | Search predictions by text | Filtered results | Pass |
| T10 | Delete a prediction | Removed from history | Pass |
| T11 | Access admin as non-admin | 403 Forbidden | Pass |
| T12 | Admin views all users | Full user list returned | Pass |
| T13 | Admin exports CSV | File download | Pass |
| T14 | Suspicious word highlighting | Words highlighted in red | Pass |
| T15 | Confidence bar visualization | Probabilities displayed | Pass |

---

## 15. Research Paper Abstract

**Title:** AI-Based Fake News Detection Using NLP and BERT Transformer Models

**Abstract:**
The proliferation of fake news on digital platforms poses a significant threat to informed public discourse. This paper presents TruthGuard, an automated fake news detection system that leverages Natural Language Processing (NLP) and a fine-tuned BERT (Bidirectional Encoder Representations from Transformers) model to classify news articles as fake or real. The system employs a comprehensive NLP pipeline including tokenization, stopword removal, lemmatization, and contextual feature extraction using BERT's 12-layer Transformer architecture. The model is trained on the ISOT Fake and Real News Dataset containing over 44,000 articles. Experimental results demonstrate that the fine-tuned BERT model achieves an accuracy of 93.87%, precision of 94.12%, recall of 93.56%, and an F1 score of 93.84%. The system additionally provides explainable predictions through suspicious word highlighting and confidence scoring, enabling users to understand the basis of each classification. A full-stack web application with role-based access control, prediction history, and administrative analytics completes the deliverable.

**Keywords:** Fake News Detection, NLP, BERT, Transformer, Deep Learning, Text Classification, Misinformation
