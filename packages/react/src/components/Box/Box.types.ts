import type { ComponentPropsWithoutRef, CSSProperties, ElementType } from "react";
import type { BoxSystemProps } from "@okkly/shared";

// The system props and the values they take are the contract every
// framework's Box shares, so they live in @okkly/shared; this package adds
// only what is React's own.
export type {
  BoxAlign,
  BoxColor,
  BoxColorToken,
  BoxDisplay,
  BoxFlexDirection,
  BoxFlexWrap,
  BoxJustify,
  BoxResponsive,
  BoxSize,
  BoxSpacing,
  BoxSystemProps,
} from "@okkly/shared";

/**
 * Props follow MUI's Box (https://mui.com/material-ui/react-box/) and its system
 * properties (https://mui.com/system/properties/) name-for-name where they
 * overlap — the system props themselves come from `@okkly/shared`. Deliberate
 * gaps: no `sx` (there is no CSS-in-JS here — use `className`/`style`); the
 * polymorphic prop is `as`, not `component`, as on `Typography`; the set covers
 * spacing, flex layout, sizing, color and border rather than every CSS
 * property; numeric spacing steps on this design system's 4px scale rather
 * than MUI's 8px; `ml`/`mr`/`pl`/`pr` are logical (inline start/end), so they
 * mirror in RTL; a responsive object takes a `base` key, because this design
 * system's `xs` starts at 577px rather than 0; and colors name design tokens
 * (`"bg.surface"`) rather than palette paths (`"primary.main"`). Beyond MUI, a
 * responsive object also takes container-query keys (`"@md"`), which answer to
 * the nearest `container` Box rather than the viewport.
 */
export type BoxOwnProps = BoxSystemProps & {
  /**
   * Makes the Box a query container: its descendants' `@`-keys (`"@md"`)
   * answer to its width. Only its inline size is measured, so its width stops
   * following its content — avoid it on `inline-flex`/`inline-block` Boxes.
   *
   * @default false
   * @type {boolean}
   */
  container?: boolean;
  /**
   * Class Name, merged after the system-prop classes.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Inline style, merged after the system-prop variables — so it can override them.
   *
   * @default undefined
   * @type {CSSProperties}
   */
  style?: CSSProperties;
};

/**
 * `as` swaps the rendered element and re-infers the props with it: `as="a"`
 * accepts `href`, `as="section"` renders a landmark. Every system prop is
 * consumed by Box itself and never reaches the element as an attribute.
 */
export type BoxProps<E extends ElementType = "div"> = BoxOwnProps & {
  /**
   * Element to render.
   *
   * @default "div"
   * @type {ElementType}
   */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof BoxOwnProps | "as">;
