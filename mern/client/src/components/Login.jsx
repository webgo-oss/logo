import { useState } from 'react';
import { loginUser, loginAdmin } from '../api.js';

// mode "user": email + access code (given by the admin)   mode "admin": email + password
export default function Login({ mode, onSuccess, navigate }) {
  const isAdmin = mode === 'admin';
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = isAdmin ? await loginAdmin(email, secret) : await loginUser(email, secret);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const go = (to) => (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="eyebrow">{isAdmin ? 'Administrator' : 'Brand Assets'}</div>
        <h1>{isAdmin ? 'Admin sign in' : 'Unstoppable Logos'}</h1>
        <p className="auth-sub">
          {isAdmin
            ? 'Sign in with your admin email and password.'
            : 'Enter your email and the access code you received from the administrator.'}
        </p>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>

        <label className="field">
          <span>{isAdmin ? 'Password' : 'Access code'}</span>
          <input
            type={isAdmin ? 'password' : 'text'}
            className={isAdmin ? '' : 'code-input'}
            autoComplete={isAdmin ? 'current-password' : 'off'}
            autoCapitalize={isAdmin ? 'none' : 'characters'}
            spellCheck="false"
            required
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={isAdmin ? '••••••••' : 'XXXXX-XXXXX'}
          />
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth-switch">
          {isAdmin ? (
            <a href="/login" onClick={go('/login')}>← Back to user sign in</a>
          ) : (
            <a href="/admin/login" onClick={go('/admin/login')}>Admin sign in</a>
          )}
        </p>
      </form>
    </div>
  );
}
