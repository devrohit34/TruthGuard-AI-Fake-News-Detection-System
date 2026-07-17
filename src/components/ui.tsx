import type { ReactNode } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon,
  color = 'teal',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'teal' | 'red' | 'green' | 'sky' | 'amber';
}) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-700',
    red: 'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
    sky: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function ResultBadge({ label }: { label: 'Fake' | 'Real' }) {
  if (label === 'Fake') {
    return (
      <span className="badge bg-red-100 text-red-700">
        <ShieldAlert className="h-3.5 w-3.5" /> Fake News
      </span>
    );
  }
  return (
    <span className="badge bg-green-100 text-green-700">
      <ShieldCheck className="h-3.5 w-3.5" /> Real News
    </span>
  );
}

export function ConfidenceBar({ probFake, probReal }: { probFake: number; probReal: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold">
        <span className="text-red-600">Fake {Math.round(probFake * 100)}%</span>
        <span className="text-green-600">Real {Math.round(probReal * 100)}%</span>
      </div>
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
          style={{ width: `${probFake * 100}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700"
          style={{ width: `${probReal * 100}%` }}
        />
      </div>
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-slate-200 border-t-teal-600 ${className}`} />
  );
}

export function EmptyState({ title, message, icon }: { title: string; message: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
    </div>
  );
}
