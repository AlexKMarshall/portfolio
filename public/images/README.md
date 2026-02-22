# Image assets

Organize images used in blog posts here.

- **screenshots/** – Your own images (e.g. UI screenshots). Reference in posts as `/images/screenshots/filename.png`. Add caption and optional attribution in `src/data/image-metadata.ts` if you want a default caption or credit.
- **unsplash/** – Downloaded Unsplash images. Put the file here, then add an entry in `src/data/image-metadata.ts` with the path (e.g. `/images/unsplash/your-file.jpg`), a caption, and paste the Unsplash attribution HTML from their “Copy” link so the same image can be reused with correct credit across posts.

Use the `<Figure>` component in MDX posts to render a `<figure>` with optional caption and attribution from the metadata.
