/// <reference path="../.astro/types.d.ts" />

declare module "virtual:image-assets" {
  const imageAssets: Record<
    string,
    { url: string; alt: string; caption?: string; attribution?: string }
  >;
  export { imageAssets };
  export default imageAssets;
}
