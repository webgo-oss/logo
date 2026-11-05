import { useState } from 'react';
import DownloadButtons from './DownloadButtons.jsx';

// "light" = beige stage (for green logos), "dark" = green stage (for white logos)
export default function LogoCard({ logo, stage }) {
  const [failed, setFailed] = useState(false);

  return (
    <article className="card">
      <div className={`stage ${stage}`}>
        {failed ? (
          <p className="img-error">Image failed to load<br /><code>{logo.previewUrl}</code></p>
        ) : (
          <img
            src={logo.previewUrl}
            alt={`Unstoppable ${logo.name}`}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="meta">
        <div>
          <h4>{logo.name}</h4>
          <p>
            PNG · JPG · TIFF · {logo.width} × {logo.height}
            {logo.downloads > 0 && ` · ${logo.downloads} download${logo.downloads === 1 ? '' : 's'}`}
          </p>
        </div>
        <DownloadButtons logo={logo} />
      </div>
    </article>
  );
}
