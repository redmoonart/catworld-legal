import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useCart } from "../cart/CartContext";
import { STORE_CONFIG } from "../data/config";

const LANGS = [
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export default function Header() {
  const { t, setLang, meta } = useI18n();
  const { count } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 760) setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setLangOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const current = location.pathname + location.search;

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/shop", label: t("nav.shop") },
    { to: "/shop?cat=toys", label: t("nav.toys") },
    { to: "/shop?cat=school", label: t("nav.school") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
      <div className="wrap header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="logo logo-img">🧸</span>
          <span>
            {STORE_CONFIG.name}
            <small data-tagline>{t("tagline")}</small>
          </span>
        </Link>
        <nav className={`nav${menuOpen ? " open" : ""}`}>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className={current === l.to ? "active" : undefined} onClick={closeMenu}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={`nav-scrim${menuOpen ? " open" : ""}`} onClick={closeMenu} />
        <div className="header-actions">
          <div className={`lang-switch${langOpen ? " open" : ""}`}>
            <button
              className="lang-btn"
              aria-label={t("aria.lang")}
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen((o) => !o);
              }}
            >
              🌐 <span>{meta.short}</span>
            </button>
            <div className="lang-menu">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setLangOpen(false);
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <Link to="/cart" className="cart-btn" aria-label={t("aria.cart")} onClick={closeMenu}>
            🛒<span className="count cart-count" style={{ display: count > 0 ? "grid" : "none" }}>{count}</span>
          </Link>
          <button className="menu-toggle" aria-label={t("aria.menu")} onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
