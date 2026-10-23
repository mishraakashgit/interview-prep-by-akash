import { useState } from 'react';
import { useStore } from '../lib/store';
import { newId } from '../lib/storage';
import { todayISO } from '../lib/dates';
import { COMPANIES } from '../data/companies';
import { PageHeader } from '../components/ui';
import type { Application, ApplicationStage } from '../types';

const STAGES: ApplicationStage[] = [
  'Researching',
  'Applied',
  'Recruiter Screen',
  'Technical Rounds',
  'Final / Managerial',
  'Offer',
  'Rejected',
];

const STAGE_BADGE: Partial<Record<ApplicationStage, string>> = { Offer: 'good', Rejected: 'bad', 'Technical Rounds': 'accent', 'Final / Managerial': 'accent' };

function ApplicationTracker() {
  const { state, update } = useStore();
  const [company, setCompany] = useState(COMPANIES[0].name);
  const [role, setRole] = useState('Lead Software Engineer');

  const add = () => {
    const app: Application = { id: newId(), company, role, stage: 'Researching', updated: todayISO(), notes: '' };
    update((s) => ({ ...s, applications: [...s.applications, app] }));
  };
  const patch = (id: string, p: Partial<Application>) =>
    update((s) => ({
      ...s,
      applications: s.applications.map((a) => (a.id === id ? { ...a, ...p, updated: todayISO() } : a)),
    }));
  const remove = (id: string) =>
    confirm('Remove this application?') &&
    update((s) => ({ ...s, applications: s.applications.filter((a) => a.id !== id) }));

  return (
    <section className="card">
      <h2>Application tracker</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        <input list="company-list" value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company" />
        <datalist id="company-list">
          {COMPANIES.map((c) => (
            <option key={c.id} value={c.name} />
          ))}
        </datalist>
        <input value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role" />
        <button className="primary" onClick={add} disabled={!company.trim()}>
          Add
        </button>
      </div>
      {state.applications.length === 0 ? (
        <p className="muted small">Track each application here: stage, interviewer names, feedback, next steps.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Company / role</th>
                <th>Stage</th>
                <th>Notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.applications.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.company}</strong>
                    <div className="muted small">{a.role}</div>
                    <div className="muted small">Updated {a.updated}</div>
                  </td>
                  <td>
                    <select value={a.stage} onChange={(e) => patch(a.id, { stage: e.target.value as ApplicationStage })}>
                      {STAGES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <div style={{ marginTop: 4 }}>
                      <span className={`badge ${STAGE_BADGE[a.stage] ?? ''}`}>{a.stage}</span>
                    </div>
                  </td>
                  <td style={{ minWidth: 220 }}>
                    <textarea
                      value={a.notes}
                      placeholder="Next step, interviewer, feedback…"
                      onChange={(e) => patch(a.id, { notes: e.target.value })}
                    />
                  </td>
                  <td>
                    <button className="small ghost danger" onClick={() => remove(a.id)} aria-label="Remove">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function CompaniesPage() {
  const { state, update } = useStore();
  return (
    <div className="stack">
      <PageHeader title="Target companies">
        Based on commonly reported candidate experiences. Rounds vary by team and location, so confirm with your recruiter
        and add what you learn to your notes.
      </PageHeader>

      <ApplicationTracker />

      <div className="grid-2">
        {COMPANIES.map((c) => (
          <section key={c.id} className="card stack">
            <h2 style={{ margin: 0 }}>{c.name}</h2>
            <div>
              <h3>What they focus on</h3>
              <ul className="small">
                {c.focus.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Prep tips</h3>
              <ul className="small">
                {c.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <label className="field">
              Your notes
              <textarea
                placeholder="Questions you were asked, recruiter info, team details…"
                value={state.companyNotes[c.id] ?? ''}
                onChange={(e) => update((s) => ({ ...s, companyNotes: { ...s.companyNotes, [c.id]: e.target.value } }))}
              />
            </label>
          </section>
        ))}
      </div>
    </div>
  );
}
