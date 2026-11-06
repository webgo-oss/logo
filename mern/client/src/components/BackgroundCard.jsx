import { useState } from 'react';
import DownloadButtons from './DownloadButtons.jsx';

// Shows a solid-background image as a full-bleed thumbnail. `orientation` is "landscape" or "portrait".
export default function BackgroundCard({ item, orientation }) {
  const [failed, setFailed] = useState(false);

  return (
    <article className="card">
      <div className={`bg-stage ${orientation}`}>
        {failed ? (
          <p className="img-error">Image failed to load<br /><code>{item.previewUrl}</code></p>
        ) : (
          <img src={item.previewUrl} alt={item.name} loading="lazy" onError={() => setFailed(true)} />
        )}
      </div>
      <div className="meta">
        <div>
          <h4>{item.name}</h4>
          <p>
            JPG · {item.width} × {item.height}
            {item.downloads > 0 && ` · ${item.downloads} download${item.downloads === 1 ? '' : 's'}`}
          </p>
        </div>
        <DownloadButtons logo={item} />
      </div>
    </article>
  );
}
