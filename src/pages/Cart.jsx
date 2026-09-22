import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useCart } from "../cart/CartContext";
import { WILAYAS } from "../data/wilayas";
import { STORE_CONFIG } from "../data/config";
import PageHead from "../components/PageHead";
import { pName, wName } from "../lib/product";
import { money } from "../lib/format";
import { waLink } from "../lib/whatsapp";

export default function Cart() {
  const { t, lang } = useI18n();
  const { cart, byId, setQty, removeFromCart, subtotal } = useCart();

  const [deliveryType, setDeliveryType] = useState("home");
  const [wilayaCode, setWilayaCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const wilaya = WILAYAS.find((w) => w.code === Number(wilayaCode));
  const isFree = STORE_CONFIG.freeShippingThreshold && subtotal >= STORE_CONFIG.freeShippingThreshold;
  const deliveryPrice = wilaya ? (deliveryType === "office" ? wilaya.office : wilaya.home) : 0;
  const finalDelivery = isFree ? 0 : deliveryPrice;
  const total = subtotal + (wilaya ? finalDelivery : 0);
  const remain = STORE_CONFIG.freeShippingThreshold ? STORE_CONFIG.freeShippingThreshold - subtotal : 0;

  function handleSubmit(e) {
    e.preventDefault();
    const phoneOk = /^0[5-7]\d{8}$/.test(phone.replace(/\s/g, ""));
    const nameOk = name.trim().length > 0;
    const wilayaOk = !!wilaya;
    setErrors({ name: !nameOk, phone: !phoneOk, wilaya: !wilayaOk });
    if (!nameOk || !phoneOk || !wilayaOk) return;

    const price = deliveryType === "office" ? wilaya.office : wilaya.home;
    const delFinal = isFree ? 0 : price;
    const grandTotal = subtotal + delFinal;

    let msg = t("wa.new_order", { store: STORE_CONFIG.name }) + "\n";
    msg += "━━━━━━━━━━━━━━━\n";
    cart.forEach((i) => {
      const p = byId(i.id);
      if (p) msg += `• ${pName(p, lang)}  ×${i.qty} = ${money(p.price * i.qty, STORE_CONFIG.currency)}\n`;
    });
    msg += "━━━━━━━━━━━━━━━\n";
    msg += `${t("wa.subtotal")}: ${money(subtotal, STORE_CONFIG.currency)}\n`;
    const dtLabel = deliveryType === "office" ? t("wa.office") : t("wa.home");
    msg += `${t("wa.delivery")} (${dtLabel}): ${isFree ? t("cart.free") : money(delFinal, STORE_CONFIG.currency)}\n`;
    msg += `*${t("wa.total")}: ${money(grandTotal, STORE_CONFIG.currency)}*\n`;
    msg += "━━━━━━━━━━━━━━━\n";
    msg += `👤 ${t("wa.name")}: ${name.trim()}\n`;
    msg += `📞 ${t("wa.phone")}: ${phone.trim()}\n`;
    msg += `🏙️ ${t("wa.wilaya")}: ${wilaya.code} - ${wName(wilaya, lang)}\n`;
    if (city.trim()) msg += `📍 ${t("wa.address")}: ${city.trim()}\n`;
    msg += `🚚 ${t("wa.dtype")}: ${deliveryType === "office" ? t("wa.dtype_office") : t("wa.dtype_home")}\n`;
    if (notes.trim()) msg += `📝 ${t("wa.notes")}: ${notes.trim()}\n`;
    msg += `💵 ${t("wa.payment")}: ${t("wa.cod")}\n`;
    window.open(waLink(STORE_CONFIG.whatsapp, msg), "_blank");
  }

  if (!cart.length) {
    return (
      <>
        <PageHead title={t("cart.head_title")} subtitle={t("cart.head_sub")} chips={["💵", "🚚", "✅", "📦"]} />
        <section className="section">
          <div className="wrap">
            <div className="empty-state">
              <div className="em">🛒</div>
              <h3>{t("cart.empty_t")}</h3>
              <p>{t("cart.empty_p")}</p>
              <Link className="btn btn-primary btn-lg" to="/shop">{t("cart.empty_btn")}</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHead title={t("cart.head_title")} subtitle={t("cart.head_sub")} chips={["💵", "🚚", "✅", "📦"]} />
      <section className="section">
        <div className="wrap">
          <div className="cart-layout">
            <div>
              <div className="cart-list">
                {cart.map((i) => {
                  const p = byId(i.id);
                  if (!p) return null;
                  return (
                    <div className="cart-row" key={i.id}>
                      <Link to={`/product/${p.id}`} className="thumb">
                        {p.image ? <img src={p.image} alt={pName(p, lang)} /> : <span>{p.emoji || "🎁"}</span>}
                      </Link>
                      <div>
                        <h4>{pName(p, lang)}</h4>
                        <div className="unit">{money(p.price, STORE_CONFIG.currency)} {t("cart.per_piece")}</div>
                        <div className="qty" style={{ marginTop: 8 }}>
                          <button type="button" onClick={() => setQty(p.id, i.qty - 1)}>−</button>
                          <input type="text" value={i.qty} readOnly />
                          <button type="button" onClick={() => setQty(p.id, i.qty + 1)}>+</button>
                        </div>
                      </div>
                      <div className="right">
                        <span className="line-total">{money(p.price * i.qty, STORE_CONFIG.currency)}</span>
                        <button className="remove" onClick={() => removeFromCart(p.id)}>{t("cart.remove")}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="summary">
              <h3>{t("cart.summary")}</h3>
              <div className="line">
                <span>{t("cart.subtotal")}</span>
                <span>{money(subtotal, STORE_CONFIG.currency)}</span>
              </div>
              <div className="line">
                <span>{t("cart.delivery")} {wilaya ? `(${wName(wilaya, lang)})` : ""}</span>
                <span>{isFree ? t("cart.free") : wilaya ? money(finalDelivery, STORE_CONFIG.currency) : t("cart.by_wilaya")}</span>
              </div>
              <div className="line total">
                <span>{t("cart.total")}</span>
                <span className="amount-flash">{money(total, STORE_CONFIG.currency)}</span>
              </div>
              {STORE_CONFIG.freeShippingThreshold && !isFree && remain > 0 ? (
                <div className="free-note">
                  {t("cart.free_add_pre")}{money(remain, STORE_CONFIG.currency)}{t("cart.free_add_post")}
                </div>
              ) : null}
              {isFree ? <div className="free-note">{t("cart.free_congrats")}</div> : null}

              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: "1.1rem" }}>{t("cart.info_title")}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-row">
                    <label>{t("cart.f_name")} <span className="req">*</span></label>
                    <input type="text" placeholder={t("cart.ph_name")} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                    <div className={`field-error${errors.name ? " show" : ""}`}>{t("cart.err_name")}</div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_phone")} <span className="req">*</span></label>
                    <input type="tel" placeholder={t("cart.ph_phone")} inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <div className={`field-error${errors.phone ? " show" : ""}`}>{t("cart.err_phone")}</div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_wilaya")} <span className="req">*</span></label>
                    <select value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)}>
                      <option value="">{t("cart.choose_wilaya")}</option>
                      {WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>{w.code} - {wName(w, lang)}</option>
                      ))}
                    </select>
                    <div className={`field-error${errors.wilaya ? " show" : ""}`}>{t("cart.err_wilaya")}</div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_city")}</label>
                    <input type="text" placeholder={t("cart.ph_city")} value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label>{t("cart.dtype")}</label>
                    <div className="radio-cards">
                      <div className={`radio-card${deliveryType === "home" ? " active" : ""}`} onClick={() => setDeliveryType("home")}>
                        {t("cart.dtype_home")}
                      </div>
                      <div className={`radio-card${deliveryType === "office" ? " active" : ""}`} onClick={() => setDeliveryType("office")}>
                        {t("cart.dtype_office")}
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_notes")}</label>
                    <textarea rows={2} placeholder={t("cart.ph_notes")} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-wa btn-block btn-lg">{t("cart.submit")}</button>
                  <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".82rem", marginTop: 10 }}>{t("cart.cod_note")}</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
