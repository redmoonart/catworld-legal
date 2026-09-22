import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

export default function RevealLink({ children, delay = 0, y = 24, ...rest }) {
  return (
    <MotionLink
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 0.84, 0.44, 1] }}
      {...rest}
    >
      {children}
    </MotionLink>
  );
}
