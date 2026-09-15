/** The viewport breakpoints, narrowest first — `$breakpoints` in breakpoints.scss. */
export type BoxBreakpoint = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * The container breakpoints an `@`-key names, narrowest first —
 * `$container-breakpoints` in breakpoints.scss. Smaller than the viewport
 * scale: a container is a region of the page, not the page.
 */
export type BoxContainerBreakpoint = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * A value, or one value per breakpoint. `base` applies at every width; a
 * viewport breakpoint (`2xs` 320px, `xs` 577px, `sm` 769px, `md` 993px, `lg`
 * 1441px, `xl` 1921px) from that window width up; a container breakpoint
 * (`@xs` 320px, `@sm` 480px, `@md` 640px, `@lg` 800px, `@xl` 1024px) from that
 * width of the nearest `container` Box up — never the Box's own. Container
 * values win over viewport values, and wider breakpoints over narrower ones.
 *
 * Spelled out key by key rather than mapped over the breakpoint names: Vue's
 * compiler reads this type to generate a Box's runtime props, and it resolves
 * plain object types only.
 */
export type BoxResponsive<T> =
  | T
  | {
      base?: T;
      "2xs"?: T;
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      "@xs"?: T;
      "@sm"?: T;
      "@md"?: T;
      "@lg"?: T;
      "@xl"?: T;
    };

/** A step on the 4px spacing scale (`2` → 8px, `-1` → -4px), or any CSS length. */
export type BoxSpacing = number | string;

/** A fraction up to `1` is a percentage (`0.5` → 50%), a larger number is pixels, a string is CSS. */
export type BoxSize = number | string;

/** The color tokens a Box can name, as `"<group>.<name>"` — `--okkly-<group>-<name>` in colors.css. */
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

// The keyword props spell their common values out rather than borrowing
// `csstype`'s: the framework packages do not depend on it, so their emitted
// declarations could not name its types.

/** CSS `display`: a common value, or any other. */
export type BoxDisplay =
  | "block"
  | "inline"
  | "inline-block"
  | "flex"
  | "inline-flex"
  | "grid"
  | "inline-grid"
  | "contents"
  | "none"
  | (string & {});

/** CSS `flex-direction`. */
export type BoxFlexDirection = "row" | "row-reverse" | "column" | "column-reverse";

/** CSS `flex-wrap`. */
export type BoxFlexWrap = "nowrap" | "wrap" | "wrap-reverse";

/** CSS `align-items` / `align-self`: a common value, or any other. */
export type BoxAlign =
  | "normal"
  | "stretch"
  | "center"
  | "flex-start"
  | "flex-end"
  | "start"
  | "end"
  | "baseline"
  | (string & {});

/** CSS `justify-content`: a common value, or any other. */
export type BoxJustify =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly"
  | "start"
  | "end"
  | "stretch"
  | (string & {});

/**
 * The MUI-style system props every framework's Box takes, name-for-name with
 * MUI's system properties (https://mui.com/system/properties/) where they
 * overlap. Each resolves into a class plus the CSS variable it reads.
 */
export type BoxSystemProps = {
  /**
   * Margin on every side. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   */
  m?: BoxResponsive<BoxSpacing>;
  /**
   * Margin on the inline axis — left and right, mirrored in RTL.
   *
   * @default undefined
   */
  mx?: BoxResponsive<BoxSpacing>;
  /**
   * Margin on the block axis — top and bottom.
   *
   * @default undefined
   */
  my?: BoxResponsive<BoxSpacing>;
  /**
   * Top margin.
   *
   * @default undefined
   */
  mt?: BoxResponsive<BoxSpacing>;
  /**
   * Margin at the inline end — right in LTR.
   *
   * @default undefined
   */
  mr?: BoxResponsive<BoxSpacing>;
  /**
   * Bottom margin.
   *
   * @default undefined
   */
  mb?: BoxResponsive<BoxSpacing>;
  /**
   * Margin at the inline start — left in LTR.
   *
   * @default undefined
   */
  ml?: BoxResponsive<BoxSpacing>;
  /**
   * Padding on every side. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   */
  p?: BoxResponsive<BoxSpacing>;
  /**
   * Padding on the inline axis — left and right, mirrored in RTL.
   *
   * @default undefined
   */
  px?: BoxResponsive<BoxSpacing>;
  /**
   * Padding on the block axis — top and bottom.
   *
   * @default undefined
   */
  py?: BoxResponsive<BoxSpacing>;
  /**
   * Top padding.
   *
   * @default undefined
   */
  pt?: BoxResponsive<BoxSpacing>;
  /**
   * Padding at the inline end — right in LTR.
   *
   * @default undefined
   */
  pr?: BoxResponsive<BoxSpacing>;
  /**
   * Bottom padding.
   *
   * @default undefined
   */
  pb?: BoxResponsive<BoxSpacing>;
  /**
   * Padding at the inline start — left in LTR.
   *
   * @default undefined
   */
  pl?: BoxResponsive<BoxSpacing>;
  /**
   * Gap between flex or grid children, on both axes.
   *
   * @default undefined
   */
  gap?: BoxResponsive<BoxSpacing>;
  /**
   * Gap between rows.
   *
   * @default undefined
   */
  rowGap?: BoxResponsive<BoxSpacing>;
  /**
   * Gap between columns.
   *
   * @default undefined
   */
  columnGap?: BoxResponsive<BoxSpacing>;
  /**
   * CSS `display`.
   *
   * @default undefined
   */
  display?: BoxResponsive<BoxDisplay>;
  /**
   * CSS `flex-direction`.
   *
   * @default undefined
   */
  flexDirection?: BoxResponsive<BoxFlexDirection>;
  /**
   * CSS `flex-wrap`.
   *
   * @default undefined
   */
  flexWrap?: BoxResponsive<BoxFlexWrap>;
  /**
   * CSS `align-items`.
   *
   * @default undefined
   */
  alignItems?: BoxResponsive<BoxAlign>;
  /**
   * CSS `justify-content`.
   *
   * @default undefined
   */
  justifyContent?: BoxResponsive<BoxJustify>;
  /**
   * CSS `align-self`.
   *
   * @default undefined
   */
  alignSelf?: BoxResponsive<BoxAlign>;
  /**
   * CSS `flex-grow`.
   *
   * @default undefined
   */
  flexGrow?: BoxResponsive<number | string>;
  /**
   * CSS `flex-shrink`.
   *
   * @default undefined
   */
  flexShrink?: BoxResponsive<number | string>;
  /**
   * CSS `flex-basis`. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   */
  flexBasis?: BoxResponsive<BoxSize>;
  /**
   * Width. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   */
  width?: BoxResponsive<BoxSize>;
  /**
   * Height. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   */
  height?: BoxResponsive<BoxSize>;
  /**
   * Minimum width.
   *
   * @default undefined
   */
  minWidth?: BoxResponsive<BoxSize>;
  /**
   * Maximum width.
   *
   * @default undefined
   */
  maxWidth?: BoxResponsive<BoxSize>;
  /**
   * Minimum height.
   *
   * @default undefined
   */
  minHeight?: BoxResponsive<BoxSize>;
  /**
   * Maximum height.
   *
   * @default undefined
   */
  maxHeight?: BoxResponsive<BoxSize>;
  /**
   * Background color — a token path (`"bg.surface-raised"`) or any CSS color.
   *
   * @default undefined
   */
  bgcolor?: BoxResponsive<BoxColor>;
  /**
   * Text color — a token path (`"text.secondary"`) or any CSS color.
   *
   * @default undefined
   */
  color?: BoxResponsive<BoxColor>;
  /**
   * Border on every side. A number is its width in pixels, drawn solid in the
   * default border color; a string is the CSS `border` shorthand.
   *
   * @default undefined
   */
  border?: BoxResponsive<number | string>;
  /**
   * Border color — a token path (`"border.strong"`) or any CSS color.
   *
   * @default undefined
   */
  borderColor?: BoxResponsive<BoxColor>;
  /**
   * Corner radius. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   */
  borderRadius?: BoxResponsive<BoxSpacing>;
};

export type BoxSystemPropName = keyof BoxSystemProps;

/** How a system prop's value turns into CSS. */
export type BoxValueKind = "spacing" | "size" | "color" | "border" | "radius" | "keyword";

/** What `resolveBoxSystemProps` hands back. */
export interface ResolvedBoxSystemProps<P> {
  /**
   * An `okkly-box--<name><suffix>` class for every value that was set, plus
   * `okkly-box--container` for a container.
   */
  className: string;
  /** The `--okkly-box-<name><suffix>` variables those classes read. */
  style: Record<string, string>;
  /** Everything that is not a system prop — what the element itself receives. */
  rest: Omit<P, BoxSystemPropName | "container">;
}
