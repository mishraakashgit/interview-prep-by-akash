import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow?: string;
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className="title-row">
        <h1 className="display">{title}</h1>
        {icon}
      </div>
      {children && <p>{children}</p>}
    </header>
  );
}

export function ProgressBar({ value, total, tone }: { value: number; total: number; tone?: 'good' | 'Easy' | 'Medium' | 'Hard' }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className={`progress ${tone ?? ''}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

const Tick = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 6.2 5 8.5l4.5-5" />
  </svg>
);

/** Round tick showing whether a problem has been attempted. */
export function CheckButton({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`check ${on ? 'on' : ''}`} role="img" aria-label={`${label}: ${on ? 'taken' : 'not taken yet'}`}>
      <Tick />
    </span>
  );
}

export function Ring({ value, total, children }: { value: number; total: number; children?: ReactNode }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <div className="ring">
      <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden>
        <circle className="track" cx="52" cy="52" r={r} />
        <circle className="bar" cx="52" cy="52" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="label">{children}</div>
    </div>
  );
}

export const Chevron = () => (
  <svg className="chev" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="m6 3 5 5-5 5" />
  </svg>
);
