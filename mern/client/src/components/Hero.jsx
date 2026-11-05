export default function Hero({ navLogo }) {
  return (
    <header className="hero">
      <div className="wrap">
        <nav>
          {navLogo && <img src={navLogo.previewUrl} alt="Unstoppable" />}
          <div className="links">
            <a href="#primary">Primary</a>
            <a href="#secondary">Secondary</a>
            <a href="#complementary">Complementary</a>
          </div>
        </nav>
        <div className="eyebrow">Brand Assets</div>
        <h1>Unstoppable Logo Showcase</h1>
        <p>
          Every logo variation in one place. Preview each one on its intended background and
          download the full-resolution transparent PNG.
        </p>
      </div>
    </header>
  );
}
