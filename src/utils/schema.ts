import { SITE_TITLE, SITE_DESCRIPTION } from '@consts';
import { socialLinks } from '@data/social-links';

// Schema.org building blocks shared across pages. Entities reference each other by @id so
// search engines see one person/brand, not a new one on every page.
const origin = (site: URL | undefined) => (site ?? new URL('https://kokoneko.art')).origin;

export const personId = (site: URL | undefined) => `${origin(site)}/#koko`;
export const brandId = (site: URL | undefined) => `${origin(site)}/#brand`;
export const websiteId = (site: URL | undefined) => `${origin(site)}/#website`;

/** Public profile URLs. Discord is left out because it is a user ID, not a profile page. */
const profileUrls = socialLinks.filter((l) => !/discord/i.test(l.url)).map((l) => l.url);

export function personNode(site: URL | undefined) {
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: 'Koko',
    alternateName: 'Jess',
    url: origin(site) + '/',
    jobTitle: 'Web designer, developer and furry digital artist',
    brand: { '@id': brandId(site) },
    sameAs: profileUrls,
  };
}

export function brandNode(site: URL | undefined) {
  return {
    '@type': 'Brand',
    '@id': brandId(site),
    name: SITE_TITLE,
    slogan: SITE_DESCRIPTION,
    url: origin(site) + '/',
    logo: origin(site) + '/web-app-manifest-512x512.png',
  };
}

export function websiteNode(site: URL | undefined) {
  return {
    '@type': 'WebSite',
    '@id': websiteId(site),
    name: SITE_TITLE,
    url: origin(site) + '/',
    inLanguage: 'en-CA',
    publisher: { '@id': personId(site) },
  };
}

/** Invisible breadcrumb data for search results (no breadcrumb is shown on the page). */
export function breadcrumbs(site: URL | undefined, trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: origin(site) + t.path,
    })),
  };
}
