import { getImage } from "astro:assets";

export async function lightboxSrc(src: ImageMetadata, width = 1400) {
  const image = await getImage({ src, width, format: "webp", quality: 90 });
  return image.src;
}
