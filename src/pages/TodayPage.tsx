import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { buildDailyPlan, currentStreak } from '../lib/plan';
import { formatDate, todayISO } from '../lib/dates';
import { PROBLEMS, leetcodeUrl } from '../data/dsa';
import { SD_TOPICS } from '../data/systemDesign';
import { CheckButton, PageHeader, ProgressBar, Stat } from '../components/ui';
import ConfidenceButtons from '../components/ConfidenceButtons';
import type { AppState, DsaProblem } from '../types';

function ProblemTask({ p, state, today, review }: { p: DsaProblem; state: AppState; today: string; review?: boolean }) {
  const prog = state.problems[p.id];
  const done = prog?.attempts.at(-1) === today;
  return (
    <div className={`task ${done ? 'done' : ''}`}>
      <span className={`check ${done ? 'on' : ''}`} aria-hidden>{done ? '✓' : ''}</span>
      <div className="body">
        <div className="spread">
          <a className="title" href={leetcodeUrl(p.id)} target="_blank" rel="noreferrer">
            {p.title}
          </a>
          <span className="row">
            {review && <span className="badge accent">review</span>}
            <span className={`badge ${p.difficulty}`}>{p.difficulty}</span>
          </span>
        </div>
        <div className="spread">
          <span className="muted small">{p.pattern}</span>
          <ConfidenceButtons problemId={p.id} />
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { state, update } = useStore();
  const today = todayISO();
  const plan = buildDailyPlan(state, today);
  const log = state.logs[today] ?? { minutes: 0, journal: '' };

  const togglePlan = (key: string) =>
    update((s) => {
      const k = `${today}|${key}`;
      return { ...s, planDone: { ...s.planDone, [k]: !s.planDone[k] } };
    });
  const setLog = (patch: Partial<typeof log>) =>
    update((s) => ({ ...s, logs: { ...s.logs, [today]: { ...log, ...patch } } }));

  const topicDone = plan.topic ? state.topics[plan.topic.id]?.lastStudied === today : false;
  const markTopic = () =>
    plan.topic &&
    update((s) => {
      const id = plan.topic!.id;
      const prev = s.topics[id] ?? { done: false, checked: [], notes: '' };
      const next = topicDone
        ? { ...prev, done: false, lastStudied: undefined }
        : { ...prev, done: true, lastStudied: today };
      return { ...s, topics: { ...s.topics, [id]: next } };
    });

  const solved = PROBLEMS.filter((p) => state.problems[p.id]?.status === 'solved').length;
  const topicsDone = SD_TOPICS.filter((t) => state.topics[t.id]?.done).length;
  const behavioralKey = `beh:${plan.behavioral.id}`;
  const mockKey = 'mock';

  return (
    <div className="stack">
      <PageHeader title={`Today · ${formatDate(today)}`}>
        Day {plan.dayNumber} · Week {plan.week}: {plan.weekInfo.title}
        {plan.mockDay && ' · Weekend mock day'}
      </PageHeader>

      <div className="stats">
        <Stat value={`🔥 ${currentStreak(state, today)}`} label="day streak" />
        <Stat value={`${solved}/${PROBLEMS.length}`} label="problems solved" />
        <Stat value={`${topicsDone}/${SD_TOPICS.length}`} label="design topics done" />
        <Stat value={state.stories.length} label="STAR stories" />
      </div>

      <div className="grid-2">
        <section className="card">
          <h2>DSA · new problems</h2>
          <p className="muted small">
            Timebox ~30 min each. Rate yourself honestly; it drives the review schedule.
          </p>
          {plan.newProblems.length === 0 ? (
            <p className="empty">You have attempted every problem. Focus on reviews! 🎉</p>
          ) : (
            plan.newProblems.map((p) => <ProblemTask key={p.id} p={p} state={state} today={today} />)
          )}

          <h2 style={{ marginTop: 20 }}>DSA · due for review ({plan.reviews.length})</h2>
          {plan.reviews.length === 0 ? (
            <p className="muted small">Nothing due. Reviews appear here based on your ratings.</p>
          ) : (
            plan.reviews.map((p) => <ProblemTask key={p.id} p={p} state={state} today={today} review />)
          )}
        </section>

        <div className="stack">
          <section className="card">
            <h2>System design</h2>
            {plan.topic ? (
              <div className={`task ${topicDone ? 'done' : ''}`}>
                <CheckButton on={topicDone} onClick={markTopic} label="Mark topic studied" />
                <div className="body">
                  <div className="title">{plan.topic.title}</div>
                  <span className="badge">{plan.topic.category}</span>
                  <ul className="small muted" style={{ marginTop: 6 }}>
                    {plan.topic.keyPoints.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                  <Link className="small" to={`/system-design?topic=${plan.topic.id}`}>
                    Open checklist & notes →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="empty">All topics done. Re-do Fintech case studies as timed mocks.</p>
            )}
          </section>

          <section className="card">
            <h2>Leadership question of the day</h2>
            <div className={`task ${state.planDone[`${today}|${behavioralKey}`] ? 'done' : ''}`}>
              <CheckButton
                on={!!state.planDone[`${today}|${behavioralKey}`]}
                onClick={() => togglePlan(behavioralKey)}
                label="Mark practised"
              />
              <div className="body">
                <div className="title">{plan.behavioral.question}</div>
                <p className="muted small">
                  Say your answer out loud in ~2 minutes, then link a story in{' '}
                  <Link to="/behavioral">your story bank</Link>.
                </p>
              </div>
            </div>
          </section>

          {plan.mockDay && (
            <section className="card">
              <h2>Weekend mock</h2>
              <div className={`task ${state.planDone[`${today}|${mockKey}`] ? 'done' : ''}`}>
                <CheckButton
                  on={!!state.planDone[`${today}|${mockKey}`]}
                  onClick={() => togglePlan(mockKey)}
                  label="Mark mock done"
                />
                <div className="body">
                  <div className="title">One 45-min coding mock + one 45-min design mock</div>
                  <Link className="small" to="/mock">Start a mock →</Link>
                </div>
              </div>
            </section>
          )}

          <section className="card">
            <h2>Study log</h2>
            <div className="row" style={{ marginBottom: 8 }}>
              <label className="field">
                Minutes today
                <input
                  type="number"
                  min={0}
                  step={15}
                  value={log.minutes}
                  onChange={(e) => setLog({ minutes: Math.max(0, Number(e.target.value) || 0) })}
                  style={{ width: 100 }}
                />
              </label>
              {[30, 60].map((m) => (
                <button key={m} className="small" style={{ alignSelf: 'flex-end' }} onClick={() => setLog({ minutes: log.minutes + m })}>
                  +{m}
                </button>
              ))}
            </div>
            <textarea
              placeholder="What did you learn? What tripped you up?"
              value={log.journal}
              onChange={(e) => setLog({ journal: e.target.value })}
            />
          </section>
        </div>
      </div>

      <section className="card">
        <div className="spread">
          <h2>Roadmap progress</h2>
          <span className="muted small">Week {plan.week} of 12</span>
        </div>
        <ProgressBar value={plan.week} total={12} />
      </section>
    </div>
  );
}
