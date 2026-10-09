// Single source of truth for identity, links and navigation. Never put a phone number here.
export const site = {
  name: 'Shasank Jabade',
  title: 'Shasank Jabade · Lead engineer, distributed systems and agentic AI',
  description:
    'Software Development Lead with 7+ years building event-driven platforms and agentic AI systems, from the API gateway to the pixel.',
  url: 'https://shasankj.github.io', // TODO: update with the final GitHub Pages URL or custom domain (also in astro.config.mjs)
  email: 'shasank306@gmail.com',
  github: 'https://github.com/shasankj',
  linkedin: 'https://www.linkedin.com/in/shasank-j-10838a7b',
  resume: '/resume.pdf',
  location: 'New Jersey',
};

export const nav = [
  { href: '/projects/', label: 'Projects' },
  { href: '/experience/', label: 'Experience' },
  { href: '/notes/', label: 'Notes' },
  { href: '/about/', label: 'About' },
];

// Filter tags for the projects index. Keep in sync with the Zod enum in src/content.config.ts.
export const tags = ['AI/Agents', 'RAG', 'Distributed Systems', 'AWS', 'Azure', 'Full-stack'] as const;
