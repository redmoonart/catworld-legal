import { useRef, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, useScroll, useReducedMotion } from "framer-motion";
import { useI18n, Trans } from "../i18n/I18nContext";
import { getHeroSceneTier, hasFinePointer, isNarrowViewport } from "../lib/deviceCapability";
import WebGLErrorBoundary from "./WebGLErrorBoundary";
import FloatIcon from "./FloatIcon";
import heroImg from "../assets/hero.webp";

const HeroToys3D = lazy(() => import("./HeroToys3D"));

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 },
};
const springSettle = { type: "spring", stiffness: 260, damping: 24 };

export default function Hero3D() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const [sceneTier] = useState(getHeroSceneTier);
  const [canParallax] = useState(hasFinePointer);
  const [narrow] = useState(isNarrowViewport);
  const reduceMotion = useReducedMotion();

  // -- تفاعل الماوس: الصورة كلها تتحرك حركة بسيطة (X/Y/Scale)، بلا rotate --
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const active = useMotionValue(0);
  const stx = useSpring(tx, { stiffness: 120, damping: 20 });
  const sty = useSpring(ty, { stiffness: 120, damping: 20 });
  const sActive = useSpring(active, { stiffness: 120, damping: 20 });

  const parX = useTransform(stx, [-0.5, 0.5], reduceMotion ? [0, 0] : [-8, 8]);
  const parY = useTransform(sty, [-0.5, 0.5], reduceMotion ? [0, 0] : [-5, 5]);
  const parScale = useTransform(sActive, [0, 1], reduceMotion ? [1, 1] : [1, 1.03]);
  const fxX = useTransform(stx, (v) => v * 20);
  const fxY = useTransform(sty, (v) => v * 14);
  const glowX = useTransform(stx, (v) => v * -16);
  const glowY = useTransform(sty, (v) => v * -9);

  function handleMove(e) {
    if (!canParallax) return;
    const r = visualRef.current.getBoundingClientRect();
    tx.set((e.clientX - r.left) / r.width - 0.5);
    ty.set((e.clientY - r.top) / r.height - 0.5);
    active.set(1);
  }
  function handleLeave() {
    tx.set(0);
    ty.set(0);
    active.set(0);
  }

  // -- الهيرو أثناء الـscroll: الكاميرا "تدخل" إلى العالم --
  const { scrollYProgress: heroScroll } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const exitAmp = reduceMotion ? 0.3 : narrow ? 0.5 : 1;
  const exitScale = useTransform(heroScroll, [0, 1], [1, 1 + 0.06 * exitAmp]);
  const exitOpacity = useTransform(heroScroll, [0, 1], [1, 1 - 0.1 * exitAmp]);
  const exitY = useTransform(heroScroll, [0, 1], [0, -40 * exitAmp]);

  return (
    <section className="hero-cine" ref={sectionRef}>
      <div className="hero-ribbon">{t("ribbon")}</div>
      <div className="wrap">
        <div className="hero-split">
          <div className="hero-copy">
            <motion.h1
              variants={fadeUp} initial="hidden" animate="show"
              transition={{ ...springSettle, delay: reduceMotion ? 0.1 : 0.42 }}
            >
              <Trans k="hero.title" />
            </motion.h1>
            <motion.p
              className="lead" variants={fadeUp} initial="hidden" animate="show"
              transition={{ ...springSettle, delay: reduceMotion ? 0.15 : 0.56 }}
            >
              {t("hero.lead")}
            </motion.p>
            <motion.div
              className="hero-cta" variants={fadeUp} initial="hidden" animate="show"
              transition={{ ...springSettle, delay: reduceMotion ? 0.2 : 0.7 }}
            >
              <Link to="/shop" className="btn btn-primary btn-lg glow">{t("hero.cta_shop")}</Link>
              <Link to="/shop?cat=school" className="btn btn-ghost btn-lg">{t("hero.cta_school")}</Link>
            </motion.div>
            <motion.div
              className="hero-trust" variants={fadeUp} initial="hidden" animate="show"
              transition={{ ...springSettle, delay: reduceMotion ? 0.25 : 0.82 }}
            >
              <span>🚚 <span>{t("hero.badge_delivery")}</span></span>
              <span>💵 <span>{t("hero.badge_cod")}</span></span>
              <span>✅ <span>{t("hero.badge_guarantee")}</span></span>
            </motion.div>
          </div>

          <motion.div
            className="hero-visual hero3d"
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ ...springSettle, delay: reduceMotion ? 0.05 : 0.08 }}
            ref={visualRef}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
          >
            <motion.div className="hero-scroll-exit" style={{ scale: exitScale, opacity: exitOpacity, y: exitY }}>
              <motion.div
                className="hero-float"
                animate={reduceMotion ? {} : { y: [0, -14, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="hero-stage">
                  <motion.div className="hero-scene" style={{ x: parX, y: parY, scale: parScale, transformPerspective: 1200 }}>
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
                    </motion.div>
                  </motion.div>
                  {sceneTier !== "off" && (
                    <div className="hero-toys-layer" aria-hidden="true">
                      <WebGLErrorBoundary>
                        <Suspense fallback={null}>
                          <HeroToys3D tx={stx} ty={sty} quality={sceneTier} />
                        </Suspense>
                      </WebGLErrorBoundary>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* أيقونات ثلاثية الأبعاد قليلة حول الهيرو فقط — عمق متفاوت */}
              <FloatIcon emoji="⭐" scrollYProgress={heroScroll} range={[0, -50]} depth="fg"
                top="6%" left="-4%" size="2.3rem" delay={0.95} />
              <FloatIcon emoji="🚀" scrollYProgress={heroScroll} range={[0, -100]} depth="fg"
                bottom="10%" right="-6%" size="2.6rem" delay={1.05} className="decor-icon-extra" />
              <FloatIcon emoji="🧩" scrollYProgress={heroScroll} range={[0, 70]} axis="x" depth="bg"
                top="46%" left="-8%" size="1.8rem" delay={1.15} className="decor-icon-extra" />
            </motion.div>

            <motion.div
              className="hero-chip"
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: reduceMotion ? 0.3 : 1.15 }}
            >
              <span className="hero-chip-ic">✅</span>
              <span>{t("hero.badge_guarantee")}</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
