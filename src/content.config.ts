import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({
		pattern: ['**/*.{md,mdx}', '!**/README.md'],
		base: './src/content/blog',
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
	}),
});

export const collections = {
	blog,
};
