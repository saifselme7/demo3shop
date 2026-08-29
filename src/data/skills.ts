export interface Skill {
  name: string;
  role: string;
  note: string;
}

/**
 * The honest stack — every tool listed here is actually used in my work,
 * including this very site.
 */
export const SKILLS: Skill[] = [
  {
    name: 'HTML',
    role: 'Structure',
    note: 'Semantic, accessible markup as the foundation of every build.',
  },
  {
    name: 'CSS',
    role: 'Style',
    note: 'Layout, depth, and polish — from grid systems to glass effects.',
  },
  {
    name: 'JavaScript',
    role: 'Logic',
    note: 'The language that makes everything on screen actually do something.',
  },
  {
    name: 'TypeScript',
    role: 'Safety',
    note: 'Typed code that catches mistakes before the browser ever sees them.',
  },
  {
    name: 'React',
    role: 'UI Engine',
    note: 'Component-based interfaces — including this entire portfolio.',
  },
  {
    name: 'Vite',
    role: 'Tooling',
    note: 'Instant dev server and lean production builds.',
  },
  {
    name: 'Tailwind CSS',
    role: 'Design System',
    note: 'Utility-first styling for fast, consistent, responsive UI.',
  },
  {
    name: 'Framer Motion',
    role: 'Motion',
    note: 'The animation layer behind every reveal and transition on this site.',
  },
];
