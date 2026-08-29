import { MotionValue, motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import FadeIn from '../components/FadeIn';
import LiveProjectButton from '../components/LiveProjectButton';
import { PROJECTS, Project } from '../data/projects';

const CARD_RADIUS = 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px]';

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 py-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn
        as="h2"
        delay={0}
        y={40}
        className="hero-heading mb-6 text-center font-black uppercase leading-none tracking-tight"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Projects
      </FadeIn>

      <FadeIn
        as="p"
        delay={0.1}
        y={20}
        className="mx-auto mb-16 max-w-xl text-center font-light leading-relaxed text-[#D7E2EA]/60 sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)' }}
      >
        Concept builds and creative experiments — this collection grows with
        every chapter.
      </FadeIn>

      <div ref={containerRef} className="mx-auto max-w-6xl">
        {PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.number}
            project={project}
            index={index}
            total={PROJECTS.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function ProjectCard({ project, index, total, progress }: ProjectCardProps) {
  // Cards further up the stack shrink a little more as the next one arrives.
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index * (1 / total), 1], [1, targetScale]);

  return (
    <div className="sticky top-24 flex h-[85vh] items-start justify-center md:top-32">
      <motion.article
        className={`relative w-full border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(182,0,168,0.18)] sm:p-6 md:p-8 ${CARD_RADIUS}`}
        style={{ scale, top: `${index * 28}px` }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4 sm:mb-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <span
              className="hero-heading font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 120px)' }}
            >
              {project.number}
            </span>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">
                {project.category}
              </span>
              <h3
                className="font-medium uppercase leading-tight text-[#D7E2EA]"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {project.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {project.liveUrl ? (
              <LiveProjectButton href={project.liveUrl} external />
            ) : (
              <span className="inline-block rounded-full border-2 border-dashed border-[#D7E2EA]/30 px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA]/40 sm:px-10 sm:py-3.5 sm:text-base">
                Live Soon
              </span>
            )}
            {project.repoUrl ? (
              <LiveProjectButton href={project.repoUrl} external label="GitHub" />
            ) : null}
          </div>
        </div>

        <p
          className="mb-3 max-w-2xl font-light leading-relaxed text-[#D7E2EA]/60 sm:mb-4"
          style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)' }}
        >
          {project.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-2 sm:mb-6">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[#D7E2EA]/25 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-widest text-[#D7E2EA]/70 sm:text-xs"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-3 sm:gap-4 md:gap-6">
          <div className="flex w-[40%] flex-col gap-3 sm:gap-4 md:gap-6">
            <img
              src={project.colOneImages[0]}
              alt={`${project.name} preview 1`}
              loading="lazy"
              className={`w-full object-cover ${CARD_RADIUS}`}
              style={{ height: 'clamp(110px, 14vw, 210px)' }}
            />
            <img
              src={project.colOneImages[1]}
              alt={`${project.name} preview 2`}
              loading="lazy"
              className={`w-full object-cover ${CARD_RADIUS}`}
              style={{ height: 'clamp(140px, 20vw, 320px)' }}
            />
          </div>

          <div className="w-[60%]">
            <img
              src={project.colTwoImage}
              alt={`${project.name} preview 3`}
              loading="lazy"
              className={`h-full w-full object-cover ${CARD_RADIUS}`}
            />
          </div>
        </div>
      </motion.article>
    </div>
  );
}
