import type { ReactNode } from 'react';

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="card stat">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export function CheckButton({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button className={`check ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} aria-label={label}>
      {on ? '✓' : ''}
    </button>
  );
}
