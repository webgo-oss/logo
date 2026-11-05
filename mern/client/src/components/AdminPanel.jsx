import { useEffect, useState } from 'react';
import { listUsers, createUser, regenerateCode, setUserActive, deleteUser } from '../api.js';

const fmt = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function AdminPanel({ session, navigate, onLogout, onExpired }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(null); // { email, code, kind }
  const [copied, setCopied] = useState(false);

  const fail = (err) => {
    if (err.status === 401) return onExpired();
    setError(err.message);
  };

  const load = () =>
    listUsers()
      .then((u) => {
        setUsers(u);
        setError('');
      })
      .catch(fail);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user, code } = await createUser(email, name);
      setReveal({ email: user.email, code, kind: 'created' });
      setCopied(false);
      setEmail('');
      setName('');
      await load();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function newCode(u) {
    if (!window.confirm(`Create a new access code for ${u.email}?\nTheir current code stops working and they will be signed out.`)) return;
    try {
      const { code } = await regenerateCode(u.id);
      setReveal({ email: u.email, code, kind: 'regenerated' });
      setCopied(false);
      await load();
    } catch (err) {
      fail(err);
    }
  }

  async function toggle(u) {
    try {
      await setUserActive(u.id, !u.active);
      await load();
    } catch (err) {
      fail(err);
    }
  }

  async function remove(u) {
    if (!window.confirm(`Delete ${u.email}? They will lose access immediately.`)) return;
    try {
      await deleteUser(u.id);
      if (reveal && reveal.email === u.email) setReveal(null);
      await load();
    } catch (err) {
      fail(err);
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement('textarea');
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopied(true);
  }

  const go = (to) => (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <>
      <header className="hero slim">
        <div className="wrap">
          <nav>
            <strong className="brandtext">Unstoppable · Admin</strong>
            <div className="account">
              <span className="who">{session.email}</span>
              <a href="/" onClick={go('/')}>View logos</a>
              <button className="linkbtn" onClick={onLogout}>Sign out</button>
            </div>
          </nav>
          <h1>Admin panel</h1>
          <p>Add people and give them an access code. Only users you add here can open the logo page.</p>
        </div>
      </header>

      <main className="wrap admin">
        <section className="panel">
          <h2>Add a user</h2>
          <form className="add-form" onSubmit={add}>
            <label className="field">
              <span>Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@company.com" />
            </label>
            <label className="field">
              <span>Name <em>(optional)</em></span>
              <input type="text" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </label>
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create user & code'}</button>
          </form>

          {reveal && (
            <div className="reveal" role="status">
              <div>
                <strong>{reveal.kind === 'created' ? 'User created.' : 'New code created.'}</strong>{' '}
                Send this to <b>{reveal.email}</b>. For security it is shown only once.
              </div>
              <div className="reveal-row">
                <code className="reveal-code">{reveal.code}</code>
                <button className="btn small" onClick={() => copy(reveal.code)}>{copied ? 'Copied ✓' : 'Copy code'}</button>
                <button className="btn small ghost" onClick={() => setReveal(null)}>Done</button>
              </div>
            </div>
          )}

          {error && <div className="form-error" role="alert">{error}</div>}
        </section>

        <section className="panel">
          <h2>Users {users && <span className="count">{users.length}</span>}</h2>
          {!users ? (
            <p className="muted">Loading…</p>
          ) : users.length === 0 ? (
            <p className="muted">No users yet. Add the first one above.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>User</th><th>Status</th><th>Last sign-in</th><th>Added</th><th aria-label="Actions" /></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="u-email">{u.email}</div>
                        {u.name && <div className="muted small">{u.name}</div>}
                      </td>
                      <td><span className={`badge ${u.active ? 'on' : 'off'}`}>{u.active ? 'Active' : 'Disabled'}</span></td>
                      <td>{fmt(u.lastLoginAt)}</td>
                      <td>{fmt(u.createdAt)}</td>
                      <td className="actions">
                        <button className="btn small ghost" onClick={() => newCode(u)}>New code</button>
                        <button className="btn small ghost" onClick={() => toggle(u)}>{u.active ? 'Disable' : 'Enable'}</button>
                        <button className="btn small danger" onClick={() => remove(u)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
