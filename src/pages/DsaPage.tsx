import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { PATTERNS, PROBLEMS, leetcodeUrl } from '../data/dsa';
import { formatDate, todayISO } from '../lib/dates';
import { isDue } from '../lib/spacedRepetition';
import { useTodayPlan } from '../lib/useTodayPlan';
import { CheckButton, Chevron, PageHeader, ProgressBar } from '../components/ui';
import ConfidenceButtons from '../components/ConfidenceButtons';
import type { DsaProblem, ProblemStatus } from '../types';

const FILTERS = ['all', 'core', 'todo', 'revisit', 'due', 'solved'] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_LABEL: Record<Filter, string> = { all: 'All', core: '★ Core', todo: 'To do', revisit: 'Revisit', due: 'Due', solved: 'Solved' };

function ProblemRow({ p, expanded, onExpand }: { p: DsaProblem; expanded: boolean; onExpand: () => void }) {
  const { state, update } = useStore();
  const today = todayISO();
  const prog = state.problems[p.id];
  const status: ProblemStatus = prog?.status ?? 'todo';
  const due = isDue(prog, today);

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
      <CheckButton on={status === 'solved'} label={p.title} />
      <div className="name">
        <a href={leetcodeUrl(p.id)} target="_blank" rel="noreferrer">
          {p.core && <span style={{ color: 'var(--accent)' }}>★ </span>}
          {p.title}
        </a>
        <span className="small faint row" style={{ gap: 6 }}>
          {status === 'revisit' && <span className="badge warn">revisit</span>}
          {due ? (
            <span className="badge accent">review due</span>
          ) : (
            prog?.nextReview && <span>review {formatDate(prog.nextReview)}</span>
          )}
          <button className="ghost small" style={{ padding: '0 4px' }} onClick={onExpand} aria-expanded={expanded}>
            {prog?.notes ? '✎ notes' : '+ notes'}
          </button>
        </span>
      </div>
      <span className={`diff small diff-${p.difficulty}`}>{p.difficulty}</span>
      <ConfidenceButtons problemId={p.id} subtle />
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
  const { plan } = useTodayPlan();
  const [params, setParams] = useSearchParams();
  const filter = (FILTERS as readonly string[]).includes(params.get('filter') ?? '') ? (params.get('filter') as Filter) : 'all';
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(() => new Set(plan.weekInfo.patterns));
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
  const solved = PROBLEMS.filter((p) => statusOf(p.id) === 'solved').length;

  const toggle = (name: string, isOpen: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(name);
      else next.delete(name);
      return next;
    });

  return (
    <>
      <PageHeader eyebrow={`${solved} of ${PROBLEMS.length} solved`} title="Problems">
        Grouped by pattern. Rate each solve and the app brings it back for review at the right time.
      </PageHeader>

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
        const done = all.filter((p) => statusOf(p.id) === 'solved').length;
        const thisWeek = plan.weekInfo.patterns.includes(pat.name);
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
                {thisWeek && <span className="badge accent">this week</span>}
              </span>
              <ProgressBar value={done} total={all.length} tone={done === all.length ? 'good' : undefined} />
              <span className="mono small muted">
                {done}/{all.length}
              </span>
            </summary>
            <p className="hint">{pat.hint}</p>
            {rows.map((p) => (
              <ProblemRow key={p.id} p={p} expanded={expanded === p.id} onExpand={() => setExpanded(expanded === p.id ? null : p.id)} />
            ))}
          </details>
        );
      })}
      {visible.length === 0 && <p className="card empty">Nothing here. Try another filter.</p>}
    </>
  );
}
