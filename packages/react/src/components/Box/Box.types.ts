import type { ComponentPropsWithoutRef, CSSProperties, ElementType } from "react";
import type { BoxResponsiveValue } from "@okkly/helpers";

/**
 * A value, or one value per breakpoint. `base` applies at every width; a
 * viewport breakpoint (`2xs` 320px, `xs` 577px, `sm` 769px, `md` 993px, `lg`
 * 1441px, `xl` 1921px) from that window width up; a container breakpoint
 * (`@xs` 320px, `@sm` 480px, `@md` 640px, `@lg` 800px, `@xl` 1024px) from that
 * width of the nearest `container` Box up — never the Box's own. Container
 * values win over viewport values, and wider breakpoints over narrower ones.
 *
 * The props below spell it as `BoxResponsiveValue`, the shared definition in
 * `@okkly/helpers`: Storybook's docgen cannot follow that import, so the
 * Controls table keeps the readable name (`BoxResponsiveValue<BoxSpacing>`)
 * instead of expanding a local generic into its body with `T` unfilled.
 */
export type BoxResponsive<T> = BoxResponsiveValue<T>;

/** A step on the 4px spacing scale (`2` → 8px, `-1` → -4px), or any CSS length. */
export type BoxSpacing = number | string;

/** A fraction up to `1` is a percentage (`0.5` → 50%), a larger number is pixels, a string is CSS. */
export type BoxSize = number | string;

/** The color tokens a Box can name, as `"<group>.<name>"`. */
export type BoxColorToken =
  | "accent.primary"
  | "accent.secondary"
  | "accent.dante"
  | "accent.violet"
  | "accent.ember"
  | "accent.ice"
  | "accent.contrast"
  | "text.primary"
  | "text.secondary"
  | "text.muted"
  | "bg.canvas"
  | "bg.inset"
  | "bg.surface"
  | "bg.surface-raised"
  | "border.subtle"
  | "border.default"
  | "border.strong"
  | "feedback.success"
  | "feedback.warning"
  | "feedback.danger"
  | "glass.fill"
  | "glass.fill-strong"
  | "glass.border";

/** A color token path, or any CSS color. */
export type BoxColor = BoxColorToken | (string & {});

/**
 * Props follow MUI's Box (https://mui.com/material-ui/react-box/) and its system
 * properties (https://mui.com/system/properties/) name-for-name where they
 * overlap. Deliberate gaps: no `sx` (there is no CSS-in-JS here — use
 * `className`/`style`); the polymorphic prop is `as`, not `component`, as on
 * `Typography`; the set covers spacing, flex layout, sizing, color and border
 * rather than every CSS property; numeric spacing steps on this design system's
 * 4px scale rather than MUI's 8px; `ml`/`mr`/`pl`/`pr` are logical (inline
 * start/end), so they mirror in RTL; a responsive object takes a `base` key,
 * because this design system's `xs` starts at 577px rather than 0; and colors
 * name design tokens (`"bg.surface"`) rather than palette paths
 * (`"primary.main"`). Beyond MUI, a responsive object also takes
 * container-query keys (`"@md"`), which answer to the nearest `container` Box
 * rather than the viewport — see `BoxResponsive`.
 */
export interface BoxSystemProps {
  /**
   * Margin on every side. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  m?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Margin on the inline axis — left and right, mirrored in RTL.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  mx?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Margin on the block axis — top and bottom.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  my?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Top margin.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  mt?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Margin at the inline end — right in LTR.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  mr?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Bottom margin.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  mb?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Margin at the inline start — left in LTR.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  ml?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Padding on every side. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  p?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Padding on the inline axis — left and right, mirrored in RTL.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  px?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Padding on the block axis — top and bottom.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  py?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Top padding.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  pt?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Padding at the inline end — right in LTR.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  pr?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Bottom padding.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  pb?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Padding at the inline start — left in LTR.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  pl?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Gap between flex or grid children, on both axes.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  gap?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Gap between rows.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  rowGap?: BoxResponsiveValue<BoxSpacing>;
  /**
   * Gap between columns.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  columnGap?: BoxResponsiveValue<BoxSpacing>;
  /**
   * CSS `display`.
   *
   * @default undefined
   * @type {BoxResponsiveValue<CSSProperties["display"]>}
   */
  display?: BoxResponsiveValue<CSSProperties["display"]>;
  /**
   * CSS `flex-direction`.
   *
   * @default undefined
   * @type {BoxResponsiveValue<CSSProperties["flexDirection"]>}
   */
  flexDirection?: BoxResponsiveValue<CSSProperties["flexDirection"]>;
  /**
   * CSS `flex-wrap`.
   *
   * @default undefined
   * @type {BoxResponsiveValue<CSSProperties["flexWrap"]>}
   */
  flexWrap?: BoxResponsiveValue<CSSProperties["flexWrap"]>;
  /**
   * CSS `align-items`.
   *
   * @default undefined
   * @type {BoxResponsiveValue<CSSProperties["alignItems"]>}
   */
  alignItems?: BoxResponsiveValue<CSSProperties["alignItems"]>;
  /**
   * CSS `justify-content`.
   *
   * @default undefined
   * @type {BoxResponsiveValue<CSSProperties["justifyContent"]>}
   */
  justifyContent?: BoxResponsiveValue<CSSProperties["justifyContent"]>;
  /**
   * CSS `align-self`.
   *
   * @default undefined
   * @type {BoxResponsiveValue<CSSProperties["alignSelf"]>}
   */
  alignSelf?: BoxResponsiveValue<CSSProperties["alignSelf"]>;
  /**
   * CSS `flex-grow`.
   *
   * @default undefined
   * @type {BoxResponsiveValue<CSSProperties["flexGrow"]>}
   */
  flexGrow?: BoxResponsiveValue<CSSProperties["flexGrow"]>;
  /**
   * CSS `flex-shrink`.
   *
   * @default undefined
   * @type {BoxResponsiveValue<CSSProperties["flexShrink"]>}
   */
  flexShrink?: BoxResponsiveValue<CSSProperties["flexShrink"]>;
  /**
   * CSS `flex-basis`. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSize>}
   */
  flexBasis?: BoxResponsiveValue<BoxSize>;
  /**
   * Width. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSize>}
   */
  width?: BoxResponsiveValue<BoxSize>;
  /**
   * Height. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSize>}
   */
  height?: BoxResponsiveValue<BoxSize>;
  /**
   * Minimum width.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSize>}
   */
  minWidth?: BoxResponsiveValue<BoxSize>;
  /**
   * Maximum width.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSize>}
   */
  maxWidth?: BoxResponsiveValue<BoxSize>;
  /**
   * Minimum height.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSize>}
   */
  minHeight?: BoxResponsiveValue<BoxSize>;
  /**
   * Maximum height.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSize>}
   */
  maxHeight?: BoxResponsiveValue<BoxSize>;
  /**
   * Background color — a token path (`"bg.surface-raised"`) or any CSS color.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxColor>}
   */
  bgcolor?: BoxResponsiveValue<BoxColor>;
  /**
   * Text color — a token path (`"text.secondary"`) or any CSS color.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxColor>}
   */
  color?: BoxResponsiveValue<BoxColor>;
  /**
   * Border on every side. A number is its width in pixels, drawn solid in the
   * default border color; a string is the CSS `border` shorthand.
   *
   * @default undefined
   * @type {BoxResponsiveValue<number | string>}
   */
  border?: BoxResponsiveValue<number | string>;
  /**
   * Border color — a token path (`"border.strong"`) or any CSS color.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxColor>}
   */
  borderColor?: BoxResponsiveValue<BoxColor>;
  /**
   * Corner radius. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   * @type {BoxResponsiveValue<BoxSpacing>}
   */
  borderRadius?: BoxResponsiveValue<BoxSpacing>;
}

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
