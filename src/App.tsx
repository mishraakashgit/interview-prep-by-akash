import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import TodayPage from './pages/TodayPage';
import DsaPage from './pages/DsaPage';
import SystemDesignPage from './pages/SystemDesignPage';
import BehavioralPage from './pages/BehavioralPage';
import CompaniesPage from './pages/CompaniesPage';
import MockPage from './pages/MockPage';
import SettingsPage from './pages/SettingsPage';
import TopBar from './components/TopBar';
import ProgressRail from './components/ProgressRail';
import { DailyGoalTracker } from './lib/useTodayPlan';

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <DailyGoalTracker />
      <TopBar />
      <div className="shell">
        {/* Re-keyed per route so each page fades in. */}
        <main key={pathname} className="stack fade-in" style={{ minWidth: 0 }}>
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
        <ProgressRail />
      </div>
    </>
  );
}
