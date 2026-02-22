import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const article = defineCollection({
	loader: glob({
		pattern: ['**/*.{md,mdx}', '!**/README.md'],
		base: './src/content/article',
		generateId({ entry }) {
			// Folder post: more-elements-demo/index.mdx -> more-elements-demo
			const withoutIndex = entry.replace(/\/index\.(mdx?|md)$/i, '');
			return withoutIndex.replace(/\.(mdx?|md)$/i, '');
		},
	}),
	schema: z.object({
		title: z.string(),
		summary: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z
			.array(z.string())
			.optional()
			.transform((arr) => {
				if (!arr?.length) return [];
				const seen = new Set<string>();
				return arr
					.map((s) => s.trim())
					.filter((s) => {
						if (!s) return false;
						const key = s.toLowerCase();
						if (seen.has(key)) return false;
						seen.add(key);
						return true;
					});
			}),
	}),
});

const site = defineCollection({
	loader: glob({
		pattern: ['**/*.md', '**/*.mdx', '!**/README.md'],
		base: './src/content/site',
		generateId({ entry }) {
			return entry.replace(/\.(mdx?|md)$/i, '');
		},
	}),
	schema: z.object({
		hero: z.string(),
		github: z.string().url().optional(),
		linkedin: z.string().url().optional(),
	}),
});

export const collections = {
	article,
	site,
};
