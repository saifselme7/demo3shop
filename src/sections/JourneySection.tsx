import FadeIn from '../components/FadeIn';
import { MILESTONES } from '../data/journey';

/**
 * Education presented as a story: a glowing timeline rail with milestone
 * badges instead of a dry academic resume.
 */
export default function JourneySection() {
  return (
    <section id="journey" className="relative px-5 py-20 sm:px-8 md:px-10 md:py-32" style={{ overflowX: 'clip' }}>
      <FadeIn
        as="h2"
        delay={0}
        y={40}
        className="hero-heading mb-6 text-center font-black uppercase leading-none tracking-tight"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        The Journey
      </FadeIn>

      <FadeIn
        as="p"
        delay={0.1}
        y={20}
        className="mx-auto mb-16 max-w-xl text-center font-light leading-relaxed text-[#D7E2EA]/60 sm:mb-20 md:mb-24"
        style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)' }}
      >
        Less of a resume, more of a story — three chapters in, many more to go.
      </FadeIn>

      <div className="relative mx-auto max-w-3xl">
        {/* Glowing rail that ties the milestones together. */}
        <div
          className="absolute bottom-6 left-7 top-6 w-px sm:left-8"
          style={{
            background:
              'linear-gradient(180deg, transparent, #B600A8 20%, #7621B0 60%, transparent)',
          }}
          aria-hidden="true"
        />

        {MILESTONES.map((milestone, index) => (
          <FadeIn
            key={milestone.title}
            delay={index * 0.12}
            x={40}
            y={0}
            className="relative mb-12 pl-24 last:mb-0 sm:pl-28"
          >
            <span className="glass absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full text-[0.6rem] font-bold uppercase tracking-widest sm:h-16 sm:w-16 sm:text-xs">
              <span className="accent-text">{milestone.badge}</span>
            </span>

            <p className="text-[0.65rem] font-light uppercase tracking-[0.25em] text-[#D7E2EA]/50 sm:text-xs">
              {milestone.subtitle}
            </p>
            <h3
              className="mt-1 font-semibold uppercase leading-tight text-[#D7E2EA]"
              style={{ fontSize: 'clamp(1.15rem, 2.4vw, 1.9rem)' }}
            >
              {milestone.title}
            </h3>
            <p
              className="mt-3 max-w-xl font-light leading-relaxed text-[#D7E2EA]/60"
              style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)' }}
            >
              {milestone.description}
            </p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
