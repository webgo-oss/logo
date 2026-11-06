import { useEffect, useState } from 'react';
import { fetchSections, fetchBackgrounds } from '../api.js';
import Hero from './Hero.jsx';
import Section from './Section.jsx';
import LogoCard from './LogoCard.jsx';
import DownloadButtons from './DownloadButtons.jsx';
import BackgroundSection from './BackgroundSection.jsx';

// Every word typed must appear somewhere in the item's searchable text.
const matcher = (query) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return (text) => {
    const t = text.toLowerCase();
    return words.every((w) => t.includes(w));
  };
};
const logoText = (l) =>
  [l.code, l.name, l.variant, l.tone, l.tagline, l.group, l.subtype, 'logo'].filter(Boolean).join(' ');
const bgText = (b) =>
  [b.code, b.name, b.set, b.group, b.set === 'landscape' ? 'usp logo landscape' : 'vertical portrait',
    b.group === 'primary' ? 'green' : 'red', 'background solid jpg'].join(' ');

export default function Showcase({ session, navigate, onLogout, onExpired }) {
  const [data, setData] = useState(null);
  const [bgs, setBgs] = useState(null);
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSections()
      .then(setData)
      .catch((e) => (e.status === 401 ? onExpired() : setError(e.message)));
    // Backgrounds load separately so the logos still show if this request fails
    fetchBackgrounds().then(setBgs).catch(() => {});
  }, []);

  if (error) {
    return (
      <div className="status">
        <h2>Couldn’t load the logos</h2>
        <p>{error}. Make sure the API is running and the database has been seeded (<code>npm run seed</code>).</p>
      </div>
    );
  }
  if (!data) return <div className="status">Loading…</div>;

  const navLogo = data.secondary.find((l) => l.variant === 'horizontal');

  // ---- search filter (empty search = show everything)
  const match = matcher(query);
  const fl = (list) => list.filter((l) => match(logoText(l)));
  const fb = (list) => list.filter((b) => match(bgText(b)));
  const on = (k) => section === 'all' || section === k; // dropdown: which section(s) to show
  const primary = on('primary') ? fl(data.primary) : [];
  const secondary = on('secondary') ? fl(data.secondary) : [];
  const compP = on('complementary') ? fl(data.complementary.primary) : [];
  const compS = on('complementary') ? fl(data.complementary.secondary) : [];
  const brand = on('complementary') ? fl(data.brand) : [];
  const empty = { primary: [], secondary: [] };
  const land = bgs && (on('usp') ? { primary: fb(bgs.landscape.primary), secondary: fb(bgs.landscape.secondary) } : empty);
  const port = bgs && (on('vertical') ? { primary: fb(bgs.portrait.primary), secondary: fb(bgs.portrait.secondary) } : empty);
  const compCount = compP.length + compS.length + brand.length;
  const landCount = land ? land.primary.length + land.secondary.length : 0;
  const portCount = port ? port.primary.length + port.secondary.length : 0;
  const total = primary.length + secondary.length + compCount + landCount + portCount;

  return (
    <>
      <Hero navLogo={navLogo} session={session} navigate={navigate} onLogout={onLogout} />

      <div className="wrap toolbar-wrap">
        <div className="toolbar">
          <div className="search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search logos & backgrounds… (e.g. green, white, wordmark, red)"
              aria-label="Search logos and backgrounds"
            />
            {query && (
              <button type="button" className="clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>
            )}
          </div>
          <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Filter by name">
            <option value="all">All names</option>
            <option value="primary">Primary Logos</option>
            <option value="secondary">Secondary Logos</option>
            <option value="complementary">Complementary Logos</option>
            <option value="usp">Solid Backgrounds · USP Logo</option>
            <option value="vertical">Solid Backgrounds · Vertical</option>
          </select>
        </div>
        {(query.trim() || section !== 'all') && (
          <div className="result-bar">
            {total === 0
              ? <>No results{query.trim() && <> for “{query.trim()}”</>}. Try “green”, “white”, “red”, “stacked”, “horizontal” or “wordmark”, or choose “All names”.</>
              : <>{total} result{total === 1 ? '' : 's'}{query.trim() && <> for “{query.trim()}”</>}</>}
          </div>
        )}
      </div>

      <main className="wrap">
        {primary.length > 0 && <Section
          id="primary"
          number="01"
          title="Primary Logos"
          subtitle="The core identity in brand green, paired with the “Beyond the Blueprint” tagline."
          logos={primary}
          stage="light"
        />}
        {secondary.length > 0 && <Section
          id="secondary"
          number="02"
          title="Secondary Logos"
          subtitle="White versions for dark green or photographic backgrounds, with the “Beyond the Blueprint” tagline."
          logos={secondary}
          stage="dark"
        />}
      </main>

      {compCount > 0 && <div className="comp" id="complementary">
        <main className="wrap">
          <section style={{ paddingTop: 56 }}>
            <div className="sec-head">
              <span className="num">03</span>
              <h2>Complementary Logos</h2>
            </div>
            <p className="sec-sub">
              The real estate line, carrying the “Real Estate Growth Partner” descriptor, organised by
              the same primary and secondary logic.
            </p>

            {compP.length > 0 && <>
              <div className="sub-label"><i className="g" />Primary · Green</div>
              <div className="grid">
                {compP.map((l) => <LogoCard key={l.code} logo={l} stage="light" />)}
              </div>
            </>}

            {compS.length > 0 && <>
              <div className="sub-label"><i className="w" />Secondary · White</div>
              <div className="grid">
                {compS.map((l) => <LogoCard key={l.code} logo={l} stage="dark" />)}
              </div>
            </>}

            {brand.length > 0 && <div className="sub-label"><i className="gold" />Brand Logo</div>}
            {brand.map((l) => (
              <div className="brandmark" key={l.code}>
                <div className="stage mark">
                  <img src={l.previewUrl} alt="Unstoppable brand mark" />
                </div>
                <div className="info">
                  <h3>Brand Mark</h3>
                  <p>
                    The standalone gold “US” monogram with the house emblem, for icons, favicons and
                    social avatars.
                  </p>
                  <DownloadButtons logo={l} />
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>}

      {bgs && (landCount > 0 || portCount > 0) && (
        <main className="wrap">
          {landCount > 0 && <BackgroundSection
            id="usp-logo"
            number="04"
            title="Solid Backgrounds · USP Logo"
            subtitle="Landscape (16:9) solid-colour backgrounds with the USP monogram. Green is primary, red is secondary."
            data={land}
            orientation="landscape"
          />}
          {portCount > 0 && <BackgroundSection
            id="vertical"
            number="05"
            title="Solid Backgrounds · Vertical"
            subtitle="Portrait (A4) solid-colour backgrounds with the USP monogram. Green is primary, red is secondary."
            data={port}
            orientation="portrait"
          />}
        </main>
      )}

      <footer>© Unstoppable — Real Estate Growth Partner</footer>
    </>
  );
}
