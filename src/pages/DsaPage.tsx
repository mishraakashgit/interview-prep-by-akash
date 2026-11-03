import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { PATTERNS, PROBLEMS, leetcodeUrl } from '../data/dsa';
import { formatDate, todayISO } from '../lib/dates';
import { isDue } from '../lib/spacedRepetition';
import { CheckButton, Chevron, PageHeader, ProgressBar } from '../components/ui';
import ConfidenceButtons from '../components/ConfidenceButtons';
import type { AppState, DsaProblem, ProblemStatus } from '../types';

const FILTERS = ['all', 'core', 'todo', 'revisit', 'due', 'solved'] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_LABEL: Record<Filter, string> = {
  all: 'All',
  core: '★ Core',
  todo: 'To do',
  revisit: 'To review',
  due: 'Due now',
  solved: 'Nailed',
};

const attempted = (state: AppState, id: string) => (state.problems[id]?.status ?? 'todo') !== 'todo';

function ProblemRow({ p, expanded, onExpand, subtle = true }: { p: DsaProblem; expanded: boolean; onExpand: () => void; subtle?: boolean }) {
  const { state, update } = useStore();
  const today = todayISO();
  const prog = state.problems[p.id];
  const status: ProblemStatus = prog?.status ?? 'todo';

  const setNotes = (notes: string) =>
    update((s) => ({
      ...s,
      problems: { ...s.problems, [p.id]: { ...(s.problems[p.id] ?? { status: 'todo', attempts: [] }), notes } },
    }));
  const reset = () =>
    update((s) => {
      const { [p.id]: _removed, ...rest } = s.problems;
      return { ...s, problems: rest };
    });

  return (
    <div className="problem">
      <CheckButton on={status !== 'todo'} label={p.title} />
      <div className="name">
        <a href={leetcodeUrl(p.id)} target="_blank" rel="noreferrer">
          {p.core && <span style={{ color: 'var(--accent)' }}>★ </span>}
          {p.title}
        </a>
        <span className="small faint row" style={{ gap: 6 }}>
          {status === 'revisit' &&
            (isDue(prog, today) ? (
              <span className="badge accent">review now</span>
            ) : (
              <span className="badge warn">review {formatDate(prog!.nextReview!)}</span>
            ))}
          <button className="ghost small" style={{ padding: '0 4px' }} onClick={onExpand} aria-expanded={expanded}>
            {prog?.notes ? '✎ notes' : '+ notes'}
          </button>
        </span>
      </div>
      <span className={`diff small diff-${p.difficulty}`}>{p.difficulty}</span>
      <ConfidenceButtons problemId={p.id} subtle={subtle} />
      {expanded && (
        <div className="extra stack-sm fade-in">
          <textarea
            autoFocus
            placeholder="Key insight, complexity, the bug that got you…"
            value={prog?.notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
          />
          {prog && (
            <div>
              <button className="small ghost danger" onClick={reset}>
                Reset progress ({prog.attempts.length} attempt{prog.attempts.length === 1 ? '' : 's'})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DsaPage() {
  const { state } = useStore();
  const today = todayISO();
  const [params, setParams] = useSearchParams();
  const filter = (FILTERS as readonly string[]).includes(params.get('filter') ?? '') ? (params.get('filter') as Filter) : 'all';
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  // Start with the first pattern that still has problems left open.
  const [open, setOpen] = useState<Set<string>>(() => {
    const next = PATTERNS.find((pat) => PROBLEMS.some((p) => p.pattern === pat.name && !attempted(state, p.id)));
    return new Set(next ? [next.name] : []);
  });
  const search = useRef<HTMLInputElement>(null);

  // "/" focuses search, like NeetCode and GitHub.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const statusOf = (id: string): ProblemStatus => state.problems[id]?.status ?? 'todo';
  const visible = PROBLEMS.filter((p) => {
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'due') return isDue(state.problems[p.id], today);
    if (filter === 'core') return !!p.core;
    return filter === 'all' || statusOf(p.id) === filter;
  });
  const forceOpen = filter !== 'all' || !!query;
  const done = PROBLEMS.filter((p) => attempted(state, p.id)).length;
  // Oldest review first, so nothing waits forever.
  const due = PROBLEMS.filter((p) => isDue(state.problems[p.id], today)).sort((a, b) =>
    state.problems[a.id].nextReview!.localeCompare(state.problems[b.id].nextReview!),
  );

  const toggle = (name: string, isOpen: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(name);
      else next.delete(name);
      return next;
    });
  const expand = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <>
      <PageHeader eyebrow={`${done} of ${PROBLEMS.length} attempted`} title="Problems">
        Work through them at your own pace. Rate each attempt: Shaky or OK brings it back for review in a week, Nailed it
        closes it.
      </PageHeader>

      {due.length > 0 && filter === 'all' && !query && (
        <section className="accordion fade-in">
          <div className="spread" style={{ padding: '14px 18px' }}>
            <strong>Time to review · {due.length}</strong>
            <span className="small muted">Rate it again: Nailed it closes it, otherwise another week</span>
          </div>
          {due.map((p) => (
            <ProblemRow key={p.id} p={p} expanded={expanded === `due:${p.id}`} onExpand={() => expand(`due:${p.id}`)} subtle={false} />
          ))}
        </section>
      )}

      <div className="spread">
        <div className="segmented" role="tablist" aria-label="Filter">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={filter === f ? 'selected' : ''}
              onClick={() => setParams(f === 'all' ? {} : { filter: f }, { replace: true })}
            >
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
        <div className="row">
          <input
            ref={search}
            placeholder="Search problems"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search problems"
            style={{ width: 200 }}
          />
          <kbd>/</kbd>
        </div>
      </div>

      {PATTERNS.map((pat) => {
        const rows = visible.filter((p) => p.pattern === pat.name);
        if (rows.length === 0) return null;
        const all = PROBLEMS.filter((p) => p.pattern === pat.name);
        const doneHere = all.filter((p) => attempted(state, p.id)).length;
        return (
          <details
            key={pat.name}
            className="accordion"
            open={forceOpen || open.has(pat.name)}
            onToggle={(e) => !forceOpen && toggle(pat.name, (e.target as HTMLDetailsElement).open)}
          >
            <summary>
              <span className="row">
                <Chevron />
                <strong>{pat.name}</strong>
              </span>
              <ProgressBar value={doneHere} total={all.length} tone={doneHere === all.length ? 'good' : undefined} />
              <span className="mono small muted">
                {doneHere}/{all.length}
              </span>
            </summary>
            <p className="hint">{pat.hint}</p>
            {rows.map((p) => (
              <ProblemRow key={p.id} p={p} expanded={expanded === p.id} onExpand={() => expand(p.id)} />
            ))}
          </details>
        );
      })}
      {visible.length === 0 && <p className="card empty">Nothing here. Try another filter.</p>}
    </>
  );
}
