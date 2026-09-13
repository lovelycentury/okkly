"use client";

import { useState } from "react";
import "@okkly/design-system/components/Photo/Photo.scss";
import { Skeleton } from "../Skeleton/Skeleton";
import type { PhotoProps } from "./Photo.types";

const PhotoSilhouette = () => (
  <svg viewBox="0 0 210 280" className="okkly-photo__silhouette" aria-hidden="true">
    <circle cx="105" cy="80.5" r="35.7" fill="currentColor" />
    <rect x="34.7" y="122.2" width="138.6" height="140" rx="69.3" fill="currentColor" />
  </svg>
);

export function Photo({
  image,
  alt,
  variant = "plain",
  scrim = false,
  transparent = false,
  size = "md",
  caption,
  radius = "xl",
  loading = false,
  fallback,
  className,
  ...rest
}: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const isCutout = variant === "cutout" || transparent;
  // A caption is white text sitting on an unknown photo, so it brings its own
  // scrim — otherwise it is simply dropped, which is how it used to behave.
  const showScrim = (scrim || variant === "scrim" || variant === "noir" || !!caption) && !isCutout;
  const showNoir = variant === "noir" && !isCutout;
  // Gated on `loading`: without it the image was held at `opacity: 0` even when
  // the caller had opted out of the placeholder, so nothing at all was drawn
  // until `onLoad` fired.
  const showSkeleton = loading && !!image && !loaded && !failed;
  const showImage = !!image && !failed;
  const showPlaceholder = !image || failed;

  const classes = [
    "okkly-component",
    "okkly-photo",
    `okkly-photo--${variant}`,
    `okkly-photo--size-${size}`,
    !isCutout && radius !== "xl" && `okkly-photo--radius-${radius}`,
    isCutout && "okkly-photo--transparent",
    showScrim && "okkly-photo--scrim",
    showNoir && "okkly-photo--noir",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      <div className="okkly-photo__frame">
        {showSkeleton && (
          <Skeleton variant="rectangular" animation="pulse" className="okkly-photo__skeleton" />
        )}
        {showImage && (
          <img
            className="okkly-photo__image"
            src={image}
            alt={alt}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={showSkeleton ? { opacity: 0, position: "absolute" } : undefined}
          />
        )}
        {showPlaceholder && (
          <div className="okkly-photo__placeholder" role="img" aria-label={alt}>
            {fallback ?? <PhotoSilhouette />}
          </div>
        )}
        {showScrim && <div className="okkly-photo__scrim-layer" />}
        {showNoir && (
          <>
            <div className="okkly-photo__noir-top" />
            <div className="okkly-photo__noir-left" />
            <div className="okkly-photo__noir-right" />
          </>
        )}
        {caption && showScrim && <p className="okkly-photo__caption">{caption}</p>}
      </div>
    </div>
  );
}
