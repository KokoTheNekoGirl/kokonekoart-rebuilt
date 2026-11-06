// Single source for portfolio categories (label + label color).
// Add a category here, then use its id in a piece's `categories: [...]` frontmatter.
// Invalid ids fail the build (see the schema in content.config.ts).
//
// Optional `sisters: ['other-id']` links categories so each one's page lists the other's pieces too
// (e.g. 'ui-design' with sisters: ['design-mockups']). It works both ways: you only list it on one side.
// Sisters are direct only: a<->b and b<->c does not make a<->c.

interface CategoryDef {
  label: string;
  color: string;
  sisters?: readonly string[];
}

export const CATEGORIES = {
  'discord-bot': { label: 'Discord Bot', color: '#98daff' },
  'live-site': { label: 'Live Site', color: '#fc8ce4' },
  'design-mockups': { label: 'Design Mockups', color: '#ffb876' },
  'figma-prototype': { label: 'Figma Prototype', color: '#50d99f' },
  'website': { label: 'Website', color: '#fff8a5' },
  'react-typescript': { label: 'React/TypeScript', color: '#ff8080' },
  'astro-typescript': { label: 'Astro/TypeScript', color: '#ff8080', sisters:['react-typescript'] },
} as const satisfies Record<string, CategoryDef>;

export type CategoryId = keyof typeof CATEGORIES;

/** Tuple form for z.enum(). */
export const CATEGORY_IDS = Object.keys(CATEGORIES) as [CategoryId, ...CategoryId[]];

/** The category itself plus its sisters (in either direction). Used to decide which pieces a category page lists. */
export function relatedCategories(id: CategoryId): CategoryId[] {
  const related = new Set<CategoryId>([id]);
  for (const [other, def] of Object.entries(CATEGORIES) as [CategoryId, CategoryDef][]) {
    const sisters = (def.sisters ?? []).filter((s): s is CategoryId => s in CATEGORIES);
    if (other === id) sisters.forEach((s) => related.add(s));
    else if (sisters.includes(id)) related.add(other);
  }
  return [...related];
}

export const categoryPath = (id: CategoryId) => `/portfolio/project/${id}`;
