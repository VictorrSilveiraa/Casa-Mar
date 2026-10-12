import type { CSSProperties } from "react";
import { images, imageSrcSet, imageUrl, imageWidths, type ImageKey } from "@/lib/images";
import styles from "./ResponsiveImage.module.css";

type Props = { image: ImageKey; mobileImage?: ImageKey; sizes: string; className?: string; priority?: boolean };

export function ResponsiveImage({ image, mobileImage, sizes, className = "", priority = false }: Props) {
  const data = images[image];
  const mobile = mobileImage ? images[mobileImage] : null;
  const fallbackWidth = imageWidths(data.width).at(-1)!;
  const style = { "--focus-desktop": data.desktop, "--focus-mobile": data.mobile } as CSSProperties;
  return (
    <picture className={`${styles.picture} ${className}`} style={style}>
      {mobile && <source media="(max-width: 767px)" type="image/avif" srcSet={imageSrcSet(mobileImage!, "avif")} sizes="100vw" />}
      {mobile && <source media="(max-width: 767px)" type="image/webp" srcSet={imageSrcSet(mobileImage!, "webp")} sizes="100vw" />}
      <source type="image/avif" srcSet={imageSrcSet(image, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={imageSrcSet(image, "webp")} sizes={sizes} />
      <img src={imageUrl(image, fallbackWidth, "webp")} alt={data.alt} width={data.width} height={data.height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} className={styles.image} />
    </picture>
  );
}
