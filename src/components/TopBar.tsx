import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/theme';
import { downloadBackup, normalize } from '../lib/storage';
import { useToast } from './Toast';
import { PillLogo, Wordmark } from './Brand';

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
  const title = [sync.error && `Error: ${sync.error}`, lastChange, sync.savedAt && `Last synced ${timeAgo(sync.savedAt)}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <span className={`sync ${sync.status === 'local' ? 'saved' : sync.status}`} title={title}>
      <span className="dot" />
      <span className="text">{text}</span>
    </span>
  );
}

/** Account and data actions; shown signed in or not, since backups matter in both modes. */
function Menu() {
  const { state, replace, account } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const importFile = async (file: File) => {
    try {
      const data = normalize(JSON.parse(await file.text()));
      if (!confirm('Replace all current progress with this backup?')) return;
      replace(data);
      toast('Backup restored');
    } catch (e) {
      toast(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="menu" ref={ref}>
      {account ? (
        <button className="avatar" onClick={() => setOpen(!open)} aria-label="Account menu" aria-expanded={open}>
          {account.email[0]?.toUpperCase()}
        </button>
      ) : (
        <button className="ghost icon" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          ⋯
        </button>
      )}
      {open && (
        <div className="menu-panel">
          <div className="who">{account ? account.email : 'Saved in this browser only'}</div>
          <button onClick={() => (setOpen(false), downloadBackup(state))}>Export backup</button>
          <button onClick={() => fileRef.current?.click()}>Import backup</button>
          {account && (
            <button className="danger" onClick={account.signOut}>
              Sign out
            </button>
          )}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importFile(f);
          e.target.value = '';
          setOpen(false);
        }}
      />
    </div>
  );
}

export default function TopBar() {
  const [theme, toggle] = useTheme();
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="pillsdev home">
        <PillLogo size={28} />
        <Wordmark />
      </Link>
      <span style={{ flex: 1 }} />
      <div className="topbar-actions">
        <SyncBadge />
        <button className="ghost icon" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <Menu />
      </div>
    </header>
  );
}
