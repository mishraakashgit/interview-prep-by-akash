import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { StoreProvider } from '../lib/store';
import { cloudEnabled, createCloudAdapter } from '../lib/cloud';
import { defaultState, loadState, userStorageKey, STORAGE_KEY } from '../lib/storage';
import { resolveInitial, type CloudAdapter } from '../lib/sync';
import LoginPage from './LoginPage';
import type { AppState } from '../types';

/** Without an Amplify backend the app stores progress in this browser only. */
function LocalOnly({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadState() ?? defaultState());
  return (
    <StoreProvider initial={initial} storageKey={STORAGE_KEY}>
      {children}
    </StoreProvider>
  );
}

type Session =
  | { phase: 'checking' }
  | { phase: 'signedOut' }
  | { phase: 'loading'; email: string }
  | { phase: 'loadFailed'; email: string; message: string }
  | { phase: 'ready'; userId: string; email: string; adapter: CloudAdapter; initial: AppState; upload: boolean };

function Cloud({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ phase: 'checking' });
  const [error, setError] = useState('');

  const bootstrap = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const email = user.signInDetails?.loginId ?? user.username;
      setSession({ phase: 'loading', email });
      const adapter = createCloudAdapter(user.userId);
      const cache = loadState(userStorageKey(user.userId));
      let cloud: AppState | null;
      try {
        cloud = await adapter.load();
      } catch (e) {
        // Don't guess while offline: starting from a stale copy could overwrite newer cloud data.
        setSession({ phase: 'loadFailed', email, message: (e as Error).message });
        return;
      }
      const { state, needsUpload } = resolveInitial(cloud, cache, loadState());
      setSession({ phase: 'ready', userId: user.userId, email, adapter, initial: state, upload: needsUpload });
    } catch (e) {
      const name = (e as Error).name;
      if (name !== 'UserUnAuthenticatedException' && name !== 'UserUnauthenticatedException') {
        setError((e as Error).message);
      }
      setSession({ phase: 'signedOut' });
    }
  }, []);

  useEffect(() => void bootstrap(), [bootstrap]);

  if (session.phase === 'checking' || session.phase === 'loading') {
    return <div className="center-screen">{session.phase === 'loading' ? 'Loading your progress…' : ''}</div>;
  }
  if (session.phase === 'loadFailed') {
    return (
      <div className="center-screen">
        <div className="card stack" style={{ maxWidth: 380, textAlign: 'center' }}>
          <h2>Couldn't load your progress</h2>
          <p className="muted small">Check your connection and try again. ({session.message})</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="primary" onClick={() => void bootstrap()}>
              Retry
            </button>
            <button onClick={() => void signOut().finally(() => setSession({ phase: 'signedOut' }))}>Sign out</button>
          </div>
        </div>
      </div>
    );
  }
  if (session.phase === 'signedOut') {
    return (
      <>
        {error && <p className="auth-error" style={{ position: 'fixed', top: 16, left: 16, right: 16 }}>{error}</p>}
        <LoginPage onSignedIn={() => void bootstrap()} />
      </>
    );
  }
  return (
    <StoreProvider
      key={session.userId}
      initial={session.initial}
      storageKey={userStorageKey(session.userId)}
      adapter={session.adapter}
      uploadInitial={session.upload}
      account={{
        email: session.email,
        signOut: () => void signOut().finally(() => setSession({ phase: 'signedOut' })),
      }}
    >
      {children}
    </StoreProvider>
  );
}

export default function AuthGate({ children }: { children: ReactNode }) {
  return cloudEnabled ? <Cloud>{children}</Cloud> : <LocalOnly>{children}</LocalOnly>;
}
