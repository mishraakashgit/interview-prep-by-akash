import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/theme';

const NAV = [
  { to: '/', label: 'Today', end: true },
  { to: '/dsa', label: 'DSA' },
  { to: '/system-design', label: 'System Design' },
  { to: '/behavioral', label: 'Leadership' },
  { to: '/companies', label: 'Companies' },
  { to: '/mock', label: 'Mock' },
  { to: '/settings', label: 'Roadmap' },
];

function timeAgo(ms: number): string {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86_400) return `${Math.round(s / 3600)} h ago`;
  return new Date(ms).toLocaleDateString();
}

function SyncBadge() {
  const { state, sync } = useStore();
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const lastChange = state.updatedAt ? `Last change ${timeAgo(state.updatedAt)}` : 'No changes yet';
  const text = {
    local: 'Saved on this device',
    saving: 'Saving…',
    saved: 'Synced',
    offline: 'Offline · will retry',
    error: 'Sync failed · retrying',
  }[sync.status];
  const title = [lastChange, sync.savedAt && `Last synced ${timeAgo(sync.savedAt)}`].filter(Boolean).join(' · ');

  return (
    <span className={`sync ${sync.status === 'local' ? 'saved' : sync.status}`} title={title}>
      <span className="dot" />
      <span className="text">{text}</span>
    </span>
  );
}

function AccountMenu() {
  const { account } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!account) return null;
  return (
    <div className="menu" ref={ref}>
      <button className="avatar" onClick={() => setOpen(!open)} aria-label="Account menu" aria-expanded={open}>
        {account.email[0]?.toUpperCase()}
      </button>
      {open && (
        <div className="menu-panel">
          <div className="who">{account.email}</div>
          <button onClick={() => (setOpen(false), navigate('/settings'))}>Roadmap & data</button>
          <button className="danger" onClick={account.signOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopBar() {
  const [theme, toggle] = useTheme();
  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <span className="brand-mark" />
        <span>
          interview<em>.prep</em>
        </span>
      </NavLink>
      <nav className="nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="topbar-actions">
        <SyncBadge />
        <button className="ghost icon" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <AccountMenu />
      </div>
    </header>
  );
}
