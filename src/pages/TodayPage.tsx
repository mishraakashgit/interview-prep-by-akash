import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useTodayPlan } from '../lib/useTodayPlan';
import { parseISODate } from '../lib/dates';
import { leetcodeUrl } from '../data/dsa';
import { CheckButton, PageHeader, ProgressBar } from '../components/ui';
import ConfidenceButtons from '../components/ConfidenceButtons';
import { useToast } from '../components/Toast';
import type { DsaProblem } from '../types';

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function ProblemTask({ p, done, review }: { p: DsaProblem; done: boolean; review?: boolean }) {
  return (
    <div className={`task ${done ? 'done' : ''}`}>
      <CheckButton on={done} label={p.title} />
      <div className="body">
        <div className="spread">
          <a className="title" href={leetcodeUrl(p.id)} target="_blank" rel="noreferrer">
            {p.title} <span className="faint">↗</span>
          </a>
          <ConfidenceButtons problemId={p.id} />
        </div>
        <div className="meta">
          <span className={`diff-${p.difficulty}`}>{p.difficulty}</span>
          <span>·</span>
          <span>{p.pattern}</span>
          {review && <span className="badge accent">review</span>}
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { state, update } = useStore();
  const toast = useToast();
  const { plan, tasks, done, total } = useTodayPlan();
  const today = plan.date;
  const log = state.logs[today] ?? { minutes: 0, journal: '' };
  const isDone = (key: string) => tasks.find((t) => t.key === key)?.done ?? false;

  const togglePlan = (key: string) =>
    update((s) => {
      const k = `${today}|${key}`;
      return { ...s, planDone: { ...s.planDone, [k]: !s.planDone[k] } };
    });
  const setLog = (patch: Partial<typeof log>) =>
    update((s) => ({ ...s, logs: { ...s.logs, [today]: { ...log, ...patch } } }));

  const topic = plan.topic;
  const topicDone = topic ? isDone(`sd:${topic.id}`) : false;
  const toggleTopic = () => {
    if (!topic) return;
    update((s) => {
      const prev = s.topics[topic.id] ?? { done: false, checked: [], notes: '' };
      const next = topicDone
        ? { ...prev, done: false, doneOn: undefined }
        : { ...prev, done: true, doneOn: today, lastStudied: today };
      return { ...s, topics: { ...s.topics, [topic.id]: next } };
    });
    if (!topicDone) toast(`${topic.title.split(':')[0]} marked done`);
  };

  const behKey = `beh:${plan.behavioral.id}`;
  const remaining = total - done;
  const dateLabel = parseISODate(today).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <PageHeader eyebrow={`${dateLabel} · Day ${plan.dayNumber} · Week ${plan.week}`} title={`${greeting()}.`}>
        This week: <strong>{plan.weekInfo.title}</strong>
        {plan.mockDay && '. It\'s the weekend, so today is a mock day.'}
      </PageHeader>

      <section className="card">
        <div className="goal">
          <div>
            <div className="eyebrow">Today's goal</div>
            <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {done}
              <span className="faint">/{total}</span>
            </div>
          </div>
          <ProgressBar value={done} total={total} tone={remaining === 0 ? 'good' : undefined} />
          <span className="small muted" style={{ minWidth: 90, textAlign: 'right' }}>
            {remaining === 0 ? 'All done ✨' : `${remaining} to go`}
          </span>
        </div>
      </section>

      <section className="card">
        <div className="section-label">
          <h2>Problems</h2>
          <span className="faint small">~30 min each · rate honestly</span>
        </div>
        {plan.newProblems.length === 0 && <p className="empty">Every problem attempted. Reviews only from here 🎉</p>}
        {plan.newProblems.map((p) => (
          <ProblemTask key={p.id} p={p} done={isDone(`dsa:${p.id}`)} />
        ))}
        {plan.reviews.length > 0 && (
          <>
            <div className="section-label" style={{ marginTop: 12 }}>
              <h3 className="muted">Spaced review</h3>
              {plan.reviewBacklog > 0 && (
                <Link className="link small" to="/dsa?filter=due">
                  +{plan.reviewBacklog} more due
                </Link>
              )}
            </div>
            {plan.reviews.map((p) => (
              <ProblemTask key={p.id} p={p} done={isDone(`review:${p.id}`)} review />
            ))}
          </>
        )}
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="section-label">
            <h2>System design</h2>
            {topic && <span className="badge">{topic.category}</span>}
          </div>
          {topic ? (
            <div className={`task ${topicDone ? 'done' : ''}`}>
              <CheckButton on={topicDone} onClick={toggleTopic} label="Mark topic done" />
              <div className="body">
                <span className="title">{topic.title}</span>
                <ul className="small muted">
                  {topic.keyPoints.slice(0, 3).map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
                <Link className="link small" to={`/system-design?topic=${topic.id}`}>
                  Open checklist & notes →
                </Link>
              </div>
            </div>
          ) : (
            <p className="empty">All topics done. Re-run the Fintech ones as timed mocks.</p>
          )}
        </section>

        <section className="card">
          <div className="section-label">
            <h2>Leadership</h2>
            <span className="badge">{plan.behavioral.theme}</span>
          </div>
          <div className={`task ${isDone(behKey) ? 'done' : ''}`}>
            <CheckButton on={isDone(behKey)} onClick={() => togglePlan(behKey)} label="Mark practised" />
            <div className="body">
              <span className="title">{plan.behavioral.question}</span>
              <span className="small muted">
                Answer out loud in ~2 min, then link a story in your{' '}
                <Link className="link" to="/behavioral">
                  story bank
                </Link>
                .
              </span>
            </div>
          </div>
        </section>
      </div>

      {plan.mockDay && (
        <section className="card">
          <div className={`task ${isDone('mock') ? 'done' : ''}`}>
            <CheckButton on={isDone('mock')} onClick={() => togglePlan('mock')} label="Mark mock done" />
            <div className="body">
              <span className="title">Weekend mock: 45 min coding + 45 min design</span>
              <Link className="link small" to="/mock">
                Start a mock →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="card">
        <div className="section-label">
          <h2>Study log</h2>
          <div className="row">
            <span className="mono small muted">{log.minutes} min</span>
            {[15, 30, 60].map((m) => (
              <button key={m} className="small" onClick={() => setLog({ minutes: log.minutes + m })}>
                +{m}
              </button>
            ))}
            {log.minutes > 0 && (
              <button className="small ghost" onClick={() => setLog({ minutes: 0 })}>
                Reset
              </button>
            )}
          </div>
        </div>
        <textarea
          placeholder="What clicked today? What tripped you up?"
          value={log.journal}
          onChange={(e) => setLog({ journal: e.target.value })}
        />
      </section>
    </>
  );
}
