import { useEffect, useState, useMemo } from 'react';
import { History as HistoryIcon, Search, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Link } from '../lib/router';
import { ResultBadge, EmptyState, Spinner, ConfidenceBar } from '../components/ui';
import type { Prediction } from '../lib/types';

export default function HistoryPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Fake' | 'Real'>('all');
  const [selected, setSelected] = useState<Prediction | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setPredictions((data ?? []) as Prediction[]);
        setLoading(false);
      });
  }, [user]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from('predictions').delete().eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    setPredictions((prev) => prev.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const filtered = useMemo(() => {
    return predictions.filter((p) => {
      if (filter !== 'all' && p.label !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.input_text.toLowerCase().includes(q) || (p.title?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [predictions, search, filter]);

  const stats = useMemo(() => ({
    total: predictions.length,
    fake: predictions.filter((p) => p.label === 'Fake').length,
    real: predictions.filter((p) => p.label === 'Real').length,
  }), [predictions]);

  if (!user) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md text-center">
          <h1 className="section-title text-2xl">Sign in Required</h1>
          <p className="mt-3 text-slate-600">Please sign in to view your prediction history.</p>
          <Link to="/login" className="btn-primary mt-6">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-16">
      <h1 className="section-title">Prediction History</h1>
      <p className="mt-3 text-slate-600">All your past news analyses, searchable and filterable.</p>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Total Predictions</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-red-600">{stats.fake}</p>
          <p className="text-xs text-slate-500">Fake Detected</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-green-600">{stats.real}</p>
          <p className="text-xs text-slate-500">Real Detected</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search predictions by text..."
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'Fake', 'Real'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                filter === f
                  ? 'bg-teal-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* List + Detail */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No Predictions Found"
              message="Start detecting news to build your history."
              icon={<HistoryIcon className="h-8 w-8" />}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className={`card cursor-pointer p-4 transition hover:shadow-md ${selected?.id === p.id ? 'ring-2 ring-teal-500' : ''}`}
                  onClick={() => setSelected(p)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {p.label === 'Fake' ? (
                          <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                        <span className="truncate text-sm font-semibold text-slate-800">
                          {p.input_text.slice(0, 80)}...
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(p.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ResultBadge label={p.label} />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card sticky top-20 p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-900">Prediction Detail</h3>
                <ResultBadge label={selected.label} />
              </div>
              <div className="mt-4">
                <ConfidenceBar probFake={selected.prob_fake} probReal={selected.prob_real} />
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase text-slate-500">Full Text</h4>
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                  {selected.input_text}
                </div>
              </div>
              {selected.explanation && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase text-slate-500">Explanation</h4>
                  <p className="mt-1 text-sm text-slate-600">{selected.explanation}</p>
                </div>
              )}
              {selected.suspicious_words && selected.suspicious_words.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase text-slate-500">Flagged Words</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.suspicious_words.map((w, i) => (
                      <span key={i} className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">{w}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs text-slate-400">
                {new Date(selected.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="card flex h-full min-h-[200px] items-center justify-center p-6 text-center text-sm text-slate-400">
              Select a prediction to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
