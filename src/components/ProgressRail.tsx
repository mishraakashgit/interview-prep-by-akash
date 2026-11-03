import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { setFilterParam } from '../lib/filterParam';
import { attemptsByDay, currentStreak } from '../lib/activity';
import { isDue } from '../lib/spacedRepetition';
import { addDays, parseISODate, toISODate, todayISO } from '../lib/dates';
import { PROBLEMS } from '../data/dsa';
import { ProgressBar, Ring } from './ui';
import type { Difficulty } from '../types';

const DIFFS: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Shade by how many problems were attempted that day. */
const level = (n: number) => (n === 0 ? '' : n <= 2 ? 'l1' : n <= 4 ? 'l2' : 'l3');

function ProgressCard() {
  const { state } = useStore();
  const today = todayISO();
  const attempted = (d?: Difficulty) =>
    PROBLEMS.filter((p) => (!d || p.difficulty === d) && (state.problems[p.id]?.status ?? 'todo') !== 'todo').length;
  const total = PROBLEMS.length;
  const done = attempted();
  const due = PROBLEMS.filter((p) => isDue(state.problems[p.id], today)).length;
  const later = PROBLEMS.filter((p) => state.problems[p.id]?.status === 'revisit').length - due;

  return (
    <section className="card">
      <div className="card-title">
        <h2>Progress</h2>
      </div>
      <div className="ring-wrap">
        <Ring value={done} total={total}>
          <strong className="mono">{total - done}</strong>
          <span className="faint small">pills left</span>
        </Ring>
        <div className="diff-rows">
          {DIFFS.map((d) => {
            const all = PROBLEMS.filter((p) => p.difficulty === d).length;
            const s = attempted(d);
            return (
              <div key={d}>
                <div className="spread small">
                  <span className={`diff-${d}`}>{d}</span>
                  <span className="mono muted">
                    {s}/{all}
                  </span>
                </div>
                <ProgressBar value={s} total={all} tone={d} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mini-stats small">
        <button className="stat-link" onClick={() => setFilterParam('due')} disabled={due === 0}>
          <strong className="mono">{due}</strong>
          <span className="muted">boosters due</span>
        </button>
        <button className="stat-link" onClick={() => setFilterParam('revisit')} disabled={later === 0}>
          <strong className="mono">{later}</strong>
          <span className="muted">boosters later</span>
        </button>
      </div>
    </section>
  );
}

function CalendarCard() {
  const { state } = useStore();
  const today = todayISO();
  const [offset, setOffset] = useState(0); // months from the current one
  const counts = useMemo(() => attemptsByDay(state), [state]);

  const first = parseISODate(today);
  first.setDate(1);
  first.setMonth(first.getMonth() + offset);
  const monthStart = toISODate(first);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday-first grid
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i));
  const activeDays = days.filter((d) => counts.has(d)).length;
  const solvedThisMonth = days.reduce((sum, d) => sum + (counts.get(d) ?? 0), 0);

  return (
    <section className="card">
      <div className="card-title">
        <h2>{first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
        <div className="row" style={{ gap: 2 }}>
          <button className="ghost icon" onClick={() => setOffset(offset - 1)} aria-label="Previous month">
            ‹
          </button>
          <button className="ghost icon" onClick={() => setOffset(offset + 1)} disabled={offset >= 0} aria-label="Next month">
            ›
          </button>
        </div>
      </div>
      <div className="calendar">
        {DOW.map((d, i) => (
          <span key={i} className="dow">
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`b${i}`} className="day blank" />
        ))}
        {days.map((d, i) => {
          const n = counts.get(d) ?? 0;
          return (
            <span
              key={d}
              className={`day ${level(n)} ${d === today ? 'is-today' : ''}`}
              title={`${d} · ${n ? `${n} pill${n === 1 ? '' : 's'}` : 'no pills'}`}
            >
              {i + 1}
            </span>
          );
        })}
      </div>
      <div className="legend">
        <span>Less</span>
        <span><i className="l1" /><i className="l2" /><i className="l3" /></span>
        <span>More</span>
      </div>
      <div className="mini-stats small">
        <div>
          <strong className="mono">🔥 {currentStreak(counts, today)}</strong>
          <span className="muted">day streak</span>
        </div>
        <div>
          <strong className="mono">{solvedThisMonth}</strong>
          <span className="muted">
            pills taken · {activeDays} day{activeDays === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function ProgressRail() {
  return (
    <aside className="rail" aria-label="Progress">
      <ProgressCard />
      <CalendarCard />
    </aside>
  );
}
