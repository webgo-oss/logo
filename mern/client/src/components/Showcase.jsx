import { useEffect, useState } from 'react';
import { fetchSections } from '../api.js';
import Hero from './Hero.jsx';
import Section from './Section.jsx';
import LogoCard from './LogoCard.jsx';
import DownloadButtons from './DownloadButtons.jsx';

export default function Showcase({ session, navigate, onLogout, onExpired }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSections()
      .then(setData)
      .catch((e) => (e.status === 401 ? onExpired() : setError(e.message)));
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

  return (
    <>
      <Hero navLogo={navLogo} session={session} navigate={navigate} onLogout={onLogout} />

      <main className="wrap">
        <Section
          id="primary"
          number="01"
          title="Primary Logos"
          subtitle="The core identity in brand green, paired with the “Beyond the Blueprint” tagline."
          logos={data.primary}
          stage="light"
        />
        <Section
          id="secondary"
          number="02"
          title="Secondary Logos"
          subtitle="White versions for dark green or photographic backgrounds, with the “Beyond the Blueprint” tagline."
          logos={data.secondary}
          stage="dark"
        />
      </main>

      <div className="comp" id="complementary">
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

            <div className="sub-label"><i className="g" />Primary · Green</div>
            <div className="grid">
              {data.complementary.primary.map((l) => <LogoCard key={l.code} logo={l} stage="light" />)}
            </div>

            <div className="sub-label"><i className="w" />Secondary · White</div>
            <div className="grid">
              {data.complementary.secondary.map((l) => <LogoCard key={l.code} logo={l} stage="dark" />)}
            </div>

            <div className="sub-label"><i className="gold" />Brand Logo</div>
            {data.brand.map((l) => (
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
      </div>

      <footer>© Unstoppable — Real Estate Growth Partner</footer>
    </>
  );
}
