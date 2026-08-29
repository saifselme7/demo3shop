import { useEffect, useRef, useState } from 'react';
import { MARQUEE_ROW_ONE, MARQUEE_ROW_TWO } from '../data/marqueeImages';

interface RowProps {
  images: string[];
  offset: number;
  /** 1 moves the row right on scroll, -1 moves it left. */
  direction: 1 | -1;
}

function Row({ images, offset, direction }: RowProps) {
  // Tripled so the row never runs out of tiles while translating.
  const tiles = [...images, ...images, ...images];

  return (
    <div
      className="flex gap-3"
      style={{
        transform: `translateX(${direction * (offset - 200)}px)`,
        willChange: 'transform',
      }}
    >
      {tiles.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt=""
          loading="lazy"
          className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
        />
      ))}
    </div>
  );
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const update = () => {
      const node = sectionRef.current;
      if (!node) return;

      const sectionTop = node.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40"
      style={{ overflowX: 'clip' }}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-3">
        <Row images={MARQUEE_ROW_ONE} offset={offset} direction={1} />
        <Row images={MARQUEE_ROW_TWO} offset={offset} direction={-1} />
      </div>
    </section>
  );
}
