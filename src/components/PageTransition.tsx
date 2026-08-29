import { motion, useReducedMotion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

export default function PageTransition({ children }: PropsWithChildren) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
