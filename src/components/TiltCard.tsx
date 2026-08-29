import { CSSProperties, MouseEvent, ReactNode, useRef, useState } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Maximum tilt in degrees. */
  max?: number;
}

const RESTING = 'perspective(900px) rotateX(0deg) rotateY(0deg)';

/**
 * 3D tilt-on-hover wrapper. The card rotates toward the cursor while hovered
 * and eases back to rest when the pointer leaves.
 */
export default function TiltCard({ children, className, style, max = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(RESTING);
  const [active, setActive] = useState(false);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    setActive(true);
    setTransform(
      `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`,
    );
  };

  const reset = () => {
    setActive(false);
    setTransform(RESTING);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={className}
      style={{
        ...style,
        transform,
        transition: active ? 'transform 0.1s ease-out' : 'transform 0.5s ease',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
