import { getCollection, type CollectionEntry } from 'astro:content';

// Drafts show in `npm run dev` for review but are excluded from production builds.
const visible = ({ data }: { data: { draft: boolean } }) => (import.meta.env.PROD ? !data.draft : true);

export type CaseStudy = CollectionEntry<'projects'> | CollectionEntry<'work'>;

export const sortCases = <T extends CaseStudy>(list: T[]) =>
  [...list].sort((a, b) => a.data.order - b.data.order || b.data.date.valueOf() - a.data.date.valueOf());

export async function getProjects() {
  return sortCases(await getCollection('projects', visible));
}
export async function getWork() {
  return sortCases(await getCollection('work', visible));
}
export async function getNotes() {
  return (await getCollection('notes', visible)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
