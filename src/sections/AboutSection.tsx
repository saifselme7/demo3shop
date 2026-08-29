import AboutShaderBackground from '../components/AboutShaderBackground';
import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import FadeIn from '../components/FadeIn';

const ASSET_BASE =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7';

const ABOUT_TEXT =
  'Not long ago I finished Egyptian Thanaweya Amma with 80% — a score plenty of people said I would never reach. Today I study BIS and Data Analytics at Ain Shams University and spend my nights building web experiences that feel alive. I am early in the journey and moving fast — and honestly, the best part has not even happened yet.';

const FACTS = ['80% — Thanaweya Amma', 'Ain Shams University', 'Chapter 01 of many'];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-20 sm:px-8 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <AboutShaderBackground />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[clamp(420px,68vh,760px)] w-[min(92vw,980px)] -translate-x-1/2 -translate-y-1/2 rounded-[48px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(12, 12, 12, 0.88) 0%, rgba(12, 12, 12, 0.8) 32%, rgba(12, 12, 12, 0.6) 52%, rgba(12, 12, 12, 0.26) 72%, transparent 100%), linear-gradient(180deg, rgba(12, 12, 12, 0.18) 0%, rgba(12, 12, 12, 0.42) 34%, rgba(12, 12, 12, 0.42) 66%, rgba(12, 12, 12, 0.18) 100%)',
          filter: 'blur(12px)',
        }}
        aria-hidden="true"
      />

      {/* Decorative 3D props anchored to each corner. */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute left-[1%] top-[4%] z-10 w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]"
      >
        <img src={`${ASSET_BASE}/moon_icon.11395d36.png`} alt="" className="w-full" />
      </FadeIn>

      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute right-[1%] top-[4%] z-10 w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]"
      >
        <img src={`${ASSET_BASE}/lego_icon-1.703bb594.png`} alt="" className="w-full" />
      </FadeIn>

      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute bottom-[8%] left-[3%] z-10 w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]"
      >
        <img src={`${ASSET_BASE}/p59_1.4659672e.png`} alt="" className="w-full" />
      </FadeIn>

      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute bottom-[8%] right-[3%] z-10 w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]"
      >
        <img src={`${ASSET_BASE}/Group_134-1.2e04f3ce.png`} alt="" className="w-full" />
      </FadeIn>

      <div className="relative z-10 flex flex-col items-center gap-12 sm:gap-16 md:gap-20">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn
            as="h2"
            delay={0}
            y={40}
            className="hero-heading text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            About me
          </FadeIn>

          <AnimatedText
            text={ABOUT_TEXT}
            className="max-w-[620px] text-center font-medium leading-relaxed text-[#D7E2EA]"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />
        </div>

        <FadeIn delay={0.15} y={20} className="flex flex-wrap items-center justify-center gap-3">
          {FACTS.map((fact) => (
            <span
              key={fact}
              className="glass rounded-full px-5 py-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#D7E2EA]/80 sm:text-xs"
            >
              {fact}
            </span>
          ))}
        </FadeIn>

        <FadeIn delay={0.2} y={20}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}
