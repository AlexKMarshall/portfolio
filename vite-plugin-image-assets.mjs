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

const CONTENT_DIR = 'src/content/images';
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

function discoverAndCopy(root) {
	const contentBase = path.join(root, CONTENT_DIR);
	const publicBase = path.join(root, PUBLIC_DIR);
	if (!fs.existsSync(contentBase)) {
		return {};
	}
	const ids = fs.readdirSync(contentBase, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);

	const map = {};
	for (const id of ids) {
		const dir = path.join(contentBase, id);
		const files = fs.readdirSync(dir);
		const meta = loadMeta(dir);
		if (!meta) {
			console.warn(`[image-assets] ${id}: missing meta.yaml, skipping`);
			continue;
		}
		if (!meta.alt || typeof meta.alt !== 'string') {
			console.warn(`[image-assets] ${id}: meta must have "alt" string`);
			continue;
		}
		const imageFile = files.find((f) => IMAGE_EXT.test(f));
		if (!imageFile) {
			console.warn(`[image-assets] ${id}: no image file (.jpg, .png, etc.) found`);
			continue;
		}
		const ext = path.extname(imageFile).toLowerCase();
		const outName = id + ext;
		const srcPath = path.join(dir, imageFile);
		const outPath = path.join(publicBase, outName);
		fs.mkdirSync(publicBase, { recursive: true });
		fs.copyFileSync(srcPath, outPath);
		const url = '/images/' + outName;
		map[id] = {
			url,
			alt: meta.alt,
			caption: meta.caption ?? undefined,
			attribution: meta.attribution ?? undefined,
		};
	}
	return map;
}

export default function imageAssetsPlugin() {
	let root = process.cwd();
	let assetsMap = {};

	return {
		name: 'vite-plugin-image-assets',
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
