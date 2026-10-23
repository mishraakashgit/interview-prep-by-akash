import { useState, type FormEvent } from 'react';
import { confirmResetPassword, confirmSignIn, resetPassword, signIn } from 'aws-amplify/auth';

// Sign-up is disabled in the backend (invite-only): accounts are created from
// the Cognito console, and the first sign-in replaces the emailed temporary password.
type Mode = 'signIn' | 'newPassword' | 'forgot' | 'reset';

const COPY: Record<Mode, { title: string; cta: string }> = {
  signIn: { title: 'Welcome back', cta: 'Sign in' },
  newPassword: { title: 'Set your password', cta: 'Save and continue' },
  forgot: { title: 'Reset password', cta: 'Send code' },
  reset: { title: 'Choose a new password', cta: 'Update password' },
};

export default function LoginPage({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const go = (m: Mode, message = '') => {
    setMode(m);
    setError('');
    setInfo(message);
    setCode('');
  };

  const doSignIn = async () => {
    const { nextStep } = await signIn({ username: email, password });
    if (nextStep.signInStep === 'DONE') return onSignedIn();
    if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      setPassword('');
      return go('newPassword', 'First sign-in: replace the temporary password from your invite email.');
    }
    throw new Error(`Unsupported sign-in step: ${nextStep.signInStep}`);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'signIn') await doSignIn();
      if (mode === 'newPassword') {
        const { nextStep } = await confirmSignIn({ challengeResponse: password });
        if (nextStep.signInStep !== 'DONE') throw new Error(`Unsupported sign-in step: ${nextStep.signInStep}`);
        onSignedIn();
      }
      if (mode === 'forgot') {
        await resetPassword({ username: email });
        go('reset', `If an account exists for ${email}, a code is on its way.`);
      }
      if (mode === 'reset') {
        await confirmResetPassword({ username: email, confirmationCode: code.trim(), newPassword: password });
        await doSignIn();
      }
    } catch (err) {
      setError((err as Error).message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const needsCode = mode === 'reset';
  const needsPassword = mode !== 'forgot';
  const newPassword = mode === 'newPassword' || mode === 'reset';

  return (
    <div className="auth">
      <div className="auth-card fade-in">
        <div className="brand">
          <span className="brand-mark" />
          <span>
            interview<em>.prep</em>
          </span>
        </div>
        <div className="card stack">
          <h1 className="display" style={{ fontSize: '1.9rem' }}>
            {COPY[mode].title}
          </h1>
          {info && <p className="muted small">{info}</p>}
          {error && <p className="auth-error">{error}</p>}
          <form onSubmit={submit}>
            {mode !== 'newPassword' && (
              <label className="field">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  disabled={mode === 'reset'}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {needsCode && (
              <label className="field">
                Verification code
                <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
              </label>
            )}
            {needsPassword && (
              <label className="field">
                {newPassword ? 'New password' : 'Password'}
                <input
                  type="password"
                  autoComplete={newPassword ? 'new-password' : 'current-password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {newPassword && <span className="faint">8+ characters with upper and lower case, a number and a symbol.</span>}
              </label>
            )}
            <button className="primary" disabled={busy}>
              {busy ? 'Please wait…' : COPY[mode].cta}
            </button>
          </form>
          {mode === 'signIn' ? (
            <button className="ghost small" onClick={() => go('forgot')}>
              Forgot password?
            </button>
          ) : (
            mode !== 'newPassword' && (
              <button className="ghost small" onClick={() => go('signIn')}>
                Back to sign in
              </button>
            )
          )}
        </div>
        <p className="auth-switch">Invite-only · ask the owner for an account</p>
      </div>
    </div>
  );
}
