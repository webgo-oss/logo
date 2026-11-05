const FORMATS = [
  { key: 'png', label: 'PNG', title: 'PNG – transparent background' },
  { key: 'jpg', label: 'JPG', title: 'JPG – white background' },
  { key: 'tiff', label: 'TIFF', title: 'TIFF – transparent background, print quality' },
];

// One separate download button per file format
export default function DownloadButtons({ logo }) {
  const urls = logo.downloadUrls || { png: logo.downloadUrl };
  return (
    <div className="dl-group">
      {FORMATS.filter((f) => urls[f.key]).map((f) => (
        <a key={f.key} className={`dl dl-${f.key}`} href={urls[f.key]} download title={f.title}>
          {f.label}
        </a>
      ))}
    </div>
  );
}
