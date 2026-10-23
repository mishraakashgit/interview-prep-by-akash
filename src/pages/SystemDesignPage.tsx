import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { SD_CATEGORIES, SD_FRAMEWORK, SD_TOPICS } from '../data/systemDesign';
import { todayISO } from '../lib/dates';
import { Chevron, PageHeader, ProgressBar } from '../components/ui';
import { useToast } from '../components/Toast';
import type { SdTopic, TopicProgress } from '../types';

const EMPTY: TopicProgress = { done: false, checked: [], notes: '' };

function TopicCard({ topic, open }: { topic: SdTopic; open: boolean }) {
  const { state, update } = useStore();
  const toast = useToast();
  const prog = state.topics[topic.id] ?? EMPTY;
  const set = (patch: Partial<TopicProgress>) =>
    update((s) => ({
      ...s,
      topics: { ...s.topics, [topic.id]: { ...(s.topics[topic.id] ?? EMPTY), ...patch, lastStudied: todayISO() } },
    }));
  const toggleDone = () => {
    set(prog.done ? { done: false, doneOn: undefined } : { done: true, doneOn: todayISO() });
    if (!prog.done) toast('Topic done ✓');
  };
  const toggleCheck = (i: number) =>
    set({ checked: prog.checked.includes(i) ? prog.checked.filter((x) => x !== i) : [...prog.checked, i] });

  return (
    <details id={topic.id} className="accordion" open={open}>
      <summary>
        <span className="row" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
          <Chevron />
          <span style={{ fontWeight: 500, color: prog.done ? 'var(--muted)' : undefined }}>{topic.title}</span>
          {prog.done && <span className="badge good">done</span>}
        </span>
        <ProgressBar value={prog.checked.length} total={topic.keyPoints.length} tone="good" />
        <span className="mono small muted">
          {prog.checked.length}/{topic.keyPoints.length}
        </span>
      </summary>
      <div className="stack" style={{ padding: '0 18px 18px' }}>
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
          <button className={prog.done ? '' : 'primary'} onClick={toggleDone}>
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
      <PageHeader eyebrow={`${done} of ${SD_TOPICS.length} topics done`} title="System design">
        Fundamentals first, then case studies. The Fintech set is what Visa, Mastercard and the banks love to ask.
      </PageHeader>

      <section className="card">
        <details>
        <summary><h2 style={{ display: 'inline' }}>The 45-minute answer framework</h2></summary>
        <ol style={{ margin: '12px 0 0', paddingLeft: 20 }}>
          {SD_FRAMEWORK.map((f) => (
            <li key={f.step} style={{ marginBottom: 6 }}>
              <strong>{f.step}</strong> <span className="muted">{f.detail}</span>
            </li>
          ))}
        </ol>
        </details>
      </section>

      <div className="segmented" style={{ alignSelf: 'flex-start' }}>
        <button className={category === '' ? 'selected' : ''} onClick={() => setCategory('')}>
          All
        </button>
        {SD_CATEGORIES.map((c) => (
          <button key={c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {SD_CATEGORIES.filter((c) => !category || c === category).map((c) => (
        <section key={c} className="stack-sm">
          <div className="eyebrow" style={{ margin: '8px 0 4px' }}>{c}</div>
          {SD_TOPICS.filter((t) => t.category === c).map((t) => (
            <TopicCard key={t.id} topic={t} open={t.id === focus} />
          ))}
        </section>
      ))}
    </div>
  );
}
