import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { Snippet } from "svelte";
import type { BoxSystemProps } from "@okkly/shared";

// The system props and the values they take are the contract every
// framework's Box shares, so they live in @okkly/shared; this package adds
// only what is Svelte's own.
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

/** The HTML elements a Box can render as. */
export type BoxElement = keyof HTMLElementTagNameMap;

type SharedProps = BoxSystemProps & {
  /**
   * Element to render.
   *
   * @default "div"
   */
  as?: BoxElement;
  /**
   * Makes the Box a query container: its descendants' `@`-keys (`"@md"`)
   * answer to its width. Only its inline size is measured, so its width stops
   * following its content — avoid it on `inline-flex`/`inline-block` Boxes.
   *
   * @default false
   */
  container?: boolean;
  /**
   * Content of the box.
   *
   * @default undefined
   */
  children?: Snippet;
};

/**
 * Props mirror `@okkly/react`'s `<Box>` name-for-name — the system props
 * themselves come from `@okkly/shared` — which in turn follows MUI's Box and
 * its system properties. Svelte-forced differences: `as` takes a tag name
 * only — it renders through `<svelte:element>`, which cannot render a
 * component; the content is the `children` snippet; and a consumer's `class`
 * and `style` merge after the system-prop classes and variables, while every
 * other attribute spreads onto the element.
 *
 * The attributes are the common HTML ones plus those of `<a>` and `<button>`
 * (`href`, `type`…), the elements `as` most often renders — not inferred per
 * element, as React's are: a generic over every tag name is a union too large
 * for TypeScript to check a spread against.
 */
export type BoxProps = SharedProps &
  Omit<HTMLAnchorAttributes & HTMLButtonAttributes, keyof SharedProps>;
