import { ScanText, BarChart3, Brain, Zap, FileSearch, TrendingUp, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from '../lib/router';
import { MODEL_METRICS } from '../lib/detection';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="absolute right-1/4 top-32 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        </div>
        <div className="container-page py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700 animate-fade-in">
              <Brain className="h-4 w-4" />
              Powered by Fine-tuned BERT + NLP
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl animate-fade-in-up">
              Detect <span className="text-gradient">Fake News</span> with
              AI-Powered Precision
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              TruthGuard uses a fine-tuned BERT Transformer model and advanced NLP
              techniques to classify news articles as Fake or Real — with confidence
              scores, suspicious-word highlighting, and explainable predictions.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/detect" className="btn-primary px-6 py-3 text-base">
                <ScanText className="h-5 w-5" />
                Try Detection Now
              </Link>
              <Link to="/about" className="btn-secondary px-6 py-3 text-base">
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Hero stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Model Accuracy', value: `${(MODEL_METRICS.accuracy * 100).toFixed(1)}%` },
              { label: 'F1 Score', value: MODEL_METRICS.f1.toFixed(3) },
              { label: 'Training Samples', value: '35K+' },
              { label: 'BERT Layers', value: '12' },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <p className="font-display text-2xl font-bold text-teal-700">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Comprehensive Detection Features</h2>
          <p className="mt-4 text-slate-600">
            Everything you need to identify misinformation, understand why, and track patterns over time.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ScanText, title: 'Paste or Upload News', desc: 'Paste raw article text or upload a .txt/.csv file for instant analysis.' },
            { icon: Zap, title: 'Instant Prediction', desc: 'Get Fake/Real classification in seconds with a confidence percentage.' },
            { icon: FileSearch, title: 'Suspicious Word Highlighting', desc: 'See exactly which words triggered the fake-news signal, highlighted inline.' },
            { icon: Brain, title: 'Explainable AI', desc: 'Each prediction includes a plain-English explanation of the reasoning.' },
            { icon: TrendingUp, title: 'Prediction History', desc: 'Every analysis is saved to your dashboard with full search capability.' },
            { icon: BarChart3, title: 'Admin Analytics', desc: 'Platform-wide stats, trends, user management, and report exports.' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-sky-500 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">How It Works</h2>
            <p className="mt-4 text-slate-600">A five-stage NLP pipeline powered by BERT.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-5">
            {[
              { step: '1', title: 'Tokenization', desc: 'Text is split into tokens using BERT WordPiece tokenizer.' },
              { step: '2', title: 'Preprocessing', desc: 'Stopword removal and lemmatization clean the input.' },
              { step: '3', title: 'Feature Extraction', desc: 'Transformer layers extract 768-dim contextual embeddings.' },
              { step: '4', title: 'Classification', desc: 'A fine-tuned classifier head outputs Fake vs Real logits.' },
              { step: '5', title: 'Explanation', desc: 'Saliency maps highlight suspicious tokens and reasoning.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 font-display text-lg font-bold text-white shadow-md">
                  {s.step}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model metrics */}
      <section className="container-page py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Model Evaluation</h2>
            <p className="mt-4 text-slate-600">
              Trained on the ISOT Fake and Real News Dataset (Kaggle) with a 80/20 train-test split.
              The fine-tuned BERT model achieves strong performance across all key metrics.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { label: 'Accuracy', value: MODEL_METRICS.accuracy },
                { label: 'Precision', value: MODEL_METRICS.precision },
                { label: 'Recall', value: MODEL_METRICS.recall },
                { label: 'F1 Score', value: MODEL_METRICS.f1 },
              ].map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{m.label}</span>
                    <span className="font-bold text-teal-700">{(m.value * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-600 to-sky-500 transition-all duration-1000"
                      style={{ width: `${m.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-8">
            <h3 className="font-display text-lg font-bold text-slate-900">Confusion Matrix</h3>
            <p className="mt-1 text-sm text-slate-500">Test set ({MODEL_METRICS.testSamples.toLocaleString()} samples)</p>
            <div className="mt-6 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-green-50 p-6">
                <p className="text-xs font-medium text-green-600">True Real</p>
                <p className="mt-1 font-display text-3xl font-bold text-green-700">{MODEL_METRICS.confusionMatrix.tp.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-6">
                <p className="text-xs font-medium text-red-600">False Fake</p>
                <p className="mt-1 font-display text-3xl font-bold text-red-700">{MODEL_METRICS.confusionMatrix.fp.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-6">
                <p className="text-xs font-medium text-red-600">False Real</p>
                <p className="mt-1 font-display text-3xl font-bold text-red-700">{MODEL_METRICS.confusionMatrix.fn.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-green-50 p-6">
                <p className="text-xs font-medium text-green-600">True Fake</p>
                <p className="mt-1 font-display text-3xl font-bold text-green-700">{MODEL_METRICS.confusionMatrix.tn.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Model: {MODEL_METRICS.modelName}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-teal-700 to-sky-700 py-16">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to Verify the Truth?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-teal-100">
            Create a free account to save your prediction history, access analytics, and help fight misinformation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn bg-white px-6 py-3 text-base text-teal-700 hover:bg-teal-50">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/detect" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
              <CheckCircle2 className="h-5 w-5" /> Try Without Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
