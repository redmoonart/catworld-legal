import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { STORE_CONFIG } from "../data/config";
import { waLink } from "../lib/whatsapp";

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const waHref = waLink(STORE_CONFIG.whatsapp, t("wa.generic", { store: STORE_CONFIG.name }));

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="logo logo-img">🧸</span>
              <span>{STORE_CONFIG.name}</span>
            </div>
            <p style={{ marginTop: 12, fontSize: ".9rem" }}>{t("footer.about")}</p>
            <div className="socials">
              {STORE_CONFIG.facebook && <a href={STORE_CONFIG.facebook} aria-label="facebook">f</a>}
              {STORE_CONFIG.instagram && <a href={STORE_CONFIG.instagram} aria-label="instagram">📷</a>}
              {STORE_CONFIG.tiktok && <a href={STORE_CONFIG.tiktok} aria-label="tiktok">♪</a>}
            </div>
          </div>
          <div>
            <h4>{t("footer.quicklinks")}</h4>
            <Link to="/shop">{t("nav.shop")}</Link>
            <Link to="/shop?cat=toys">{t("nav.toys")}</Link>
            <Link to="/shop?cat=school">{t("nav.school")}</Link>
            <Link to="/cart">{t("footer.cart")}</Link>
          </div>
          <div>
            <h4>{t("footer.store")}</h4>
            <Link to="/about">{t("nav.about")}</Link>
            <Link to="/contact">{t("nav.contact")}</Link>
            <Link to="/contact#faq">{t("footer.faq")}</Link>
            <a href={`${import.meta.env.BASE_URL}privacy-policy.html`}>{t("footer.privacy")}</a>
          </div>
          <div>
            <h4>{t("footer.contact_us")}</h4>
            <a href={waHref} target="_blank" rel="noreferrer">{t("footer.wa")}</a>
            <a href={`mailto:${STORE_CONFIG.email}`}>{t("footer.email")}</a>
            <p style={{ fontSize: ".85rem", marginTop: 8 }}>{t("footer.hours")}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© <span>{year}</span> {STORE_CONFIG.name} — {t("footer.rights")}</span>
          <span>{t("footer.madewith")}</span>
        </div>
      </div>
    </footer>
  );
}
