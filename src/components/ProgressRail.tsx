import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { activeDates, currentStreak, dayStatus } from '../lib/plan';
import { isDue } from '../lib/spacedRepetition';
import { addDays, parseISODate, toISODate, todayISO } from '../lib/dates';
import { PROBLEMS } from '../data/dsa';
import { SD_TOPICS } from '../data/systemDesign';
import { ProgressBar, Ring } from './ui';
import type { Difficulty } from '../types';

const DIFFS: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STATUS_LABEL = { complete: 'Goal hit', partial: 'Partly done', missed: 'Skipped', today: 'Today', idle: '' };

function ProgressCard() {
  const { state } = useStore();
  const today = todayISO();
  const solved = (d?: Difficulty) =>
    PROBLEMS.filter((p) => (!d || p.difficulty === d) && state.problems[p.id]?.status === 'solved').length;
  const total = PROBLEMS.length;
  const done = solved();
  const due = PROBLEMS.filter((p) => isDue(state.problems[p.id], today)).length;
  const topics = SD_TOPICS.filter((t) => state.topics[t.id]?.done).length;

  return (
    <section className="card">
      <div className="card-title">
        <h2>Progress</h2>
        <span className="faint small">DSA</span>
      </div>
      <div className="ring-wrap">
        <Ring value={done} total={total}>
          <strong className="mono">{total - done}</strong>
          <span className="faint small">left</span>
        </Ring>
        <div className="diff-rows">
          {DIFFS.map((d) => {
            const all = PROBLEMS.filter((p) => p.difficulty === d).length;
            const s = solved(d);
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
        <div>
          <strong className="mono">{due}</strong>
          <span className="muted">reviews due</span>
        </div>
        <div>
          <strong className="mono">
            {topics}/{SD_TOPICS.length}
          </strong>
          <span className="muted">design topics</span>
        </div>
      </div>
    </section>
  );
}

function CalendarCard() {
  const { state } = useStore();
  const today = todayISO();
  const [offset, setOffset] = useState(0); // months from the current one
  const active = useMemo(() => activeDates(state), [state]);

  const first = parseISODate(today);
  first.setDate(1);
  first.setMonth(first.getMonth() + offset);
  const monthStart = toISODate(first);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday-first grid
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i));
  const statuses = days.map((d) => dayStatus(state, d, today, active));
  const hit = statuses.filter((s) => s === 'complete').length;
  const missed = statuses.filter((s) => s === 'missed').length;

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
          const stat = state.dayStats[d];
          const title = [d, STATUS_LABEL[statuses[i]], stat && stat.total ? `${stat.done}/${stat.total} tasks` : '']
            .filter(Boolean)
            .join(' · ');
          return (
            <span key={d} className={`day ${statuses[i]} ${d === today ? 'is-today' : ''}`} title={title}>
              {i + 1}
            </span>
          );
        })}
      </div>
      <div className="legend">
        <span><i style={{ background: 'var(--good)' }} />Goal hit</span>
        <span><i style={{ background: 'var(--warn-soft)', boxShadow: 'inset 0 0 0 1px var(--warn)' }} />Partial</span>
        <span><i style={{ background: 'var(--bad-soft)', boxShadow: 'inset 0 0 0 1px var(--bad)' }} />Skipped</span>
      </div>
      <div className="mini-stats small">
        <div>
          <strong className="mono">🔥 {currentStreak(state, today)}</strong>
          <span className="muted">day streak</span>
        </div>
        <div>
          <strong className="mono">
            {hit}
            <span className="faint"> / {missed} </span>
          </strong>
          <span className="muted">hit / skipped</span>
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
