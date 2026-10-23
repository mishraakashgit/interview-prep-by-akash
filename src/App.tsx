import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import TodayPage from './pages/TodayPage';
import DsaPage from './pages/DsaPage';
import SystemDesignPage from './pages/SystemDesignPage';
import BehavioralPage from './pages/BehavioralPage';
import CompaniesPage from './pages/CompaniesPage';
import MockPage from './pages/MockPage';
import SettingsPage from './pages/SettingsPage';

const NAV = [
  { to: '/', label: 'Today', end: true },
  { to: '/dsa', label: 'DSA' },
  { to: '/system-design', label: 'System Design' },
  { to: '/behavioral', label: 'Leadership & Behavioral' },
  { to: '/companies', label: 'Companies' },
  { to: '/mock', label: 'Mock Interview' },
  { to: '/settings', label: 'Roadmap & Data' },
];

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          Interview Prep
          <small>Lead Engineer · FinTech track</small>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/dsa" element={<DsaPage />} />
          <Route path="/system-design" element={<SystemDesignPage />} />
          <Route path="/behavioral" element={<BehavioralPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/mock" element={<MockPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
