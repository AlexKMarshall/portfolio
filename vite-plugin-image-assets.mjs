/**
 * Vite plugin: image content folders → public (optimized) + virtual module
 *
 * Scans src/content/images/<id>/ and src/content/article/<slug>/<asset-id>/ for:
 *   - exactly one image file (.jpg, .jpeg, .png, .webp, .svg, .gif)
 *   - meta.yaml with alt, optional caption and attribution
 *
 * Raster images: Sharp generates multiple widths (400, 800, 1200) as WebP; no upscaling.
 * SVG/GIF: copied as-is. Exposes "virtual:image-assets" with url or sources + fallbackUrl.
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import sharp from 'sharp';

const GLOBAL_IMAGES_DIR = 'src/content/images';
const ARTICLE_DIR = 'src/content/article';
const PUBLIC_DIR = 'public/images';
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|svg|gif)$/i;
const RASTER_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;
const WIDTHS = [400, 800, 1200];
const DEFAULT_SIZES = '(max-width: 768px) 100vw, 800px';
const VIRTUAL_ID = 'virtual:image-assets';
const VIRTUAL_ID_RESOLVED = '\0' + VIRTUAL_ID;

function loadMeta(dir) {
	const yamlPath = path.join(dir, 'meta.yaml');
	if (!fs.existsSync(yamlPath)) return null;
	const raw = fs.readFileSync(yamlPath, 'utf-8');
	const meta = YAML.parse(raw);
	return meta && typeof meta === 'object' ? meta : null;
}

/**
 * Generate WebP variants at WIDTHS (capped at source width). Writes to outDir.
 * @returns {{ srcSet: Array<{ url: string; w: number }>; fallbackUrl: string }}
 */
async function generateRasterVariants(srcPath, outDir, urlPrefix, id) {
	const image = sharp(srcPath);
	const meta = await image.metadata();
	const srcWidth = meta.width ?? Infinity;
	const widths = [...WIDTHS].filter((w) => w <= srcWidth);
	if (srcWidth < Infinity && srcWidth > 0 && !widths.includes(srcWidth)) {
		widths.push(srcWidth);
		widths.sort((a, b) => a - b);
	}
	if (widths.length === 0) widths.push(Math.min(WIDTHS[0], srcWidth) || WIDTHS[0]);

	fs.mkdirSync(outDir, { recursive: true });
	const baseUrl = urlPrefix ? `/images/${urlPrefix}/${id}` : `/images/${id}`;
	const srcSet = [];
	let fallbackUrl = '';

	for (const w of widths) {
		const outName = `${w}.webp`;
		const outPath = path.join(outDir, outName);
		await image
			.clone()
			.resize({ width: w, fit: 'inside' })
			.webp({ quality: 80 })
			.toFile(outPath);
		const url = `${baseUrl}/${outName}`;
		srcSet.push({ url, w });
		if (w === 800 || (w === widths[widths.length - 1] && !fallbackUrl)) fallbackUrl = url;
	}
	if (!fallbackUrl) fallbackUrl = srcSet[srcSet.length - 1].url;

	return {
		sources: [
			{
				type: 'image/webp',
				srcSet,
				sizes: DEFAULT_SIZES,
			},
		],
		fallbackUrl,
	};
}

async function addAsset(map, key, dir, id, publicBase, urlPrefix, root) {
	const files = fs.readdirSync(dir);
	const meta = loadMeta(dir);
	if (!meta) {
		console.warn(`[image-assets] ${key}: missing meta.yaml, skipping`);
		return;
	}
	if (!meta.alt || typeof meta.alt !== 'string') {
		console.warn(`[image-assets] ${key}: meta must have "alt" string`);
		return;
	}
	const imageFile = files.find((f) => IMAGE_EXT.test(f));
	if (!imageFile) {
		console.warn(`[image-assets] ${key}: no image file (.jpg, .png, etc.) found`);
		return;
	}
	const ext = path.extname(imageFile).toLowerCase();
	const srcPath = path.join(dir, imageFile);
	const outDir = path.join(publicBase, urlPrefix, id);
	const baseUrl = urlPrefix ? `/images/${urlPrefix}/${id}` : `/images/${id}`;

	const base = {
		alt: meta.alt,
		caption: meta.caption ?? undefined,
		attribution: meta.attribution ?? undefined,
	};

	if (RASTER_EXT.test(imageFile)) {
		const { sources, fallbackUrl } = await generateRasterVariants(
			srcPath,
			outDir,
			urlPrefix,
			id
		);
		map[key] = { sources, fallbackUrl, ...base };
		return;
	}

	// SVG: copy as-is
	const outName = `image${ext}`;
	const outPath = path.join(outDir, outName);
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.copyFileSync(srcPath, outPath);
	const url = `${baseUrl}/${outName}`;
	map[key] = { url, ...base };
}

async function discoverAndCopy(root) {
	const map = {};
	const publicBase = path.join(root, PUBLIC_DIR);
	fs.mkdirSync(publicBase, { recursive: true });

	// Global images: src/content/images/<id>/
	const globalBase = path.join(root, GLOBAL_IMAGES_DIR);
	if (fs.existsSync(globalBase)) {
		const ids = fs.readdirSync(globalBase, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
		for (const id of ids) {
			const dir = path.join(globalBase, id);
			await addAsset(map, id, dir, id, publicBase, '', root);
		}
	}

	// Local images: src/content/article/<slug>/ with index.mdx or index.md → post folder; subdirs with meta.yaml + image are local assets
	const articleBase = path.join(root, ARTICLE_DIR);
	if (fs.existsSync(articleBase)) {
		const slugs = fs.readdirSync(articleBase, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
		for (const slug of slugs) {
			const postDir = path.join(articleBase, slug);
			const hasIndex = ['index.mdx', 'index.md'].some((f) =>
				fs.existsSync(path.join(postDir, f))
			);
			if (!hasIndex) continue;
			const subdirs = fs.readdirSync(postDir, { withFileTypes: true })
				.filter((d) => d.isDirectory())
				.map((d) => d.name);
			for (const assetId of subdirs) {
				const assetDir = path.join(postDir, assetId);
				const key = slug + '/' + assetId;
				await addAsset(map, key, assetDir, assetId, publicBase, slug, root);
			}
		}
	}
	return map;
}

/** @returns {import('vite').Plugin} */
export default function imageAssetsPlugin() {
	let root = process.cwd();
	/** @type {Record<string, { url?: string; sources?: Array<{ type: string; srcSet: Array<{ url: string; w: number }>; sizes: string }>; fallbackUrl?: string; alt: string; caption?: string; attribution?: string }>} */
	let assetsMap = {};

	return {
		name: 'vite-plugin-image-assets',
		enforce: 'pre',
		configResolved(config) {
			root = config.root;
		},
		async buildStart() {
			assetsMap = await discoverAndCopy(root);
		},
		resolveId(id) {
			if (id === VIRTUAL_ID) return VIRTUAL_ID_RESOLVED;
			return null;
		},
		load(id) {
			if (id !== VIRTUAL_ID_RESOLVED) return null;
			return `export const imageAssets = ${JSON.stringify(assetsMap)};\nexport default imageAssets;`;
		},
		async configureServer() {
			assetsMap = await discoverAndCopy(root);
		},
	};
}
