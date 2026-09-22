import { motion } from "framer-motion";

export default function Reveal({ children, delay = 0, className = "", as = "div", y = 24, ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 0.84, 0.44, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
