import LogoCard from './LogoCard.jsx';

export default function Section({ id, number, title, subtitle, logos, stage }) {
  return (
    <section id={id}>
      <div className="sec-head">
        <span className="num">{number}</span>
        <h2>{title}</h2>
      </div>
      <p className="sec-sub">{subtitle}</p>
      <div className="grid">
        {logos.map((logo) => (
          <LogoCard key={logo.code} logo={logo} stage={stage} />
        ))}
      </div>
    </section>
  );
}
