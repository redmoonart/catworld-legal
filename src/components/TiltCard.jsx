import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function TiltCard({ children, className = "", as = "div", ...rest }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);

  const rotateX = useTransform(py, [0, 1], [6, -6]);
  const rotateY = useTransform(px, [0, 1], [-8, 8]);
  const lift = useTransform(active, [0, 1], [0, -6]);
  const shineOpacity = active;
  const shineBg = useTransform([px, py], ([x, y]) =>
    `radial-gradient(320px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.35), transparent 45%)`
  );

  function handleMove(e) {
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function handleEnter() {
    active.set(1);
  }
  function handleLeave() {
    active.set(0);
    px.set(0.5);
    py.set(0.5);
  }

  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, y: lift, transformPerspective: 760 }}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      {...rest}
    >
      <motion.span className="tilt-shine" style={{ opacity: shineOpacity, background: shineBg }} />
      {children}
    </MotionTag>
  );
}
