import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, relatedCategories, type CategoryId } from '@data/portfolio-categories';

export type PortfolioEntry = CollectionEntry<'portfolio'>;

export const pieceHref = (piece: PortfolioEntry) => `/portfolio/${piece.id}`;

/** Projects completed before this date were college work and get a note on their first slide. */
export const COLLEGE_CUTOFF = new Date('2024-05-01T00:00:00Z');
export const COLLEGE_NOTE =
  'This project was completed during my college years. It may not accurately display my current design process and skill level.';
export const isCollegeProject = (completed: Date) => completed < COLLEGE_CUTOFF;

/**
 * Portfolio pieces, newest `completed` date first.
 * Pass a category id to get the pieces in that category or any of its sister categories.
 */
export async function getPortfolio(category?: CategoryId): Promise<PortfolioEntry[]> {
  const accepted = category ? relatedCategories(category) : null;
  const pieces = await getCollection('portfolio', (p) => !accepted || p.data.categories.some((c) => accepted.includes(c)));
  return pieces.sort((a, b) => b.data.completed.valueOf() - a.data.completed.valueOf());
}

/**
 * Categories that have at least one piece to show (so no empty category pages), in portfolio-categories.ts order.
 * A category counts if it, or one of its sisters, is used by a piece.
 */
export async function getUsedCategories(): Promise<CategoryId[]> {
  const used = new Set((await getCollection('portfolio')).flatMap((p) => p.data.categories));
  return (Object.keys(CATEGORIES) as CategoryId[]).filter((id) => relatedCategories(id).some((r) => used.has(r)));
}

export interface FinalLink {
  href: string;
  label: string;
  /** Font Awesome classes */
  icon: string;
}

/** The "Final Result" buttons, in the same order as the old WordPress page. Only filled-in links appear. */
export function getFinalLinks(links: PortfolioEntry['data']['links']): FinalLink[] {
  const out: FinalLink[] = [];
  if (links.github) out.push({ href: links.github, label: 'View code', icon: 'fa-brands fa-github' });
  if (links.live) {
    const href = /^(https?:)?\/\/|^\//.test(links.live) ? links.live : `/project/${links.live.replace(/^\/+|\/+$/g, '')}`;
    out.push({ href, label: 'View live', icon: 'fa-solid fa-computer-mouse' });
  }
  if (links.figma) {
    out.push({
      href: links.figma.url,
      label: links.figma.type === 'prototype' ? 'View prototype' : 'View design',
      icon: 'fa-brands fa-figma',
    });
  }
  if (links.mockup) out.push({ href: links.mockup, label: 'View mockup', icon: 'fa-solid fa-file-pdf' });
  if (links.site) out.push({ href: links.site, label: 'View site', icon: 'fa-solid fa-globe' });
  return out;
}
