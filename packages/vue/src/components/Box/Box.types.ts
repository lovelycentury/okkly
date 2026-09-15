import type { Component } from "vue";
import type { BoxSystemProps } from "@okkly/shared";

// The system props and the values they take are the contract every
// framework's Box shares, so they live in @okkly/shared; this package adds
// only what is Vue's own.
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
 * Props mirror `@okkly/react`'s `<Box>` name-for-name — the system props
 * themselves come from `@okkly/shared` — which in turn follows MUI's Box and
 * its system properties. Vue-forced differences: `as` takes a tag name or a
 * component; the content is the default slot; and `class`, `style` and every
 * other attribute fall through to the rendered element, where Vue merges a
 * consumer's `class`/`style` after the system-prop classes and variables —
 * the role `className`/`style` play in React.
 */
export interface BoxProps extends BoxSystemProps {
  /**
   * Element to render — a tag name or a component.
   *
   * @default "div"
   */
  as?: string | Component;
  /**
   * Makes the Box a query container: its descendants' `@`-keys (`"@md"`)
   * answer to its width. Only its inline size is measured, so its width stops
   * following its content — avoid it on `inline-flex`/`inline-block` Boxes.
   *
   * @default false
   */
  container?: boolean;
}
