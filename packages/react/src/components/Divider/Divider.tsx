"use client";

import { forwardRef, type Ref } from "react";
import "@okkly/design-system/components/Divider/Divider.scss";
import type { DividerProps } from "./Divider.types";

export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    orientation = "horizontal",
    flexItem = false,
    children,
    textAlign = "center",
    variant = "fullWidth",
    className,
    ...rest
  },
  forwardedRef,
) {
  const hasLabel = Boolean(children) && orientation === "horizontal";

  const classes = [
    "okkly-component",
    "okkly-divider",
    orientation === "vertical" ? "okkly-divider--vertical" : "okkly-divider--horizontal",
    variant === "inset" && "okkly-divider--inset",
    variant === "middle" && "okkly-divider--middle",
    hasLabel && "okkly-divider--with-label",
    flexItem && "okkly-divider--flex-item",
    textAlign !== "center" && `okkly-divider--align-${textAlign}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (orientation === "vertical") {
    return <hr ref={forwardedRef as Ref<HTMLHRElement>} className={classes} {...rest} />;
  }

  if (hasLabel) {
    return (
      <div ref={forwardedRef as Ref<HTMLDivElement>} className={classes} role="separator" {...rest}>
        <span className="okkly-divider__label">{children}</span>
      </div>
    );
  }

  return <hr ref={forwardedRef as Ref<HTMLHRElement>} className={classes} {...rest} />;
});
