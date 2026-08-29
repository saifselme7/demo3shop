export interface Service {
  number: string;
  name: string;
  description: string;
}

export const SERVICES: Service[] = [
  {
    number: '01',
    name: 'Web Development',
    description:
      'Modern, responsive websites built with React and TypeScript — fast, clean, and made with an unreasonable amount of attention to detail.',
  },
  {
    number: '02',
    name: 'Creative Websites',
    description:
      'Sites with personality: bold typography, depth, and design choices that make people stop scrolling.',
  },
  {
    number: '03',
    name: 'Interactive Experiences',
    description:
      'Micro-interactions, scroll-driven animation, and playful details that make an interface feel alive instead of static.',
  },
  {
    number: '04',
    name: 'Modern Frontend Development',
    description:
      'Component-based architecture with Vite and Tailwind CSS — quick to load, easy to maintain, and ready to grow.',
  },
  {
    number: '05',
    name: 'UI Implementation',
    description:
      'Turning designs into pixel-accurate, accessible interfaces that hold up on every screen size.',
  },
];
