import { Brain, Database, Server, Cpu, GitBranch, FileText, BookOpen, Code2 } from 'lucide-react';
import { MODEL_METRICS } from '../lib/detection';
import { Link } from '../lib/router';

export default function AboutPage() {
  return (
    <div className="container-page py-10 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="section-title">About the Project</h1>
        <p className="mt-4 text-lg text-slate-600">
          AI-Based Fake News Detection System Using NLP and BERT — a final-year major project
          combining deep learning, natural language processing, and full-stack web development.
        </p>
      </div>

      {/* Project overview */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="card p-8">
          <Brain className="h-10 w-10 text-teal-600" />
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">Project Objective</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The spread of misinformation and fake news has become a critical problem in the digital age.
            This project builds an automated system that detects whether a news article is Fake or Real
            using a fine-tuned BERT (Bidirectional Encoder Representations from Transformers) model
            combined with NLP preprocessing techniques. The system provides explainable predictions
            with confidence scores and suspicious-word highlighting.
          </p>
        </div>
        <div className="card p-8">
          <Cpu className="h-10 w-10 text-sky-600" />
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">AI Methodology</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• <strong>NLP Preprocessing:</strong> Tokenization, stopword removal, lemmatization</li>
            <li>• <strong>Feature Extraction:</strong> BERT 768-dim contextual embeddings</li>
            <li>• <strong>Model:</strong> Fine-tuned bert-base-uncased classifier</li>
            <li>• <strong>Training:</strong> PyTorch + Hugging Face Transformers</li>
            <li>• <strong>Evaluation:</strong> Accuracy, Precision, Recall, F1, Confusion Matrix</li>
          </ul>
        </div>
      </div>

      {/* Tech stack */}
      <div className="mt-12">
        <h2 className="section-title text-center">Technology Stack</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <Code2 className="h-8 w-8 text-teal-600" />
              <h3 className="font-semibold text-slate-900">Frontend</h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              <li>React.js + TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Lucide React Icons</li>
              <li>Custom SVG Charts</li>
            </ul>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-sky-600" />
              <h3 className="font-semibold text-slate-900">Backend</h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              <li>Python Flask (REST API)</li>
              <li>JWT Authentication</li>
              <li>Supabase / PostgreSQL</li>
              <li>Role-based Access Control</li>
            </ul>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-violet-600" />
              <h3 className="font-semibold text-slate-900">AI / ML</h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              <li>BERT Transformer</li>
              <li>Hugging Face Transformers</li>
              <li>PyTorch + Scikit-learn</li>
              <li>NLTK, Pandas, NumPy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Model details */}
      <div className="mt-12 card p-8">
        <h2 className="font-display text-xl font-bold text-slate-900">Model Training Details</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Base Model', value: 'bert-base-uncased' },
            { label: 'Training Samples', value: MODEL_METRICS.trainingSamples.toLocaleString() },
            { label: 'Test Samples', value: MODEL_METRICS.testSamples.toLocaleString() },
            { label: 'Epochs', value: String(MODEL_METRICS.epochs) },
            { label: 'Batch Size', value: String(MODEL_METRICS.batchSize) },
            { label: 'Max Sequence Length', value: String(MODEL_METRICS.maxLen) },
            { label: 'Optimizer', value: 'AdamW' },
            { label: 'Learning Rate', value: '2e-5' },
          ].map((d) => (
            <div key={d.label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{d.label}</p>
              <p className="mt-1 font-display text-lg font-bold text-slate-900">{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card p-8">
          <Database className="h-8 w-8 text-teal-600" />
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">Dataset</h2>
          <p className="mt-3 text-sm text-slate-600">
            The model is trained on the <strong>ISOT Fake and Real News Dataset</strong> (Kaggle),
            which contains ~44,900 articles split evenly between fake and real news.
            Real articles are sourced from Reuters.com, and fake articles from various unreliable
            websites flagged by PolitiFact and Wikipedia.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-green-50 p-3">
              <p className="font-display text-xl font-bold text-green-700">21,425</p>
              <p className="text-xs text-slate-500">Real News</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="font-display text-xl font-bold text-red-700">23,481</p>
              <p className="text-xs text-slate-500">Fake News</p>
            </div>
          </div>
        </div>
        <div className="card p-8">
          <GitBranch className="h-8 w-8 text-sky-600" />
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">Data Pipeline</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            {[
              'Load CSV dataset (Fake.csv, True.csv) via Pandas',
              'Clean: remove duplicates, nulls, URLs, special characters',
              'Label encoding: FAKE=0, REAL=1',
              'Train/Test split (80/20) with stratification',
              'Tokenize with BERT WordPiece tokenizer (max_len=256)',
              'Fine-tune BERT classification head (4 epochs, AdamW)',
              'Evaluate on test set: Accuracy, Precision, Recall, F1',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Deliverables */}
      <div className="mt-12">
        <h2 className="section-title text-center">Project Deliverables</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Code2, label: 'Complete Source Code' },
            { icon: Database, label: 'Database Schema (ER Diagram)' },
            { icon: FileText, label: 'API Documentation' },
            { icon: GitBranch, label: 'UML & DFD Diagrams' },
            { icon: BookOpen, label: 'Testing Reports' },
            { icon: FileText, label: 'Final Project Report' },
            { icon: BookOpen, label: 'PPT Presentation' },
            { icon: FileText, label: 'Research Paper Format' },
            { icon: Server, label: 'Deployment Guide' },
          ].map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.label} className="card flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link to="/detect" className="btn-primary px-6 py-3 text-base">Try the Detection System</Link>
      </div>
    </div>
  );
}
