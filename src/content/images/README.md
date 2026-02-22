# Image assets (content folder)

One folder per image. Each folder contains:

1. **One image file** – any name, extension `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, or `.gif`.
2. **`meta.yaml`** – minimal metadata:

```yaml
alt: Required description for accessibility
caption: Optional default caption (override in post with caption prop)
attribution: |
  Paste Unsplash HTML here — no escaping. Use the | so you can paste as-is.
```

For `attribution`, use the `|` block style and paste the full Unsplash “Copy” text on the next line(s). No quotes or escaping needed.

At build time, images are copied to `public/images/<folder-name>.<ext>`. In posts: `<Figure id="folder-name" />` or `<Figure id="folder-name" caption="Override" />`.
