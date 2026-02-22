# Image assets (global)

One folder per image. Each folder contains:

1. **One image file** – any name, extension `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, or `.gif`.
2. **`meta.yaml`** – minimal metadata:

```yaml
alt: Required description for accessibility
caption: Optional default caption (override in post with caption prop)
attribution: |
  Paste Unsplash HTML here — no escaping. Use the | so you can paste as-is.
```

At build time, images are copied to `public/images/<folder-name>.<ext>`. In any post: `<Figure id="folder-name" />`.

**To promote a local (post-colocated) image to global:** move the asset folder from `src/content/blog/<post-slug>/<asset-id>/` to `src/content/images/<asset-id>/`. Update the post to use `<Figure id="asset-id" />` (same id, now resolved globally).
