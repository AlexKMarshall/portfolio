# Served images (generated at build)

Images are **not** authored here. They live in **`src/content/images/`** (global) or next to a post in **`src/content/article/<slug>/`** (local). Each asset folder has one image file and a `meta.yaml`. At build time, **raster** images are optimized with Sharp into multiple WebP widths (e.g. `public/images/<id>/400.webp`, `800.webp`, `1200.webp`); **SVG** is copied as-is. The Figure component serves these via `<picture>` (raster) or `<img>` (SVG). See `src/content/images/README.md` for the content structure.
