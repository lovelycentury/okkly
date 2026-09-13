"use client";

import { forwardRef, type CSSProperties, type ElementType, type Ref } from "react";
import { resolveBoxSystemProps } from "@okkly/helpers";
import "@okkly/design-system/components/Box/Box.scss";
import type { BoxProps } from "./Box.types";

function BoxImpl<E extends ElementType = "div">(
  { as, className, style, ...props }: BoxProps<E>,
  ref: Ref<Element>,
) {
  const Component = (as ?? "div") as ElementType;
  // Every system prop becomes a class plus the CSS variable it reads; the rest
  // is the element's own.
  const system = resolveBoxSystemProps(props);

  const classes = ["okkly-component", "okkly-box", system.className, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      {...system.rest}
      ref={ref}
      className={classes}
      style={{ ...system.style, ...style } as CSSProperties}
    />
  );
}

/**
 * Layout primitive: a `div` — or any element, through `as` — that takes
 * MUI-style system props for spacing, flex layout, sizing, color and border,
 * each of them responsive.
 *
 * `forwardRef` erases generics, so the cast restores the polymorphic signature:
 * without it every call site would collapse to the `div`'s props.
 */
export const Box = forwardRef(BoxImpl) as <E extends ElementType = "div">(
  props: BoxProps<E> & { ref?: Ref<Element> },
) => ReturnType<typeof BoxImpl>;
