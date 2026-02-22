# Agent guide — articles

This repo is a simple Astro articles site (future part of a personal developer portfolio). Use this file to work effectively in the codebase without duplicating the human-facing docs.

## What’s here

- **Articles:** Listing at `/articles` (paginated), posts at `/articles/:slug`. Content is Markdown/MDX in the repo; no CMS.
- **Pattern library:** UI pattern docs at `/pattern-library`, one page per pattern; patterns are colocated with components (see **Components** below).
- **Images:** Global assets in `src/content/images/`; folder posts can have colocated image folders. Same structure everywhere (image file + `meta.yaml`) so local assets can be moved to global later.
- **Stack:** Astro 5, TypeScript, Tailwind v4 (Vite plugin), MDX, YAML for image metadata. No extra deps except Tailwind and `yaml`.

## Where to look (don’t duplicate these)

- **Articles and folder posts:** `src/content/article/README.md`
- **Global image assets and meta format:** `src/content/images/README.md`
- **Generated images / deploy:** `public/images/README.md`

## Key paths

| Purpose | Path |
|--------|------|
| Article content (file or folder post) | `src/content/article/` |
| Global image assets (folder per image + `meta.yaml`) | `src/content/images/` |
| Article collection config (glob, schema) | `src/content.config.ts` |
| Image copy + virtual module | `vite-plugin-image-assets.mjs` (root) |
| Reusable components | `src/components/` |
| Figure (resolve id, optional postId) | `src/components/Figure.astro` |
| Pattern library (colocated docs) | `src/components/*.pattern.mdx` → `/pattern-library/[slug]` |
| Post layout, passes `Astro.locals.postId` | `src/pages/articles/[slug].astro` |
| Listing + pagination | `src/pages/articles/index.astro`, `src/pages/articles/page/[page].astro` |
| Shared constants (e.g. page size) | `src/lib/constants.ts` |
| Excerpt from raw body | `src/lib/excerpt.ts` |

## Conventions and constraints

- **TypeScript** where possible; inline prop types, no separate interfaces for component props.
- **Semantic HTML** (e.g. `<article>`, `<figure>`, `<nav>`, `<time>`).
- **Styling:** Tailwind v4 only; grayscale palette (slate), readable spacing and type. No `@tailwindcss/typography`; post body uses utility classes.
- **Dark mode:** Follows OS/browser preference (`prefers-color-scheme: dark`); no theme toggle. When adding or changing components, layouts, or markup that use color utilities (e.g. `bg-*`, `text-*`, `border-*`), always add matching `dark:` variants so the UI looks correct in both modes. Use the existing slate scale (e.g. `dark:bg-slate-900`, `dark:text-slate-100`, `dark:border-slate-700`); keep contrast accessible.
- **Article collection:** Glob excludes `**/README.md` so docs in content dirs don’t get validated as entries.
- **Figure resolution:** In a post, `<Figure id="x" />` resolves to local `postId/x` first, then global `x`. `postId` comes from `Astro.locals.postId` set in `[slug].astro`.

## Commands

- **Dev:** `pnpm dev`
- **Build:** `pnpm build`
- **Preview:** `pnpm preview`

There is no `turbo.json` in this repo; use the scripts above. Prefer running these to verify changes.

## Adding or changing content

- **New file post:** Add `slug.md` or `slug.mdx` under `src/content/article/` with frontmatter `title`, `pubDate`, optional `summary`. See `src/content/article/README.md`.
- **New folder post:** Add `slug/index.mdx` (and optionally colocated image folders). Same frontmatter; slug = folder name.
- **New global image:** Add folder under `src/content/images/<id>/` with one image file and `meta.yaml`. See `src/content/images/README.md`.
- **New local image:** Add folder next to the post’s `index.mdx` with same structure; reference with `<Figure id="folder-name" />` in that post.
- **New components or markup:** Any new Astro components, layout changes, or page markup that use Tailwind color classes must include corresponding `dark:` variants (see **Dark mode** under Conventions). Where it makes sense, document reusable UI components in the pattern library by adding a colocated `ComponentName.pattern.mdx` in the same folder as the component; it will appear at `/pattern-library/<kebab-name>`. See `src/components/README.md`.

## Promoting a local image to global

Move the asset folder from `src/content/article/<post-slug>/<asset-id>/` to `src/content/images/<asset-id>/`. The same `<Figure id="asset-id" />` then resolves globally; no change needed in the post if the id is unchanged.
