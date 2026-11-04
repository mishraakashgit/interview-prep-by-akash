import DsaPage from './pages/DsaPage';
import TopBar from './components/TopBar';
import ProgressRail from './components/ProgressRail';

export default function App() {
  return (
    <>
      <TopBar />
      <div className="shell">
        <main className="stack fade-in" style={{ minWidth: 0 }}>
          <DsaPage />
        </main>
        <ProgressRail />
      </div>
    </>
  );
}
