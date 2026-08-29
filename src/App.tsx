import { useCallback, useState } from 'react';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Preloader from './components/Preloader';
import AboutSection from './sections/AboutSection';
import ContactSection from './sections/ContactSection';
import HeroSection from './sections/HeroSection';
import JourneySection from './sections/JourneySection';
import MarqueeSection from './sections/MarqueeSection';
import ProjectsSection from './sections/ProjectsSection';
import ServicesSection from './sections/ServicesSection';
import SkillsSection from './sections/SkillsSection';

export default function App() {
  // The boot sequence completes only when the hero's WebGL scene has actually
  // rendered a frame (with a failsafe inside the preloader itself).
  const [sceneReady, setSceneReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleRevealStart = useCallback(() => setRevealed(true), []);

  return (
    <main className="min-h-screen bg-[#0C0C0C]" style={{ overflowX: 'clip' }}>
      <Preloader ready={sceneReady} onRevealStart={handleRevealStart} />
      <CustomCursor />
      <Navbar />
      <HeroSection onSceneReady={handleSceneReady} revealed={revealed} />
      <MarqueeSection />
      <AboutSection />
      <JourneySection />
      <SkillsSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}
