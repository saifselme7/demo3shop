import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';

interface MagnetProps {
  children: ReactNode;
  /** Distance in px around the element edge that activates the effect. */
  padding?: number;
  /** Higher values dampen the movement. */
  strength?: number;
  disabled?: boolean;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

/**
 * Magnetic hover effect: while the cursor is within `padding` of the element,
 * the content follows it, damped by `strength`.
 */
export default function Magnet({
  children,
  padding = 100,
  strength = 2,
  disabled = false,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  className,
  innerClassName,
  style,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) {
      setIsActive(false);
      setOffset({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const node = ref.current;
      if (!node) return;

      const { left, top, width, height } = node.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distanceX = Math.abs(centerX - event.clientX);
      const distanceY = Math.abs(centerY - event.clientY);

      const inRange =
        distanceX < width / 2 + padding && distanceY < height / 2 + padding;

      if (inRange) {
        setIsActive(true);
        setOffset({
          x: (event.clientX - centerX) / strength,
          y: (event.clientY - centerY) / strength,
        });
      } else {
        setIsActive(false);
        setOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [disabled, padding, strength]);

  return (
    <div ref={ref} className={className} style={style}>
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: isActive ? activeTransition : inactiveTransition,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}
