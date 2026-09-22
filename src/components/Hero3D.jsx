import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import heroImg from "../assets/hero.png";

export default function Hero3D() {
  const { t } = useI18n();
  const ref = useRef(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const stx = useSpring(tx, { stiffness: 120, damping: 20 });
  const sty = useSpring(ty, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(sty, (v) => -v * 7);
  const rotateY = useTransform(stx, (v) => v * 10);
  const fxX = useTransform(stx, (v) => v * 22);
  const fxY = useTransform(sty, (v) => v * 16);
  const glowX = useTransform(stx, (v) => v * -18);
  const glowY = useTransform(sty, (v) => v * -10);
  const orbitX = useTransform(stx, (v) => v * 26);
  const orbitY = useTransform(sty, (v) => v * 18);

  function handleMove(e) {
    const r = ref.current.getBoundingClientRect();
    tx.set((e.clientX - r.left) / r.width - 0.5);
    ty.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() {
    tx.set(0);
    ty.set(0);
  }

  return (
    <section className="hero-cine">
      <div className="hero-ribbon">{t("ribbon")}</div>
      <div className="wrap" style={{ paddingTop: 18, paddingBottom: 28 }}>
        <div className="hero3d" ref={ref} onPointerMove={handleMove} onPointerLeave={handleLeave}>
          <div className="hero-stage">
            <motion.div className="hero-scene" style={{ rotateX, rotateY, transformPerspective: 1200 }}>
              <motion.div className="hero-glow" style={{ x: glowX, y: glowY, scale: 1.1 }} />
              <img
                className="hero-key-img"
                src={heroImg}
                alt="Kids of the Future"
                fetchPriority="high"
                width="1672"
                height="941"
              />
              <motion.div className="hero-fx" style={{ x: fxX, y: fxY }}>
                <span className="spark" />
                <span className="spark" />
                <span className="spark" />
                <span className="spark" />
                <span className="spark" />
                <span className="spark" />
                <span className="spark" />
                <span className="spark" />
                <span className="floaty-emoji e1">⭐</span>
                <span className="floaty-emoji e2">✨</span>
                <span className="floaty-emoji e3">🚀</span>
              </motion.div>
            </motion.div>
            <motion.div className="hero-orbit" style={{ x: orbitX, y: orbitY }} aria-hidden="true">
              <span className="orb o1">🚗</span>
              <span className="orb o2">🎨</span>
              <span className="orb o3">🧩</span>
              <span className="orb o4">🎒</span>
            </motion.div>
            <div className="hero-scrim">
              <p className="tagline-cine">{t("hero.lead")}</p>
              <div className="hero-cta">
                <Link to="/shop" className="btn btn-accent btn-lg glow">{t("hero.cta_shop")}</Link>
                <Link to="/shop?cat=school" className="btn btn-glass btn-lg">{t("hero.cta_school")}</Link>
              </div>
              <div className="hero-trust">
                <span>🚚 <span>{t("hero.badge_delivery")}</span></span>
                <span>💵 <span>{t("hero.badge_cod")}</span></span>
                <span>✅ <span>{t("hero.badge_guarantee")}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
