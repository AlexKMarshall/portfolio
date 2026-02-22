# Components

Reusable Astro components live here.

## Pattern library

Where it makes sense, document a component in the [pattern library](/pattern-library) so others can see live examples and usage. Add a colocated **`ComponentName.pattern.mdx`** file in the same folder as the component (e.g. `ArticleTags.pattern.mdx` next to `ArticleTags.astro`).

- The file must have frontmatter: `title` and `description` (the description is used in the pattern library index and meta).
- The MDX body can include prose and use the component (e.g. `<ArticleTags tags={['a', 'b']} />`). The pattern library layout passes known components to the MDX renderer.
- The pattern will appear at `/pattern-library/<kebab-case-name>` (e.g. `ArticleTags.pattern.mdx` → `/pattern-library/article-tags`).

If you add a new component that should be usable inside pattern MDX, register it in `src/pages/pattern-library/[slug].astro` in the `components` prop passed to `<Content />`.
