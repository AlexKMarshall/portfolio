# Articles

**File post:** `slug.md` or `slug.mdx` — the slug is the filename (without extension).

**Folder post:** `slug/index.mdx` (or `index.md`) — the slug is the folder name. Use this when you want **colocated assets**: put image folders next to `index.mdx` with the same structure as global images (one image file + `meta.yaml`). Those images are only available in that post. Use `<Figure id="asset-folder-name" />`; resolution is local first, then global.

To turn a local image into a global one, move its folder to `src/content/images/<id>/` and reference it by the same id in any post.
