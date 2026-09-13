"use client";

import { forwardRef, useState } from "react";
import "@okkly/design-system/components/Avatar/Avatar.scss";
import type { AvatarProps } from "./Avatar.types";

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { src, alt, initials, status, shape = "circle", size = "md", color = "mint", className, ...rest },
  ref,
) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!src && !imageFailed;

  const classes = [
    "okkly-component",
    "okkly-avatar",
    shape === "rounded" && "okkly-avatar--rounded",
    size !== "md" && `okkly-avatar--${size}`,
    !showImage && color !== "mint" && `okkly-avatar--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} role={alt ? "img" : undefined} aria-label={alt} {...rest}>
      {showImage ? (
        <img
          className="okkly-avatar__image"
          src={src}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="okkly-avatar__initials" aria-hidden="true">
          {(initials ?? "").slice(0, 2)}
        </span>
      )}
      {status && (
        <span
          className={[
            "okkly-avatar__status",
            status === "offline" && "okkly-avatar__status--offline",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      )}
    </div>
  );
});
