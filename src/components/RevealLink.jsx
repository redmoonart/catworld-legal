import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

export default function RevealLink({ children, delay = 0, y = 24, ...rest }) {
  return (
    <MotionLink
      initial={{ opacity: 0, y, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay }}
      {...rest}
    >
      {children}
    </MotionLink>
  );
}
