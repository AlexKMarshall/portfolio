# Articles

**File post:** `slug.md` or `slug.mdx` — the slug is the filename (without extension).

**Frontmatter:** `title`, `pubDate` (required); `summary`, `updatedDate`, `tags` (optional). Use `updatedDate` when you last meaningfully edited the post so readers can see how up to date it is. **Tags:** optional array of strings, e.g. `tags: [react, typescript]`. You don't define tags up front—add any tags when writing a post. Duplicates are normalized: trimming and case-insensitive deduplication (e.g. `React` and `react` become one; first occurrence keeps its casing). To avoid singular/plural or typo duplicates, use a consistent form (e.g. pick "react" or "React" and stick to it).

**Folder post:** `slug/index.mdx` (or `index.md`) — the slug is the folder name. Use this when you want **colocated assets**: put image folders next to `index.mdx` with the same structure as global images (one image file + `meta.yaml`). Those images are only available in that post. Use `<Figure id="asset-folder-name" />`; resolution is local first, then global.

To turn a local image into a global one, move its folder to `src/content/images/<id>/` and reference it by the same id in any post.
