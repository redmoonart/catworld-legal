import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import RevealLink from "../components/RevealLink";
import Hero3D from "../components/Hero3D";

const FEATURES = [
  ["🚚", "feat.delivery_t", "feat.delivery_d"],
  ["💵", "feat.cod_t", "feat.cod_d"],
  ["🔄", "feat.exchange_t", "feat.exchange_d"],
  ["📞", "feat.support_t", "feat.support_d"],
];

export default function Home() {
  const { t } = useI18n();
  const picks = PRODUCTS.filter((p) => p.badge || p.oldPrice).slice(0, 8);
  const list = picks.length ? picks : PRODUCTS.slice(0, 8);

  return (
    <>
      <Hero3D />

      <section className="section-sm">
        <div className="wrap">
          <div className="features">
            {FEATURES.map(([ic, tt, dd], i) => (
              <Reveal key={tt} className="feature" delay={i * 0.06}>
                <div className="ic">{ic}</div>
                <h3>{t(tt)}</h3>
                <p>{t(dd)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">{t("cats.kicker")}</span>
            <h2>{t("cats.title")}</h2>
            <p>{t("cats.sub")}</p>
          </Reveal>
          <div className="cats">
            <RevealLink to="/shop?cat=toys" className="cat-card toys">
              <span className="em">🧸</span>
              <h3>{t("cats.toys_t")}</h3>
              <p>{t("cats.toys_d")}</p>
              <span className="go">{t("cats.toys_go")}</span>
            </RevealLink>
            <RevealLink to="/shop?cat=school" className="cat-card school" delay={0.08}>
              <span className="em">🎒</span>
              <h3>{t("cats.school_t")}</h3>
              <p>{t("cats.school_d")}</p>
              <span className="go">{t("cats.school_go")}</span>
            </RevealLink>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker">{t("picks.kicker")}</span>
            <h2>{t("picks.title")}</h2>
            <p>{t("picks.sub")}</p>
          </Reveal>
          <Reveal className="products-grid" delay={0.1}>
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Reveal>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Link to="/shop" className="btn btn-primary btn-lg">{t("picks.viewall")}</Link>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap">
          <Reveal className="cod-banner">
            <span className="em">💵</span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3>{t("cod.title")}</h3>
              <p>{t("cod.text")}</p>
            </div>
            <Link to="/shop" className="btn" style={{ background: "#fff", color: "var(--teal)" }}>
              {t("cod.btn")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
