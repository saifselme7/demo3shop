import { motion, useScroll, useTransform } from 'framer-motion';
import type Hls from 'hls.js';
import { ArrowDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ContactButton from '../components/ContactButton';
import FadeIn from '../components/FadeIn';
import Magnet from '../components/Magnet';

interface HeroSectionProps {
  /** Fired once the WebGL scene has rendered its first frame. */
  onSceneReady?: () => void;
  /** When false, the hero copy waits for the preloader reveal to animate in. */
  revealed?: boolean;
}

const HERO_VIDEO_SRC = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';
const HLS_MIME_TYPE = 'application/vnd.apple.mpegurl';

export default function HeroSection({ onSceneReady, revealed = true }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let mounted = true;
    let hls: Hls | null = null;

    const notifyReady = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      onSceneReady?.();
    };

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise) {
        void playPromise.catch(() => {});
      }
    };

    const attachNativeSource = () => {
      video.src = HERO_VIDEO_SRC;
      video.load();
      attemptPlay();
    };

    const handleCanPlay = () => {
      notifyReady();
      attemptPlay();
    };

    const handlePlaying = () => {
      notifyReady();
    };

    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    video.addEventListener('loadedmetadata', handleCanPlay);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);

    const setupVideo = async () => {
      const HlsModule = await import('hls.js');
      if (!mounted) return;

      const HlsConstructor = HlsModule.default;

      // Prefer hls.js on MSE-capable browsers. Native HLS is the fallback.
      if (HlsConstructor.isSupported()) {
        hls = new HlsConstructor({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.on(HlsConstructor.Events.MANIFEST_PARSED, () => {
          if (!mounted) return;
          attemptPlay();
        });

        hls.on(HlsConstructor.Events.ERROR, (_event, data) => {
          if (!mounted || !hls || !data.fatal) return;

          if (data.type === HlsConstructor.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === HlsConstructor.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          hls.destroy();
          hls = null;

          if (video.canPlayType(HLS_MIME_TYPE)) {
            attachNativeSource();
          }
        });

        hls.loadSource(HERO_VIDEO_SRC);
        hls.attachMedia(video);
        return;
      }

      if (video.canPlayType(HLS_MIME_TYPE)) {
        attachNativeSource();
        return;
      }

      notifyReady();
    };

    void setupVideo().catch(() => {
      if (!mounted) return;

      if (video.canPlayType(HLS_MIME_TYPE)) {
        attachNativeSource();
        return;
      }

      notifyReady();
    });

    return () => {
      mounted = false;
      video.removeEventListener('loadedmetadata', handleCanPlay);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.pause();
      if (hls) {
        hls.destroy();
        hls = null;
      }
      video.removeAttribute('src');
      video.load();
    };
  }, [onSceneReady]);

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(12, 12, 12, 0.72) 100%)',
        }}
        aria-hidden="true"
      />

      {revealed && (
        <>
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-28 text-center sm:px-8 md:pt-32"
          >
            <FadeIn
              as="p"
              delay={0.1}
              y={20}
              className="mb-5 text-[0.65rem] font-medium uppercase tracking-[0.4em] text-[#D7E2EA]/60 sm:text-xs md:text-sm"
            >
              Welcome to the portfolio of
            </FadeIn>

            <div className="w-full overflow-hidden px-2 sm:px-0">
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                className="hero-heading mx-auto block max-w-full text-center font-black uppercase leading-none tracking-tight whitespace-normal sm:whitespace-nowrap"
                style={{ fontSize: 'clamp(2.4rem, 14vw, 12rem)' }}
              >
                Saif Selme
              </motion.h1>
            </div>

            <FadeIn
              as="p"
              delay={0.4}
              y={30}
              className="accent-text mt-4 font-semibold uppercase tracking-wide"
              style={{ fontSize: 'clamp(1rem, 2.6vw, 1.8rem)' }}
            >
              80% was only the beginning.
            </FadeIn>

            <FadeIn
              as="p"
              delay={0.55}
              y={20}
              className="mt-6 max-w-md font-light leading-relaxed text-[#D7E2EA]/70 sm:max-w-xl"
              style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)' }}
            >
              Creative web developer and future data analyst from Egypt — building
              interactive experiences with depth, motion, and a point to prove.
            </FadeIn>

            <FadeIn delay={0.7} y={20} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <Magnet padding={60} strength={6}>
                <ContactButton />
              </Magnet>
              <Magnet padding={60} strength={6}>
                <a
                  href="#projects"
                  className="inline-block rounded-full border-2 border-[#D7E2EA]/60 px-8 py-3 text-xs font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:border-[#D7E2EA] hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base"
                >
                  Explore My Work
                </a>
              </Magnet>
            </FadeIn>
          </motion.div>

          <div className="relative z-10 flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
            <FadeIn
              as="p"
              delay={0.85}
              y={16}
              className="max-w-[180px] text-left text-[0.6rem] font-light uppercase leading-snug tracking-[0.25em] text-[#D7E2EA]/50 sm:max-w-none sm:text-xs"
            >
              BIS &amp; Data Analytics — Ain Shams University
            </FadeIn>

            <FadeIn delay={0.95} y={16}>
              <a
                href="#about"
                aria-label="Scroll to the About section"
                className="flex flex-col items-center gap-2 text-[#D7E2EA]/60 transition-colors duration-200 hover:text-[#D7E2EA]"
              >
                <span className="hidden text-[0.6rem] font-light uppercase tracking-[0.25em] sm:block sm:text-xs">
                  We&apos;re just getting started
                </span>
                <motion.span
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowDown size={18} />
                </motion.span>
              </a>
            </FadeIn>
          </div>
        </>
      )}
    </section>
  );
}
