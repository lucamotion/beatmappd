"use client";
import { default as NextImage } from "next/image";
import { useState } from "react";

export function Image({
  src,
  fallback,
  height,
  width,
  alt,
  className,
  objectFit,
  fill,
}: {
  src: string;
  fallback?: string;
  height?: number;
  width?: number;
  alt: string;
  className?: string;
  objectFit?: "cover";
  fill?: boolean;
}) {
  const [imageSrc, setImageSrc] = useState(src);
  return (
    <div
      style={
        objectFit
          ? {
              position: "relative",
              width: `${width}px`,
              height: `${height}px`,
              minWidth: `${width}px`,
              minHeight: `${height}px`,
            }
          : undefined
      }
    >
      <NextImage
        src={imageSrc}
        height={fill ? undefined : height}
        width={fill ? undefined : width}
        alt={alt}
        onError={() => (fallback ? setImageSrc(fallback) : undefined)}
        className={className}
        style={{ objectFit: objectFit }}
        fill={fill}
      />
    </div>
  );
}
