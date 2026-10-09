import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Allowed filter tags. Keep in sync with src/data/site.ts.
const tag = z.enum(['AI/Agents', 'RAG', 'Distributed Systems', 'AWS', 'Azure', 'Full-stack']);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'use a 6-digit hex color like #0f766e');

// One schema serves both `projects` and anonymized `work` case studies.
const caseStudy = z.object({
  title: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string().max(240),
  tldr: z.string(), // 2-3 sentences shown at the top of the page
  role: z.string(),
  status: z.enum(['live', 'in-progress', 'archived']),
  date: z.coerce.date(),
  order: z.number().default(100), // lower first; ties broken by newest date
  featured: z.boolean().default(false),
  tags: z.array(tag).default([]),
  stack: z.array(z.string()).default([]),
  cloud: z.array(z.string()).default([]),
  accentColor: hex, // light theme; must reach 4.5:1 on the paper background
  accentColorDark: hex.optional(), // dark theme; defaults to accentColor
  links: z.object({ live: z.url().optional(), repo: z.url().optional(), video: z.url().optional() }).default({}),
  // Optional raster cover. If omitted, a generated pattern in the accent color is used.
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  // Architecture: a file at src/diagrams/<diagram>.svg using data-step attributes, plus one entry per step.
  diagram: z.string().optional(),
  diagramAlt: z.string().optional(),
  steps: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
  decisions: z.array(z.object({ decision: z.string(), why: z.string(), alternative: z.string() })).default([]),
  challenges: z.array(z.object({ title: z.string(), story: z.string() })).default([]),
  // Only real numbers. An empty list renders a visible TODO placeholder.
  metrics: z.array(z.object({ label: z.string(), value: z.string(), note: z.string().optional() })).default([]),
  readiness: z
    .object({
      tests: z.string(),
      cicd: z.string(),
      observability: z.string(),
      security: z.string(),
      cost: z.string(),
    })
    .optional(),
  next: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const projects = defineCollection({
  loader: glob({ pattern: ['*.{md,mdx}', '!_*'], base: './src/content/projects' }),
  schema: caseStudy,
});

const work = defineCollection({
  loader: glob({ pattern: ['*.{md,mdx}', '!_*'], base: './src/content/work' }),
  schema: caseStudy,
});

const notes = defineCollection({
  loader: glob({ pattern: ['*.{md,mdx}', '!_*'], base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    description: z.string().max(240),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    project: z.string().optional(), // slug of a related project
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, work, notes };
