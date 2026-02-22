/**
 * Image metadata: caption and attribution, keyed by the image path as used in posts.
 * Keeps attribution (e.g. Unsplash credit) with the asset so you can reuse the same
 * image and attribution across multiple posts without repeating it.
 *
 * For Unsplash: download the image into public/images/unsplash/, add an entry here
 * with the path, and paste the attribution HTML from Unsplash’s “Copy” link.
 */

export type ImageMeta = {
	/** Default caption for this image (can be overridden per use in the Figure component). */
	caption?: string;
	/** HTML string for credit, e.g. Unsplash “Photo by … on Unsplash”. Rendered inside the figure. */
	attribution?: string;
};

export const imageMetadata: Record<string, ImageMeta> = {
	'/images/placeholder.svg': {
		caption: 'A placeholder graphic.',
	},
	// Example Unsplash entry: put your downloaded file in public/images/unsplash/
	// and paste the attribution HTML from Unsplash here.
	'/images/unsplash/curved-fabric.jpg': {
		caption: 'Curved fabric swatches in neutral and warm tones.',
		attribution:
			'Photo by <a href="https://unsplash.com/@theshubhamdhage?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Shubham Dhage</a> on <a href="https://unsplash.com/photos/curved-fabric-swatches-in-various-neutral-and-warm-tones-AzKnjOs3xNk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>',
	},
};
