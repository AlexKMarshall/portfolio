/**
 * Vite plugin: image content folders → public + virtual module
 *
 * Scans src/content/images/<id>/ for:
 *   - exactly one image file (.jpg, .jpeg, .png, .webp, .svg, .gif)
 *   - meta.yaml with alt, optional caption and attribution
 * YAML allows raw paste of Unsplash HTML (use | for multi-line).
 * Copies the image to public/images/<id>.<ext> and exposes "virtual:image-assets".
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const GLOBAL_IMAGES_DIR = 'src/content/images';
const BLOG_DIR = 'src/content/blog';
const PUBLIC_DIR = 'public/images';
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|svg|gif)$/i;
const VIRTUAL_ID = 'virtual:image-assets';
const VIRTUAL_ID_RESOLVED = '\0' + VIRTUAL_ID;

function loadMeta(dir) {
	const yamlPath = path.join(dir, 'meta.yaml');
	if (!fs.existsSync(yamlPath)) return null;
	const raw = fs.readFileSync(yamlPath, 'utf-8');
	const meta = YAML.parse(raw);
	return meta && typeof meta === 'object' ? meta : null;
}

function addAsset(map, key, dir, id, publicBase, urlPrefix) {
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
	const outName = id + ext;
	const srcPath = path.join(dir, imageFile);
	const outPath = path.join(publicBase, urlPrefix, outName);
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.copyFileSync(srcPath, outPath);
	const url = urlPrefix ? `/images/${urlPrefix}/${outName}` : '/images/' + outName;
	map[key] = {
		url,
		alt: meta.alt,
		caption: meta.caption ?? undefined,
		attribution: meta.attribution ?? undefined,
	};
}

function discoverAndCopy(root) {
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
			addAsset(map, id, dir, id, publicBase, '');
		}
	}

	// Local images: src/content/blog/<slug>/ with index.mdx or index.md -> post folder; subdirs with meta.yaml + image are local assets
	const blogBase = path.join(root, BLOG_DIR);
	if (!fs.existsSync(blogBase)) return map;
	const blogDirs = fs.readdirSync(blogBase, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);
	for (const slug of blogDirs) {
		const postDir = path.join(blogBase, slug);
		const hasIndex = ['index.mdx', 'index.md'].some((f) => fs.existsSync(path.join(postDir, f)));
		if (!hasIndex) continue;
		const subdirs = fs.readdirSync(postDir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
		for (const assetId of subdirs) {
			const assetDir = path.join(postDir, assetId);
			const key = slug + '/' + assetId;
			addAsset(map, key, assetDir, assetId, publicBase, slug);
		}
	}
	return map;
}

/** @returns {import('vite').Plugin} */
export default function imageAssetsPlugin() {
	let root = process.cwd();
	/** @type {Record<string, { url: string; alt: string; caption?: string; attribution?: string }>} */
	let assetsMap = {};

	return {
		name: 'vite-plugin-image-assets',
		/** @type {'pre'} */
		enforce: 'pre',
		configResolved(config) {
			root = config.root;
		},
		buildStart() {
			assetsMap = discoverAndCopy(root);
		},
		resolveId(id) {
			if (id === VIRTUAL_ID) return VIRTUAL_ID_RESOLVED;
			return null;
		},
		load(id) {
			if (id !== VIRTUAL_ID_RESOLVED) return null;
			return `export const imageAssets = ${JSON.stringify(assetsMap)};\nexport default imageAssets;`;
		},
		configureServer() {
			assetsMap = discoverAndCopy(root);
		},
	};
}
