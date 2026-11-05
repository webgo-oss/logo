export default function Hero({ navLogo, session, navigate, onLogout }) {
  const go = (to) => (e) => {
    e.preventDefault();
    navigate(to);
  };
  return (
    <header className="hero">
      <div className="wrap">
        <nav>
          {navLogo && <img src={navLogo.previewUrl} alt="Unstoppable" />}
          <div className="nav-right">
            <div className="links">
              <a href="#primary">Primary</a>
              <a href="#secondary">Secondary</a>
              <a href="#complementary">Complementary</a>
            </div>
            <div className="account">
              <span className="who">{session.email}</span>
              {session.role === 'admin' && <a href="/admin" onClick={go('/admin')}>Admin panel</a>}
              <button className="linkbtn" onClick={onLogout}>Sign out</button>
            </div>
          </div>
        </nav>
        <div className="eyebrow">Brand Assets</div>
        <h1>Unstoppable Logo Showcase</h1>
        <p>
          Every logo variation in one place. Preview each one on its intended background and
          download it as PNG, JPG or TIFF.
        </p>
      </div>
    </header>
  );
}
