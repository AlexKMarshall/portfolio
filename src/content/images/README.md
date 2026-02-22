# Image assets (content folder)

One folder per image. Each folder must contain:

1. **One image file** – any name, extension `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, or `.gif`.
2. **`meta.json`** – metadata for the image:

```json
{
  "alt": "Required description for accessibility",
  "caption": "Optional default caption (can be overridden in the post)",
  "attribution": "Optional HTML, e.g. Unsplash credit: Photo by <a href=\"...\">Name</a> on <a href=\"...\">Unsplash</a>"
}
```

At build time, images are copied to `public/images/<folder-name>.<ext>` and served from there. In posts, reference by the folder name (id): `<Figure id="folder-name" />` or `<Figure id="folder-name" caption="Override caption" />`.
