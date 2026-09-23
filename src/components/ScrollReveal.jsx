import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollReveal({ children, className = "", y = 40, scale }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "start 45%"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [y, 0]);
  const scaleVal = useTransform(scrollYProgress, [0, 1], [scale ?? 1, 1]);

  return (
    <motion.div ref={ref} className={className} style={{ opacity, y: translateY, scale: scaleVal }}>
      {children}
    </motion.div>
  );
}
