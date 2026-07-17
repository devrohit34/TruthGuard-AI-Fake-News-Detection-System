import { useState, useRef, type ChangeEvent } from 'react';
import { ScanText, Upload, FileText, Sparkles, AlertTriangle, ShieldCheck, ShieldAlert, Loader2, Save, RotateCcw, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { detectFakeNews, MODEL_NAME } from '../lib/detection';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Link } from '../lib/router';
import { ConfidenceBar, ResultBadge, Spinner } from '../components/ui';
import type { DetectionResult } from '../lib/types';

const SAMPLES = [
  {
    label: 'Real news example',
    text: 'According to a statement released by the Ministry of Health on Tuesday, the government has confirmed a 3.2 percent increase in healthcare funding for the upcoming fiscal year. A spokesperson said the additional budget will be allocated to rural hospitals and medical research programs. The announcement was made during a press briefing following a cabinet committee meeting. Officials confirmed that the policy was developed in consultation with medical experts and university researchers.',
  },
  {
    label: 'Fake news example',
    text: 'SHOCKING BOMBSHELL! You won\'t believe what they just exposed about the secret government coverup! A leaked conspiracy reveals the TRUTH that officials are hiding from you. This is absolutely terrifying and disgusting. Everyone needs to know this before it\'s deleted forever. The corrupt politicians are lying and the mainstream media refuses to report it. Share this incredible story now before it\'s too late!',
  },
  {
    label: 'Miracle cure example',
    text: 'This miracle cure is 100% guaranteed to heal cancer and diabetes! Doctors hate this one trick that cures every disease. 500% effective natural remedy that the pharmaceutical companies don\'t want you to know about. Act now before it\'s banned!',
  },
  {
    label: 'Conspiracy example',
    text: 'Wake up sheeple! The deep state is covering up the truth about 5G and chemtrails. Insiders say the government is hiding the real story. This false flag operation was staged with crisis actors. Open your eyes before it\'s too late.',
  },
];

export default function DetectPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAnalyze() {
    if (text.trim().length < 10) {
      setError('Please enter at least 10 characters of news text.');
      return;
    }
    setError(null);
    setAnalyzing(true);
    setSaved(false);
    setTimeout(() => {
      const res = detectFakeNews(text);
      setResult(res);
      setAnalyzing(false);
    }, 900);
  }

  function handleReset() {
    setText('');
    setResult(null);
    setSaved(false);
    setError(null);
    setShowDebug(false);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      setError('File too large. Please upload a file under 500KB.');
      return;
    }
    const content = await file.text();
    setText(content.slice(0, 10000));
    setResult(null);
    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    if (!result || !user) return;
    setSaving(true);
    setError(null);
    const { error: insErr } = await supabase.from('predictions').insert({
      input_text: text,
      label: result.label,
      confidence: result.confidence,
      prob_fake: result.probFake,
      prob_real: result.probReal,
      suspicious_words: result.suspiciousWords.map((s) => s.word),
      explanation: result.explanation,
      source: 'manual',
    });
    setSaving(false);
    if (insErr) {
      setError('Failed to save prediction: ' + insErr.message);
      return;
    }
    setSaved(true);
  }

  function renderHighlighted() {
    if (!result || result.suspiciousWords.length === 0) return text;
    const wordSet = new Set(result.suspiciousWords.map((s) => s.word.toLowerCase()));
    const tokens = text.split(/(\s+)/);
    return tokens.map((tok, i) => {
      const clean = tok.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (wordSet.has(clean)) {
        return <span key={i} className="suspicious-hl">{tok}</span>;
      }
      return <span key={i}>{tok}</span>;
    });
  }

  return (
    <div className="container-page py-10 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="section-title">News Detection</h1>
        <p className="mt-4 text-slate-600">
          Paste a news article or upload a text file. Our NLP pipeline will classify it as Fake or Real
          with a confidence score and explanation.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        {/* Input */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="label mb-0">News Article Text</label>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-ghost text-xs"
                >
                  <Upload className="h-4 w-4" /> Upload File
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.csv,.md"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setResult(null); setSaved(false); }}
              placeholder="Paste the full text of a news article here..."
              rows={12}
              className="input resize-y font-mono text-xs leading-relaxed"
            />
            <p className="mt-2 text-xs text-slate-400">{text.length} characters</p>

            {/* Samples */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-slate-500 self-center">Try a sample:</span>
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setText(s.text); setResult(null); setSaved(false); }}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary flex-1 py-3">
                {analyzing ? (
                  <><Spinner className="h-4 w-4 border-white/40 border-t-white" /> Analyzing...</>
                ) : (
                  <><ScanText className="h-4 w-4" /> Analyze News</>
                )}
              </button>
              <button onClick={handleReset} className="btn-secondary py-3">
                <RotateCcw className="h-4 w-4" /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-2">
          {!result && !analyzing && (
            <div className="card flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-700">Awaiting Analysis</h3>
              <p className="mt-1 text-sm text-slate-500">Enter some text and click Analyze to see the prediction here.</p>
            </div>
          )}

          {analyzing && (
            <div className="card flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse-ring rounded-full bg-teal-200" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              </div>
              <h3 className="mt-6 font-semibold text-slate-700">Running NLP Pipeline</h3>
              <p className="mt-1 text-sm text-slate-500">Tokenization → Embedding → Classification...</p>
            </div>
          )}

          {result && !analyzing && (
            <div className="card animate-fade-in-up p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900">Prediction Result</h3>
                <ResultBadge label={result.label} />
              </div>

              {/* Big label */}
              <div className={`mt-4 rounded-2xl p-6 text-center ${result.label === 'Fake' ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${result.label === 'Fake' ? 'bg-red-100' : 'bg-green-100'}`}>
                  {result.label === 'Fake' ? (
                    <ShieldAlert className="h-9 w-9 text-red-600" />
                  ) : (
                    <ShieldCheck className="h-9 w-9 text-green-600" />
                  )}
                </div>
                <p className={`mt-3 font-display text-3xl font-bold ${result.label === 'Fake' ? 'text-red-700' : 'text-green-700'}`}>
                  {result.label === 'Fake' ? 'FAKE NEWS' : 'REAL NEWS'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Confidence: <span className="font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                </p>
              </div>

              {/* Probability bar */}
              <div className="mt-5">
                <ConfidenceBar probFake={result.probFake} probReal={result.probReal} />
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-xs text-slate-500">Tokens</p>
                  <p className="font-bold text-slate-800">{result.processedTokens}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-xs text-slate-500">Flagged</p>
                  <p className="font-bold text-slate-800">{result.suspiciousWords.length}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-xs text-slate-500">P(Fake)</p>
                  <p className="font-bold text-red-600">{(result.probFake * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Save button */}
              {user ? (
                saved ? (
                  <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                    <ShieldCheck className="h-4 w-4" /> Saved to your history
                  </div>
                ) : (
                  <button onClick={handleSave} disabled={saving} className="btn-secondary mt-5 w-full py-2.5">
                    {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Save to History
                  </button>
                )
              ) : (
                <Link to="/login" className="btn-secondary mt-5 w-full py-2.5 text-center text-xs">
                  <Save className="h-4 w-4" /> Sign in to save predictions
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explanation + Highlighting */}
      {result && !analyzing && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Explanation */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <Sparkles className="h-5 w-5 text-teal-600" /> Why This Prediction?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{result.explanation}</p>

            {result.suspiciousWords.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-slate-700">Key Flagged Words</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.suspiciousWords.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                      style={{ opacity: 0.5 + (s.score / 4) * 0.5 }}
                    >
                      {s.word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Highlighted text */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <FileText className="h-5 w-5 text-teal-600" /> Suspicious Word Highlighting
            </h3>
            <p className="mt-1 text-xs text-slate-500">Red highlights indicate words that contributed to the fake-news signal.</p>
            <div className="mt-4 max-h-80 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {renderHighlighted()}
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {result && !analyzing && (
        <div className="mt-8 card overflow-hidden">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex w-full items-center justify-between bg-slate-50 px-6 py-4 text-left transition hover:bg-slate-100"
          >
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-slate-600" />
              <h3 className="font-display text-lg font-bold text-slate-900">Debug Panel</h3>
              <span className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {result.indicators.length} indicator(s)
              </span>
            </div>
            {showDebug ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
          </button>

          {showDebug && (
            <div className="animate-fade-in space-y-6 p-6">
              {/* Model info */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Model</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {MODEL_NAME}
                  </span>
                </div>
              </div>

              {/* Input text */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Input Text</h4>
                <div className="max-h-40 overflow-y-auto rounded-xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-600">
                  {text}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {text.length} characters · {result.processedTokens} tokens processed
                </p>
              </div>

              {/* Prediction output */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Model Prediction</h4>
                  <div className={`rounded-xl p-4 ${result.label === 'Fake' ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className={`font-display text-xl font-bold ${result.label === 'Fake' ? 'text-red-700' : 'text-green-700'}`}>
                      {result.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      P(Fake) = {(result.probFake * 100).toFixed(2)}% · P(Real) = {(result.probReal * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Confidence Score</h4>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="font-display text-xl font-bold text-slate-900">
                      {(result.confidence * 100).toFixed(2)}%
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      max(P_fake, P_real) from classifier output
                    </p>
                  </div>
                </div>
              </div>

              {/* Triggered indicators */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Triggered Fake-News Indicators
                </h4>
                {result.indicators.length === 0 ? (
                  <p className="text-sm text-slate-500">No indicators triggered.</p>
                ) : (
                  <div className="space-y-2">
                    {result.indicators.map((ind, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
                          ind.weight > 0
                            ? 'border-red-200 bg-red-50/50'
                            : 'border-green-200 bg-green-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            ind.weight > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {ind.weight > 0 ? '!' : '✓'}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{ind.category}</p>
                            <p className="text-xs text-slate-500">{ind.description}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${ind.weight > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {ind.weight > 0 ? '+' : ''}{ind.weight.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Raw scores */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Raw Probability Scores</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-red-50 p-3 text-center">
                    <p className="text-xs text-slate-500">P(Fake)</p>
                    <p className="font-display text-lg font-bold text-red-600">{(result.probFake * 100).toFixed(4)}%</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <p className="text-xs text-slate-500">P(Real)</p>
                    <p className="font-display text-lg font-bold text-green-600">{(result.probReal * 100).toFixed(4)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
