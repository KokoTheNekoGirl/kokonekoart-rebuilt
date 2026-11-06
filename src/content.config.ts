import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_IDS } from '@data/portfolio-categories';

const portfolio = defineCollection({
	loader: glob({ base: './src/content/portfolio', pattern: ['**/*.{md,mdx}', '!**/_*'] }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			completed: z.coerce.date(),
			heroImage: z.optional(image()),
			heroAlt: z.string().optional(),
			categories: z.array(z.enum(CATEGORY_IDS)).default([]),
			slides: z
				.array(
					z.object({
						title: z.string(),
						content: z.string().optional(),
						images: z.array(z.object({ src: image(), alt: z.string() })).default([]),
					}),
				)
				.default([]),
			links: z
				.object({
					github: z.string().url().optional(),
					live: z.string().optional(), 
					figma: z
						.object({ url: z.string().url(), type: z.enum(['design', 'prototype']).default('design') })
						.optional(), 
					mockup: z.string().optional(), 
					site: z.string().url().optional(),
				})
				.default({}),
			finalText: z.string().optional(),
			finalNote: z.string().optional(),
		}),
});

const legal = defineCollection({
	loader: glob({ base: './src/content/legal', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		updated: z.coerce.date().optional(),
	}),
});

export const collections = { portfolio, legal };
