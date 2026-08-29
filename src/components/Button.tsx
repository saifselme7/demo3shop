import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'dark' | 'light' | 'outline';
  arrow?: boolean;
  children?: ReactNode;
}

export default function Button({ children, variant = 'dark', arrow = false, className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      className={`button-${variant} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {arrow ? <span aria-hidden="true" className="button-arrow">←</span> : null}
    </motion.button>
  );
}
