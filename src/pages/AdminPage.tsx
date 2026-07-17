import { useEffect, useState, useMemo } from 'react';
import { Users, ScanText, ShieldAlert, ShieldCheck, Download, BarChart3, Activity, FileBarChart, UserCog } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Link } from '../lib/router';
import { StatCard, EmptyState, Spinner, ResultBadge } from '../components/ui';
import { PieChart } from '../components/PieChart';
import { BarChart } from '../components/BarChart';
import { TrendChart } from '../components/TrendChart';
import type { Profile, Prediction, AdminLog } from '../lib/types';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'predictions' | 'logs'>('overview');

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('predictions').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50),
    ]).then(([u, p, l]) => {
      if (u.data) setUsers(u.data as Profile[]);
      if (p.data) setPredictions(p.data as Prediction[]);
      if (l.data) setLogs(l.data as AdminLog[]);
      setLoading(false);
    });
  }, [isAdmin]);

  const stats = useMemo(() => {
    const fake = predictions.filter((p) => p.label === 'Fake').length;
    const real = predictions.filter((p) => p.label === 'Real').length;
    return { totalUsers: users.length, totalPredictions: predictions.length, fake, real };
  }, [users, predictions]);

  // Trend: last 7 days
  const trend = useMemo(() => {
    const days: { label: string; fake: number; real: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayPreds = predictions.filter((p) => p.created_at.slice(0, 10) === key);
      days.push({
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        fake: dayPreds.filter((p) => p.label === 'Fake').length,
        real: dayPreds.filter((p) => p.label === 'Real').length,
      });
    }
    return days;
  }, [predictions]);

  // Per-user bar chart (top 8)
  const perUser = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of predictions) {
      map.set(p.user_id, (map.get(p.user_id) ?? 0) + 1);
    }
    const entries = [...map.entries()]
      .map(([uid, count]) => ({
        label: users.find((u) => u.id === uid)?.email?.split('@')[0] ?? 'unknown',
        value: count,
        color: '#0f766e',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    return entries;
  }, [predictions, users]);

  async function handleExport() {
    const csv = ['id,created_at,user_email,label,confidence,prob_fake,prob_real'];
    for (const p of predictions) {
      const email = users.find((u) => u.id === p.user_id)?.email ?? '';
      csv.push([p.id, p.created_at, email, p.label, p.confidence, p.prob_fake, p.prob_real].join(','));
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthguard_predictions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    await supabase.from('admin_logs').insert({
      admin_id: user?.id,
      action: 'export_predictions',
      detail: `Exported ${predictions.length} predictions as CSV`,
    });
  }

  async function handleRoleChange(uid: string, newRole: 'admin' | 'user') {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', uid);
    if (error) { console.error(error); return; }
    setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, role: newRole } : u));
    await supabase.from('admin_logs').insert({
      admin_id: user?.id,
      action: 'change_user_role',
      detail: `User ${uid} role changed to ${newRole}`,
    });
  }

  if (authLoading || (!authLoading && !user)) {
    return (
      <div className="container-page py-20 text-center">
        <Spinner className="h-8 w-8 mx-auto" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-4 section-title text-2xl">Admin Access Required</h1>
          <p className="mt-3 text-slate-600">You need an admin account to access the dashboard.</p>
          <Link to="/" className="btn-primary mt-6">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Platform analytics, user management, and system oversight.</p>
        </div>
        <button onClick={handleExport} className="btn-secondary">
          <Download className="h-4 w-4" /> Export Report (CSV)
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {([
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'users', label: 'User Management', icon: UserCog },
          { key: 'predictions', label: 'All Predictions', icon: ScanText },
          { key: 'logs', label: 'Admin Logs', icon: Activity },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                tab === t.key ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : tab === 'overview' ? (
        <div className="mt-8 space-y-8">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} color="teal" />
            <StatCard label="Total Predictions" value={stats.totalPredictions} icon={<ScanText className="h-5 w-5" />} color="sky" />
            <StatCard label="Fake News Detected" value={stats.fake} icon={<ShieldAlert className="h-5 w-5" />} color="red" />
            <StatCard label="Real News Detected" value={stats.real} icon={<ShieldCheck className="h-5 w-5" />} color="green" />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-900">Fake vs Real Distribution</h3>
              <div className="mt-6 flex justify-center">
                <PieChart
                  data={[
                    { label: 'Fake', value: stats.fake, color: '#ef4444' },
                    { label: 'Real', value: stats.real, color: '#22c55e' },
                  ]}
                />
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-900">Prediction Trends (7 days)</h3>
              <div className="mt-6">
                <TrendChart data={trend} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-slate-900">Predictions per User (Top 8)</h3>
            <div className="mt-6">
              {perUser.length > 0 ? (
                <BarChart data={perUser} />
              ) : (
                <p className="text-sm text-slate-500">No prediction data yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : tab === 'users' ? (
        <div className="mt-8 card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                        {(u.full_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{u.full_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    {u.id !== user?.id && (
                      <button
                        onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                        className="text-xs font-medium text-teal-700 hover:underline"
                      >
                        Make {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'predictions' ? (
        <div className="mt-8 card overflow-hidden">
          {predictions.length === 0 ? (
            <EmptyState title="No Predictions" message="No predictions have been made yet." icon={<FileBarChart className="h-8 w-8" />} />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Text</th>
                  <th className="px-6 py-3">Label</th>
                  <th className="px-6 py-3">Confidence</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictions.slice(0, 100).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="max-w-xs truncate px-6 py-3 text-slate-700">{p.input_text.slice(0, 100)}...</td>
                    <td className="px-6 py-3"><ResultBadge label={p.label} /></td>
                    <td className="px-6 py-3 font-semibold text-slate-700">{(p.confidence * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="mt-8 card overflow-hidden">
          {logs.length === 0 ? (
            <EmptyState title="No Logs" message="No admin actions have been logged." icon={<Activity className="h-8 w-8" />} />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Detail</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-800">{l.action}</td>
                    <td className="px-6 py-3 text-slate-600">{l.detail}</td>
                    <td className="px-6 py-3 text-slate-500">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
