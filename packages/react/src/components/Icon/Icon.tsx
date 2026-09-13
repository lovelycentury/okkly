"use client";

import { forwardRef } from "react";
import "@okkly/design-system/components/Icon/Icon.scss";
import * as okklyIcons from "@okkly/icons";
import type { IconName, IconSource, IconProps } from "./Icon.types";

/** Name → markup, so `name` can be resolved at runtime. */
const ICONS = okklyIcons as Record<IconName, IconSource>;

/** Sorted list of every available icon name — handy for pickers and stories. */
export const ICON_NAMES = Object.keys(ICONS).sort() as IconName[];

export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { name, icon, color = "inherit", fontSize = "medium", titleAccess, className, ...rest },
  ref,
) {
  const markup = icon ?? (name ? ICONS[name] : undefined);

  const classes = [
    "okkly-component",
    "okkly-icon",
    fontSize !== "medium" && `okkly-icon--${fontSize}`,
    color !== "inherit" && `okkly-icon--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // The markup is first-party: it comes from @okkly/icons at build time, or
  // from an `icon` prop the caller imported the same way. It is never user input.
  return (
    <span
      {...rest}
      ref={ref}
      className={classes}
      role={titleAccess ? "img" : undefined}
      aria-label={titleAccess}
      aria-hidden={titleAccess ? undefined : true}
      dangerouslySetInnerHTML={{ __html: markup ?? "" }}
    />
  );
});
