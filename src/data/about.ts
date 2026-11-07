// Single source for the About page and the home page quick info.
// Only the birthday is stored (in age.ts); age, birthday display, and both zodiacs are derived from it.

import { getImage } from 'astro:assets';
import { BisexualIcon, GreysexualIcon } from '@assets';
import { getAge, parseBirthday } from './age';

export { getAge };

const ICON_WIDTH = 48;

export const ABOUT = {
  preferredNames: 'Jess or Koko',
  role: 'Artist & Web Developer',
  pronouns: { label: 'She/Her', href: 'https://en.pronouns.page/@KokoTheNekoGirl' },
  gender: 'Female',
  personalityType: 'INFJ-T',
  nationalityEmoji: '🇨🇦',
  sexualityIcons: [
    { src: BisexualIcon, alt: 'Bisexual Flag', title: 'Bisexual' },
    { src: GreysexualIcon, alt: 'Greysexual Heart', title:'Greysexual' },
  ],
  favouriteColourEmoji: '💜',
  interests: ['Animation', 'Anime', 'Video Games', 'Art', 'Web Design/Development'],
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function birthdayHtml(): string {
  const { month, day } = parseBirthday();
  return `${MONTHS[month - 1]} ${day}<sup>${ordinal(day)}</sup>`;
}

const WESTERN = [
  ['capricorn', 'Capricorn', 12, 22], ['sagittarius', 'Sagittarius', 11, 22],
  ['scorpio', 'Scorpio', 10, 23], ['libra', 'Libra', 9, 23],
  ['virgo', 'Virgo', 8, 23], ['leo', 'Leo', 7, 23],
  ['cancer', 'Cancer', 6, 21], ['gemini', 'Gemini', 5, 21],
  ['taurus', 'Taurus', 4, 20], ['aries', 'Aries', 3, 21],
  ['pisces', 'Pisces', 2, 19], ['aquarius', 'Aquarius', 1, 20],
] as const;

export function westernZodiacHtml(): string {
  const { month, day } = parseBirthday();
  const [icon, label] =
    WESTERN.find(([, , m, d]) => month > m || (month === m && day >= d)) ?? WESTERN[0];
  return `<i class="fa-solid fa-${icon}" title="${label}" role="img" aria-label="${label}" title="${label}"></i>`;
}

const CHINESE = ['🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐎', '🐐', '🐒', '🐓', '🐕', '🐖'];

/** Year-based only (ignores the lunar new year boundary, fine for an August birthday). */
export function chineseZodiac(): string {
  const { year } = parseBirthday();
  return CHINESE[(((year - 4) % 12) + 12) % 12];
}

async function sexualityHtml(): Promise<string> {
  const imgs = await Promise.all(
    ABOUT.sexualityIcons.map(async ({ src, alt, title }) => {
      const img = await getImage({ src, width: ICON_WIDTH, format: 'webp' });
      const { width, height } = img.attributes;
      return `<img class="img-icon" src="${img.src}" alt="${alt}" title="${title}" width="${width}" height="${height}" loading="eager" fetchpriority="high" decoding="async">`;
    }),
  );
  return `<span class="icon-group">${imgs.join('')}</span>`;
}

export type AboutItem = { label: string; html: string; quick: boolean };

/** Full list for the About page; `quick: true` items go in the home page swiper. */
export async function getAboutItems(today: Date = new Date()): Promise<AboutItem[]> {
  return [
    { label: 'Preferred Names', html: ABOUT.preferredNames, quick: true },
    { label: 'Role', html: ABOUT.role.replace('&', '&amp;'), quick: true },
    {
      label: 'Pronouns',
      html: `<a href="${ABOUT.pronouns.href}" target="_blank" rel="external noopener" aria-describedby="external-hint">${ABOUT.pronouns.label}</a>`,
      quick: true,
    },
    { label: 'Gender', html: ABOUT.gender, quick: true },
    { label: 'Personality Type', html: ABOUT.personalityType, quick: true },
    { label: 'Age', html: `<span data-age>${getAge(today)}</span>`, quick: true },
    { label: 'Birthday', html: birthdayHtml(), quick: false },
    { label: 'Zodiac Sign', html: westernZodiacHtml(), quick: true },
    { label: 'Chinese Zodiac', html: `Year of the ${chineseZodiac()}`, quick: true },
    { label: 'Nationality', html: ABOUT.nationalityEmoji, quick: true },
    { label: 'Sexuality', html: await sexualityHtml(), quick: true },
    { label: 'Favourite Colour', html: ABOUT.favouriteColourEmoji, quick: false },
    { label: 'Interests', html: ABOUT.interests.join(', '), quick: false },
  ];
}