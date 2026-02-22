/// <reference path="../.astro/types.d.ts" />

declare module "virtual:image-assets" {
  type ImageSource = {
    type: string;
    srcSet: Array<{ url: string; w: number }>;
    sizes: string;
  };
  type ImageAsset =
    | { url: string; alt: string; caption?: string; attribution?: string }
    | {
        sources: ImageSource[];
        fallbackUrl: string;
        alt: string;
        caption?: string;
        attribution?: string;
      };
  const imageAssets: Record<string, ImageAsset>;
  export { imageAssets };
  export default imageAssets;
}
