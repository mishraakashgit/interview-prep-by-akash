import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { SD_CATEGORIES, SD_FRAMEWORK, SD_TOPICS } from '../data/systemDesign';
import { todayISO } from '../lib/dates';
import { PageHeader, ProgressBar } from '../components/ui';
import type { SdTopic, TopicProgress } from '../types';

const EMPTY: TopicProgress = { done: false, checked: [], notes: '' };

function TopicCard({ topic, open }: { topic: SdTopic; open: boolean }) {
  const { state, update } = useStore();
  const prog = state.topics[topic.id] ?? EMPTY;
  const set = (patch: Partial<TopicProgress>) =>
    update((s) => ({
      ...s,
      topics: { ...s.topics, [topic.id]: { ...(s.topics[topic.id] ?? EMPTY), ...patch, lastStudied: todayISO() } },
    }));
  const toggleCheck = (i: number) =>
    set({ checked: prog.checked.includes(i) ? prog.checked.filter((x) => x !== i) : [...prog.checked, i] });

  return (
    <details id={topic.id} className="card" open={open}>
      <summary>
        <span className="spread" style={{ display: 'inline-flex', width: 'calc(100% - 20px)' }}>
          <strong>
            {prog.done ? '✅ ' : ''}
            {topic.title}
          </strong>
          <span className="muted small">
            {prog.checked.length}/{topic.keyPoints.length}
          </span>
        </span>
      </summary>
      <div className="stack" style={{ marginTop: 12 }}>
        <ul className="checklist">
          {topic.keyPoints.map((k, i) => (
            <li key={k}>
              <label>
                <input type="checkbox" checked={prog.checked.includes(i)} onChange={() => toggleCheck(i)} />
                <span>{k}</span>
              </label>
            </li>
          ))}
        </ul>
        <textarea
          placeholder="Your notes: diagram links, numbers, trade-offs you would mention…"
          value={prog.notes}
          onChange={(e) => set({ notes: e.target.value })}
        />
        <div className="spread">
          <span className="muted small">{prog.lastStudied ? `Last studied ${prog.lastStudied}` : 'Not started'}</span>
          <button className={prog.done ? '' : 'primary'} onClick={() => set({ done: !prog.done })}>
            {prog.done ? 'Mark not done' : 'Mark done'}
          </button>
        </div>
      </div>
    </details>
  );
}

export default function SystemDesignPage() {
  const { state } = useStore();
  const [params] = useSearchParams();
  const focus = params.get('topic');
  const [category, setCategory] = useState<SdTopic['category'] | ''>('');

  useEffect(() => {
    if (focus) document.getElementById(focus)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focus]);

  const done = SD_TOPICS.filter((t) => state.topics[t.id]?.done).length;

  return (
    <div className="stack">
      <PageHeader title="System design">
        Fundamentals first, then case studies. The Fintech set is what Visa, Mastercard and the banks love to ask.
      </PageHeader>

      <section className="card">
        <h2>The 45-minute framework</h2>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {SD_FRAMEWORK.map((f) => (
            <li key={f.step} style={{ marginBottom: 6 }}>
              <strong>{f.step}</strong> <span className="muted">{f.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="card stack">
        <div className="spread">
          <span>
            <strong>{done}</strong> of {SD_TOPICS.length} topics done
          </span>
          <div className="row">
            <button className={`small ${category === '' ? 'selected' : ''}`} onClick={() => setCategory('')}>
              All
            </button>
            {SD_CATEGORIES.map((c) => (
              <button key={c} className={`small ${category === c ? 'selected' : ''}`} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <ProgressBar value={done} total={SD_TOPICS.length} />
      </div>

      {SD_CATEGORIES.filter((c) => !category || c === category).map((c) => (
        <section key={c} className="stack">
          <h2 style={{ margin: '8px 0 0' }}>{c}</h2>
          {SD_TOPICS.filter((t) => t.category === c).map((t) => (
            <TopicCard key={t.id} topic={t} open={t.id === focus} />
          ))}
        </section>
      ))}
    </div>
  );
}
