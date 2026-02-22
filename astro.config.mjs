// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import imageAssetsPlugin from "./vite-plugin-image-assets.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    syntaxHighlight: false,
  },
  vite: {
    plugins: [imageAssetsPlugin(), tailwindcss()],
  },
});
