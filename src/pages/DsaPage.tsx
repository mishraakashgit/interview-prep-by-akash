import { useState } from 'react';
import { useStore } from '../lib/store';
import { PATTERNS, PROBLEMS, leetcodeUrl } from '../data/dsa';
import { formatDate, todayISO } from '../lib/dates';
import { isDue } from '../lib/spacedRepetition';
import { PageHeader, ProgressBar } from '../components/ui';
import ConfidenceButtons from '../components/ConfidenceButtons';
import type { ProblemStatus } from '../types';

type Filter = 'all' | ProblemStatus | 'due' | 'core';

const STATUS_BADGE: Record<ProblemStatus, string> = { todo: '', solved: 'good', revisit: 'warn' };

export default function DsaPage() {
  const { state, update } = useStore();
  const today = todayISO();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [pattern, setPattern] = useState('');

  const statusOf = (id: string): ProblemStatus => state.problems[id]?.status ?? 'todo';

  const visible = PROBLEMS.filter((p) => {
    if (pattern && p.pattern !== pattern) return false;
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'due') return isDue(state.problems[p.id], today);
    if (filter === 'core') return p.core;
    return filter === 'all' || statusOf(p.id) === filter;
  });

  const setNotes = (id: string, notes: string) =>
    update((s) => ({
      ...s,
      problems: { ...s.problems, [id]: { ...(s.problems[id] ?? { status: 'todo', attempts: [] }), notes } },
    }));
  const reset = (id: string) =>
    update((s) => {
      const { [id]: _removed, ...rest } = s.problems;
      return { ...s, problems: rest };
    });

  const dueCount = PROBLEMS.filter((p) => isDue(state.problems[p.id], today)).length;
  const solved = PROBLEMS.filter((p) => statusOf(p.id) === 'solved').length;

  return (
    <div className="stack">
      <PageHeader title="DSA tracker">
        {PROBLEMS.length} problems grouped by pattern. ★ marks the core set to prioritise. Rating a solve schedules the next
        review automatically (spaced repetition).
      </PageHeader>

      <div className="card stack">
        <div className="spread">
          <span>
            <strong>{solved}</strong> solved · <strong>{dueCount}</strong> due for review
          </span>
          <span className="muted small">{Math.round((solved / PROBLEMS.length) * 100)}%</span>
        </div>
        <ProgressBar value={solved} total={PROBLEMS.length} />
        <div className="row">
          {(['all', 'core', 'todo', 'solved', 'revisit', 'due'] as Filter[]).map((f) => (
            <button key={f} className={`small ${filter === f ? 'selected' : ''}`} onClick={() => setFilter(f)}>
              {f === 'core' ? '★ core' : f}
            </button>
          ))}
          <select value={pattern} onChange={(e) => setPattern(e.target.value)} aria-label="Pattern">
            <option value="">All patterns</option>
            {PATTERNS.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
          <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search problems" />
        </div>
      </div>

      {PATTERNS.map((pat) => {
        const rows = visible.filter((p) => p.pattern === pat.name);
        if (rows.length === 0) return null;
        const all = PROBLEMS.filter((p) => p.pattern === pat.name);
        const done = all.filter((p) => statusOf(p.id) === 'solved').length;
        return (
          <section key={pat.name} className="card">
            <div className="spread">
              <h2 style={{ margin: 0 }}>{pat.name}</h2>
              <span className="muted small">
                {done}/{all.length}
              </span>
            </div>
            <p className="muted small" style={{ margin: '4px 0 8px' }}>
              {pat.hint}
            </p>
            <ProgressBar value={done} total={all.length} />
            <div className="table-wrap">
              <table className="table" style={{ marginTop: 8 }}>
                <tbody>
                  {rows.map((p) => {
                    const prog = state.problems[p.id];
                    const status = statusOf(p.id);
                    return (
                      <tr key={p.id}>
                        <td style={{ width: '45%' }}>
                          <a href={leetcodeUrl(p.id)} target="_blank" rel="noreferrer">
                            {p.core && '★ '}
                            {p.title}
                          </a>
                          <details>
                            <summary className="muted small">
                              Notes{prog?.notes ? ' ✎' : ''}
                              {prog?.attempts.length ? ` · ${prog.attempts.length} attempt(s)` : ''}
                            </summary>
                            <textarea
                              placeholder="Key insight, complexity, mistakes to avoid…"
                              value={prog?.notes ?? ''}
                              onChange={(e) => setNotes(p.id, e.target.value)}
                            />
                            {prog && (
                              <button className="small ghost danger" onClick={() => reset(p.id)}>
                                Reset progress
                              </button>
                            )}
                          </details>
                        </td>
                        <td>
                          <span className={`badge ${p.difficulty}`}>{p.difficulty}</span>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[status]}`}>{status}</span>
                          {prog?.nextReview && (
                            <div className={`small ${isDue(prog, today) ? '' : 'muted'}`}>
                              {isDue(prog, today) ? 'Review due' : `Review ${formatDate(prog.nextReview)}`}
                            </div>
                          )}
                        </td>
                        <td>
                          <ConfidenceButtons problemId={p.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
      {visible.length === 0 && <p className="empty card">No problems match these filters.</p>}
    </div>
  );
}
