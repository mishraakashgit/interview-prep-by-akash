import { useState } from 'react';
import { useStore } from '../lib/store';
import { newId } from '../lib/storage';
import { BEHAVIORAL_QUESTIONS, BEHAVIORAL_THEMES, STAR_TIPS } from '../data/behavioral';
import { PageHeader } from '../components/ui';
import type { Story } from '../types';

const blankStory = (): Story => ({
  id: newId(),
  title: '',
  situation: '',
  task: '',
  action: '',
  result: '',
  questionIds: [],
});

const STAR_FIELDS = [
  ['situation', 'Situation', 'Context: team, product, stakes'],
  ['task', 'Task', 'What you were responsible for'],
  ['action', 'Action', 'What YOU did: decisions, trade-offs, how you led people'],
  ['result', 'Result', 'Quantified outcome + what you learned'],
] as const;

function StoryEditor({ story, onDone }: { story: Story; onDone: () => void }) {
  const { state, update } = useStore();
  const [draft, setDraft] = useState(story);
  const exists = state.stories.some((s) => s.id === story.id);

  const save = () => {
    update((s) => ({
      ...s,
      stories: exists ? s.stories.map((x) => (x.id === draft.id ? draft : x)) : [...s.stories, draft],
    }));
    onDone();
  };
  const remove = () => {
    if (!confirm('Delete this story?')) return;
    update((s) => ({ ...s, stories: s.stories.filter((x) => x.id !== story.id) }));
    onDone();
  };
  const toggleQ = (id: string) =>
    setDraft((d) => ({
      ...d,
      questionIds: d.questionIds.includes(id) ? d.questionIds.filter((x) => x !== id) : [...d.questionIds, id],
    }));

  return (
    <section className="card stack">
      <label className="field">
        Story title
        <input
          value={draft.title}
          placeholder="e.g. Migrated payments service to event-driven architecture"
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
      </label>
      {STAR_FIELDS.map(([key, label, hint]) => (
        <label key={key} className="field">
          {label}
          <textarea placeholder={hint} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
        </label>
      ))}
      <details>
        <summary className="small">Questions this story answers ({draft.questionIds.length})</summary>
        <ul className="checklist" style={{ marginTop: 8 }}>
          {BEHAVIORAL_QUESTIONS.map((q) => (
            <li key={q.id}>
              <label className="small">
                <input type="checkbox" checked={draft.questionIds.includes(q.id)} onChange={() => toggleQ(q.id)} />
                <span>{q.question}</span>
              </label>
            </li>
          ))}
        </ul>
      </details>
      <div className="row">
        <button className="primary" onClick={save} disabled={!draft.title.trim()}>
          Save story
        </button>
        <button onClick={onDone}>Cancel</button>
        {exists && (
          <button className="danger" onClick={remove}>
            Delete
          </button>
        )}
      </div>
    </section>
  );
}

export default function BehavioralPage() {
  const { state } = useStore();
  const [editing, setEditing] = useState<Story | null>(null);

  const storiesFor = (qid: string) => state.stories.filter((s) => s.questionIds.includes(qid));
  const covered = BEHAVIORAL_QUESTIONS.filter((q) => storiesFor(q.id).length > 0).length;

  return (
    <div className="stack">
      <PageHeader title="Leadership & behavioral">
        For lead roles this round often decides the level you get. Build a bank of STAR stories and map each one to the
        questions it answers.
      </PageHeader>

      <section className="card">
        <h2>STAR tips</h2>
        <ul>
          {STAR_TIPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="stack">
        <div className="spread">
          <h2 style={{ margin: 0 }}>Story bank ({state.stories.length})</h2>
          {!editing && (
            <button className="primary" onClick={() => setEditing(blankStory())}>
              + New story
            </button>
          )}
        </div>
        {editing && <StoryEditor key={editing.id} story={editing} onDone={() => setEditing(null)} />}
        {state.stories.length === 0 && !editing && (
          <p className="card empty">
            No stories yet. Start with: your biggest delivery as a lead, a production incident, a disagreement, and a time
            you mentored someone.
          </p>
        )}
        <div className="grid">
          {state.stories.map((s) => (
            <article key={s.id} className="card">
              <h3>{s.title}</h3>
              <p className="muted small">{s.result || s.situation || 'No details yet'}</p>
              <div className="spread">
                <span className="badge accent">{s.questionIds.length} question(s)</span>
                <button className="small" onClick={() => setEditing(s)}>
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="spread">
          <h2 style={{ margin: 0 }}>Question bank</h2>
          <span className="muted small">
            {covered}/{BEHAVIORAL_QUESTIONS.length} have a story
          </span>
        </div>
        {BEHAVIORAL_THEMES.map((theme) => (
          <div key={theme} style={{ marginTop: 16 }}>
            <h3>{theme}</h3>
            <ul className="checklist">
              {BEHAVIORAL_QUESTIONS.filter((q) => q.theme === theme).map((q) => {
                const stories = storiesFor(q.id);
                return (
                  <li key={q.id} className="spread">
                    <span>{q.question}</span>
                    {stories.length ? (
                      <span className="badge good" title={stories.map((s) => s.title).join(', ')}>
                        {stories.length} story
                      </span>
                    ) : (
                      <span className="badge warn">no story</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
