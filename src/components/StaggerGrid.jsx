import { motion, useReducedMotion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function StaggerGrid({ children, className = "" }) {
  const reduceMotion = useReducedMotion();
  const item = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.95 },
    show: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: reduceMotion ? 0.3 : 0.6, ease: [0.16, 0.84, 0.44, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children.map((child) => (
        <motion.div key={child.key} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
