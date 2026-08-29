import { MotionValue, motion, useScroll, useTransform } from 'framer-motion';
import { CSSProperties, useRef } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Scroll driven, character by character reveal. Every character fades from 0.2
 * to full opacity as the paragraph travels through the viewport.
 */
export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const words = text.split(' ');
  const totalChars = text.length;
  let charIndex = 0;

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wordIdx) => {
        // Keep characters of a word together so wrapping stays natural.
        const chars = word.split('').map((char) => {
          const start = charIndex / totalChars;
          const end = (charIndex + 1) / totalChars;
          charIndex += 1;
          return { char, start, end };
        });

        // The space that follows the word also consumes one step.
        charIndex += 1;

        return (
          <span key={`${word}-${wordIdx}`} className="inline-block whitespace-nowrap">
            {chars.map((entry, idx) => (
              <Char
                key={`${entry.char}-${idx}`}
                char={entry.char}
                start={entry.start}
                end={entry.end}
                progress={scrollYProgress}
              />
            ))}
            {wordIdx < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
          </span>
        );
      })}
    </p>
  );
}

interface CharProps {
  char: string;
  start: number;
  end: number;
  progress: MotionValue<number>;
}

function Char({ char, start, end, progress }: CharProps) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  return (
    <span className="relative inline-block">
      {/* Invisible placeholder keeps layout and screen reader output intact. */}
      <span className="opacity-0">{char}</span>
      <motion.span aria-hidden="true" className="absolute left-0 top-0" style={{ opacity }}>
        {char}
      </motion.span>
    </span>
  );
}
