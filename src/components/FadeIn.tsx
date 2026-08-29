import { motion, useReducedMotion } from 'framer-motion';
import { CSSProperties, ElementType, ReactNode, useMemo } from 'react';

interface FadeInProps {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  once?: boolean;
}

/** The portfolio's original viewport reveal, shared by the storefront. */
export default function FadeIn({
  children,
  as = 'div',
  className,
  style,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  once = true,
}: FadeInProps) {
  const MotionTag = useMemo(() => motion.create(as), [as]);
  const reducedMotion = useReducedMotion();

  return (
    <MotionTag
      className={className}
      style={style}
      initial={reducedMotion ? false : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '70px', amount: 0.08 }}
      transition={{ delay: reducedMotion ? 0 : delay, duration: reducedMotion ? 0.01 : duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionTag>
  );
}
