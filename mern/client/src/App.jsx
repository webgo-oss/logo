import { useEffect, useState } from 'react';
import { fetchMe, logout } from './api.js';
import Login from './components/Login.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import Showcase from './components/Showcase.jsx';

// Minimal path-based routing (no extra dependency): /, /login, /admin/login, /admin
function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = (to, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState'](null, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };
  return [path.replace(/\/+$/, '') || '/', navigate];
}

function Redirect({ to, navigate }) {
  useEffect(() => navigate(to, true), [to]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function App() {
  const [path, navigate] = usePath();
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchMe().then(setSession).catch((e) => setLoadError(e.message));
  }, []);

  const signOut = async (to) => {
    try {
      await logout();
    } catch {
      /* cookie may already be gone */
    }
    setSession(null);
    navigate(to || '/login', true);
  };
  const onExpired = () => {
    setSession(null);
    navigate(path.startsWith('/admin') ? '/admin/login' : '/login', true);
  };

  if (loadError) {
    return (
      <div className="status">
        <h2>Couldn’t reach the server</h2>
        <p>{loadError}. Make sure the API is running.</p>
      </div>
    );
  }
  if (session === undefined) return <div className="status">Loading…</div>;

  // --- sign-in pages ---
  if (path === '/admin/login') {
    if (session?.role === 'admin') return <Redirect to="/admin" navigate={navigate} />;
    return (
      <Login
        mode="admin"
        navigate={navigate}
        onSuccess={(u) => {
          setSession(u);
          navigate('/admin', true);
        }}
      />
    );
  }
  if (path === '/login') {
    if (session) return <Redirect to="/" navigate={navigate} />;
    return (
      <Login
        mode="user"
        navigate={navigate}
        onSuccess={(u) => {
          setSession(u);
          navigate('/', true);
        }}
      />
    );
  }

  // --- admin panel (admins only) ---
  if (path === '/admin') {
    if (!session) return <Redirect to="/admin/login" navigate={navigate} />;
    if (session.role !== 'admin') return <Redirect to="/" navigate={navigate} />;
    return (
      <AdminPanel
        session={session}
        navigate={navigate}
        onLogout={() => signOut('/admin/login')}
        onExpired={onExpired}
      />
    );
  }

  // --- the logo page (any signed-in person) ---
  if (!session) return <Redirect to="/login" navigate={navigate} />;
  return (
    <Showcase
      session={session}
      navigate={navigate}
      onLogout={() => signOut(session.role === 'admin' ? '/admin/login' : '/login')}
      onExpired={onExpired}
    />
  );
}
