import { motion } from "framer-motion";

export default function Reveal({ children, delay = 0, className = "", as = "div", y = 24, ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
