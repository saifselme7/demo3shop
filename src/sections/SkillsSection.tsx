import FadeIn from '../components/FadeIn';
import TiltCard from '../components/TiltCard';
import { SKILLS } from '../data/skills';

/** Interactive grid of the honest stack, with 3D tilt-on-hover cards. */
export default function SkillsSection() {
  return (
    <section id="skills" className="px-5 py-20 sm:px-8 md:px-10 md:py-32" style={{ overflowX: 'clip' }}>
      <FadeIn
        as="h2"
        delay={0}
        y={40}
        className="hero-heading mb-6 text-center font-black uppercase leading-none tracking-tight"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Skills
      </FadeIn>

      <FadeIn
        as="p"
        delay={0.1}
        y={20}
        className="mx-auto mb-14 max-w-xl text-center font-light leading-relaxed text-[#D7E2EA]/60 sm:mb-16 md:mb-20"
        style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)' }}
      >
        No inflated claims — this is the exact stack I build with, including
        every pixel of this site.
      </FadeIn>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILLS.map((skill, index) => (
          <FadeIn key={skill.name} delay={index * 0.06} y={30} className="h-full">
            <TiltCard className="glass h-full rounded-3xl p-6 transition-colors duration-300 hover:border-white/25">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#D7E2EA]/50">
                {skill.role}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[#D7E2EA] sm:text-2xl">{skill.name}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-[#D7E2EA]/60">{skill.note}</p>
            </TiltCard>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
