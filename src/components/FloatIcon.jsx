import { useState } from "react";
import { motion, useTransform, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { isNarrowViewport } from "../lib/deviceCapability";

/**
 * Decorative floating icon tied to a section's scroll progress (0→1).
 * axis="y": range is [startPx, endPx] applied to translateY (depth/parallax feel).
 * axis="x": range is applied to translateX; flipped automatically in RTL so the
 * icon still travels the same visual direction regardless of language.
 */
export default function FloatIcon({
  emoji,
  scrollYProgress,
  range = [0, -60],
  axis = "y",
  top,
  left,
  right,
  bottom,
  size = "2.1rem",
  depth = "mid",
  delay = 0,
  className = "",
}) {
  const { meta } = useI18n();
  const reduceMotion = useReducedMotion();
  const [narrow] = useState(isNarrowViewport);
  const rtlFlip = axis === "x" && meta.dir === "rtl" ? -1 : 1;
  const amp = reduceMotion ? 0 : narrow ? 0.45 : 1;
  const effectiveRange = range.map((v) => v * rtlFlip * amp);
  const move = useTransform(scrollYProgress, [0, 1], effectiveRange);
  const depthZ = { fg: 50, mid: 0, bg: -50 }[depth] ?? 0;
  const style = {
    top, left, right, bottom, fontSize: size,
    translateZ: depthZ,
    ...(axis === "y" ? { y: move } : { x: move }),
  };

  return (
    <motion.span
      className={`float-ic depth-${depth} ${className}`}
      style={style}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 220, damping: 18, delay }}
      aria-hidden="true"
    >
      {emoji}
    </motion.span>
  );
}
