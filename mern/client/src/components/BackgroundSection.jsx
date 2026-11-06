import BackgroundCard from './BackgroundCard.jsx';

// One section per set: a Primary (green) grid followed by a Secondary (red) grid.
export default function BackgroundSection({ id, number, title, subtitle, data, orientation }) {
  return (
    <section id={id}>
      <div className="sec-head">
        <span className="num">{number}</span>
        <h2>{title}</h2>
      </div>
      <p className="sec-sub">{subtitle}</p>

      {data.primary.length > 0 && <>
        <div className="sub-label"><i className="g" />Primary · Green</div>
        <div className={`grid grid-${orientation}`}>
          {data.primary.map((b) => <BackgroundCard key={b.code} item={b} orientation={orientation} />)}
        </div>
      </>}

      {data.secondary.length > 0 && <>
        <div className="sub-label"><i className="r" />Secondary · Red</div>
        <div className={`grid grid-${orientation}`}>
          {data.secondary.map((b) => <BackgroundCard key={b.code} item={b} orientation={orientation} />)}
        </div>
      </>}
    </section>
  );
}
