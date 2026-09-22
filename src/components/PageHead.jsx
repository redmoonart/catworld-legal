export default function PageHead({ title, subtitle, chips }) {
  return (
    <section className="page-head">
      {chips && chips.length > 0 && (
        <div className="page-head-orbit" aria-hidden="true">
          {chips.map((c, i) => (
            <span key={i} className={`pchip p${i + 1}`}>{c}</span>
          ))}
        </div>
      )}
      <div className="wrap">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
