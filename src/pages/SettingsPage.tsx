import { useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { ROADMAP, buildDailyPlan } from '../lib/plan';
import { addDays, todayISO } from '../lib/dates';
import { defaultState, downloadBackup, normalize } from '../lib/storage';
import { SD_TOPICS } from '../data/systemDesign';
import { PageHeader } from '../components/ui';

export default function SettingsPage() {
  const { state, update, replace } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const currentWeek = buildDailyPlan(state, todayISO()).week;
  const topicTitle = (id: string) => SD_TOPICS.find((t) => t.id === id)?.title ?? id;

  const importFile = async (file: File) => {
    try {
      const data = normalize(JSON.parse(await file.text()));
      if (!confirm('Replace all current progress with this backup?')) return;
      replace(data);
      setMessage('Backup restored.');
    } catch (e) {
      setMessage(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="stack">
      <PageHeader title="Roadmap & data" />

      <section className="card">
        <h2>12-week roadmap</h2>
        <p className="muted small">
          Weekdays: 2 new DSA problems, due reviews, one design topic and one leadership question. Weekends: a timed mock
          plus one problem. After week 12 the plan keeps going in revision mode.
        </p>
        <label className="field" style={{ maxWidth: 220, margin: '12px 0' }}>
          Plan start date
          <input
            type="date"
            value={state.startDate}
            max={todayISO()}
            onChange={(e) => e.target.value && update((s) => ({ ...s, startDate: e.target.value }))}
          />
        </label>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Theme</th>
                <th>DSA patterns</th>
                <th>System design</th>
              </tr>
            </thead>
            <tbody>
              {ROADMAP.map((w, i) => (
                <tr key={w.title} style={i + 1 === currentWeek ? { background: 'var(--accent-soft)' } : undefined}>
                  <td>
                    <strong>{i + 1}</strong>
                    <div className="muted small">{addDays(state.startDate, i * 7)}</div>
                  </td>
                  <td>{w.title}</td>
                  <td className="small">{w.patterns.join(', ') || 'Revisit weak problems'}</td>
                  <td className="small">{w.topics.map(topicTitle).join('; ') || 'Full mocks'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card stack">
        <h2 style={{ margin: 0 }}>Your data</h2>
        <p className="muted small">
          Progress is saved in this browser only. Export a backup regularly, and import it to move to another device.
        </p>
        <div className="row">
          <button className="primary" onClick={() => downloadBackup(state)}>
            Export backup
          </button>
          <button onClick={() => fileRef.current?.click()}>Import backup</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
              e.target.value = '';
            }}
          />
          <button
            className="danger"
            onClick={() => confirm('Erase ALL progress? Export a backup first.') && replace(defaultState())}
          >
            Reset everything
          </button>
        </div>
        {message && <p className="small">{message}</p>}
      </section>
    </div>
  );
}
