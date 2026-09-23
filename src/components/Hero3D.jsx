import { useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useI18n, Trans } from "../i18n/I18nContext";
import heroImg from "../assets/hero.png";

const HeroToys3D = lazy(() => import("./HeroToys3D"));

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

export default function Hero3D() {
  const { t } = useI18n();
  const ref = useRef(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const stx = useSpring(tx, { stiffness: 120, damping: 20 });
  const sty = useSpring(ty, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(sty, (v) => -v * 6);
  const rotateY = useTransform(stx, (v) => v * 9);
  const fxX = useTransform(stx, (v) => v * 20);
  const fxY = useTransform(sty, (v) => v * 14);
  const glowX = useTransform(stx, (v) => v * -16);
  const glowY = useTransform(sty, (v) => v * -9);

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
      <div className="wrap">
        <motion.div className="hero-split" variants={container} initial="hidden" animate="show">
          <div className="hero-copy">
            <motion.h1 variants={item}>
              <Trans k="hero.title" />
            </motion.h1>
            <motion.p className="lead" variants={item}>{t("hero.lead")}</motion.p>
            <motion.div className="hero-cta" variants={item}>
              <Link to="/shop" className="btn btn-accent btn-lg glow">{t("hero.cta_shop")}</Link>
              <Link to="/shop?cat=school" className="btn btn-ghost btn-lg">{t("hero.cta_school")}</Link>
            </motion.div>
            <motion.div className="hero-trust" variants={item}>
              <span>🚚 <span>{t("hero.badge_delivery")}</span></span>
              <span>💵 <span>{t("hero.badge_cod")}</span></span>
              <span>✅ <span>{t("hero.badge_guarantee")}</span></span>
            </motion.div>
          </div>

          <motion.div
            className="hero-visual hero3d"
            variants={item}
            ref={ref}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
          >
            <motion.div
              className="hero-float"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
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
                <div className="hero-toys-layer" aria-hidden="true">
                  <Suspense fallback={null}>
                    <HeroToys3D tx={stx} ty={sty} />
                  </Suspense>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="hero-chip"
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.9 }}
            >
              <span className="hero-chip-ic">✅</span>
              <span>{t("hero.badge_guarantee")}</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
