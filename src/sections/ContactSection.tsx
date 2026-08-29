import { ArrowUpRight, Instagram } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import Magnet from '../components/Magnet';
import { TikTokIcon } from '../components/icons';
import { SOCIALS } from '../data/socials';

function SocialIcon({ name }: { name: string }) {
  if (name === 'TikTok') {
    return <TikTokIcon size={26} />;
  }
  return <Instagram size={26} />;
}

/** Closing CTA: “This is only the beginning” plus magnetic social cards. */
export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-5 pb-10 pt-24 text-center sm:px-8 md:px-10 md:pt-32"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="hero-orb" style={{ opacity: 0.7 }} />
      </div>

      <div className="relative z-10">
        <FadeIn
          as="p"
          delay={0}
          y={20}
          className="mb-5 text-[0.65rem] font-medium uppercase tracking-[0.4em] text-[#D7E2EA]/60 sm:text-xs"
        >
          One last thing
        </FadeIn>

        <FadeIn
          as="h2"
          delay={0.1}
          y={40}
          className="hero-heading mx-auto font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.6rem, 10vw, 140px)' }}
        >
          This Is Only The Beginning
        </FadeIn>

        <FadeIn
          as="p"
          delay={0.2}
          y={20}
          className="mx-auto mt-6 max-w-xl font-light leading-relaxed text-[#D7E2EA]/70"
          style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)' }}
        >
          Follow the journey, watch new projects roll out, or just come say hi.
          The best chapters haven&apos;t been written yet.
        </FadeIn>

        <div className="mx-auto mt-12 flex max-w-2xl flex-col justify-center gap-4 sm:flex-row">
          {SOCIALS.map((social, index) => (
            <FadeIn key={social.name} delay={0.15 + index * 0.1} y={24} className="flex-1">
              <Magnet padding={70} strength={7}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass group flex items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left transition-all duration-300 hover:border-white/25 hover:bg-white/[0.07]"
                >
                  <span className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#D7E2EA] transition-transform duration-300 group-hover:scale-110">
                      <SocialIcon name={social.name} />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold uppercase tracking-widest text-[#D7E2EA]">
                        {social.name}
                      </span>
                      <span className="text-xs font-light text-[#D7E2EA]/50">{social.handle}</span>
                    </span>
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="text-[#D7E2EA]/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#D7E2EA]"
                  />
                </a>
              </Magnet>
            </FadeIn>
          ))}
        </div>

        <FadeIn
          as="p"
          delay={0.35}
          y={20}
          className="accent-text mt-16 font-semibold uppercase tracking-[0.3em]"
          style={{ fontSize: 'clamp(0.85rem, 2vw, 1.3rem)' }}
        >
          We&apos;re just getting started.
        </FadeIn>

        <footer className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-[0.65rem] font-light uppercase tracking-[0.2em] text-[#D7E2EA]/40 sm:flex-row sm:text-xs">
          <span>© 2026 Saif Selme</span>
          <span>Built with React, TypeScript &amp; a point to prove</span>
        </footer>
      </div>
    </section>
  );
}
