import { useState, type FormEvent } from 'react';
import { confirmResetPassword, confirmSignUp, resendSignUpCode, resetPassword, signIn, signUp } from 'aws-amplify/auth';

type Mode = 'signIn' | 'signUp' | 'confirm' | 'forgot' | 'reset';

const COPY: Record<Mode, { title: string; cta: string }> = {
  signIn: { title: 'Welcome back', cta: 'Sign in' },
  signUp: { title: 'Create your account', cta: 'Create account' },
  confirm: { title: 'Check your email', cta: 'Verify' },
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

  const go = (m: Mode) => {
    setMode(m);
    setError('');
    setInfo('');
    setCode('');
  };

  const doSignIn = async () => {
    const { nextStep } = await signIn({ username: email, password });
    if (nextStep.signInStep === 'DONE') return onSignedIn();
    if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
      await resendSignUpCode({ username: email });
      go('confirm');
      setInfo('Your email is not verified yet. We sent you a new code.');
      return;
    }
    throw new Error(`Unsupported sign-in step: ${nextStep.signInStep}`);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'signIn') await doSignIn();
      if (mode === 'signUp') {
        const { nextStep } = await signUp({ username: email, password, options: { userAttributes: { email } } });
        if (nextStep.signUpStep === 'DONE') await doSignIn();
        else {
          go('confirm');
          setInfo(`We sent a 6-digit code to ${email}.`);
        }
      }
      if (mode === 'confirm') {
        await confirmSignUp({ username: email, confirmationCode: code.trim() });
        if (password) await doSignIn();
        else go('signIn');
      }
      if (mode === 'forgot') {
        await resetPassword({ username: email });
        go('reset');
        setInfo(`If an account exists for ${email}, a code is on its way.`);
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

  const needsPassword = mode === 'signIn' || mode === 'signUp' || mode === 'reset';
  const needsCode = mode === 'confirm' || mode === 'reset';

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
            <label className="field">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                disabled={mode === 'confirm' || mode === 'reset'}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {needsCode && (
              <label className="field">
                Verification code
                <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
              </label>
            )}
            {needsPassword && (
              <label className="field">
                {mode === 'reset' ? 'New password' : 'Password'}
                <input
                  type="password"
                  autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {mode !== 'signIn' && (
                  <span className="faint">8+ characters with upper and lower case, a number and a symbol.</span>
                )}
              </label>
            )}
            <button className="primary" disabled={busy}>
              {busy ? 'Please wait…' : COPY[mode].cta}
            </button>
          </form>
          {mode === 'signIn' && (
            <button className="ghost small" onClick={() => go('forgot')}>
              Forgot password?
            </button>
          )}
          {mode === 'confirm' && (
            <button className="ghost small" disabled={busy} onClick={() => resendSignUpCode({ username: email }).then(() => setInfo('New code sent.'))}>
              Resend code
            </button>
          )}
        </div>
        <p className="auth-switch">
          {mode === 'signIn' ? (
            <>
              New here? <button onClick={() => go('signUp')}>Create an account</button>
            </>
          ) : (
            <>
              Have an account? <button onClick={() => go('signIn')}>Sign in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
