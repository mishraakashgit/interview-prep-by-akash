import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 className="display">{title}</h1>
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

/** Round animated checkbox. Renders as a static indicator when no onClick is given. */
export function CheckButton({ on, onClick, label }: { on: boolean; onClick?: () => void; label: string }) {
  if (!onClick) {
    return (
      <span className={`check ${on ? 'on' : ''}`} role="img" aria-label={`${label}: ${on ? 'done' : 'not done'}`}>
        <Tick />
      </span>
    );
  }
  return (
    <button className={`check ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} aria-label={label}>
      <Tick />
    </button>
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
