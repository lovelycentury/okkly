/**
 * Box's system props — the MUI-style shorthands (`p`, `mx`, `display`,
 * `bgcolor`…) — resolved into the classes and CSS variables that
 * `@okkly/design-system`'s Box stylesheet reads. Framework-agnostic on purpose:
 * every framework's Box runs its props through `resolveBoxSystemProps` and
 * puts the result on its root element, so all of them render the same DOM.
 */

/** The breakpoints a responsive value accepts, narrowest first — `$breakpoints` in breakpoints.scss. */
export const BOX_BREAKPOINTS = ["2xs", "xs", "sm", "md", "lg", "xl"] as const;

export type BoxBreakpoint = (typeof BOX_BREAKPOINTS)[number];

/**
 * The container breakpoints an `@`-key names, narrowest first —
 * `$container-breakpoints` in breakpoints.scss. Smaller than the viewport
 * scale: a container is a region of the page, not the page.
 */
export const BOX_CONTAINER_BREAKPOINTS = ["xs", "sm", "md", "lg", "xl"] as const;

export type BoxContainerBreakpoint = (typeof BOX_CONTAINER_BREAKPOINTS)[number];

/**
 * A value, or one value per breakpoint. `base` applies at every width; a
 * viewport breakpoint (`md`) from that window width up; a container breakpoint
 * (`@md`) from that width of the nearest `container` Box up. Container values
 * win over viewport values, and wider breakpoints over narrower ones.
 */
export type BoxResponsiveValue<T> =
  | T
  | ({ base?: T } & { [B in BoxBreakpoint]?: T } & {
      [B in BoxContainerBreakpoint as `@${B}`]?: T;
    });

/** How a prop's value turns into CSS. */
type BoxValueKind = "spacing" | "size" | "color" | "border" | "radius" | "keyword";

/**
 * Every system prop and how its value is read. Kept in step with `$props` in
 * the Box stylesheet, which names each class after the kebab-cased prop.
 */
export const BOX_SYSTEM_PROPS = {
  m: "spacing",
  mx: "spacing",
  my: "spacing",
  mt: "spacing",
  mr: "spacing",
  mb: "spacing",
  ml: "spacing",
  p: "spacing",
  px: "spacing",
  py: "spacing",
  pt: "spacing",
  pr: "spacing",
  pb: "spacing",
  pl: "spacing",
  gap: "spacing",
  rowGap: "spacing",
  columnGap: "spacing",
  display: "keyword",
  flexDirection: "keyword",
  flexWrap: "keyword",
  alignItems: "keyword",
  justifyContent: "keyword",
  alignSelf: "keyword",
  flexGrow: "keyword",
  flexShrink: "keyword",
  flexBasis: "size",
  width: "size",
  height: "size",
  minWidth: "size",
  maxWidth: "size",
  minHeight: "size",
  maxHeight: "size",
  bgcolor: "color",
  color: "color",
  border: "border",
  borderColor: "color",
  borderRadius: "radius",
} as const satisfies Record<string, BoxValueKind>;

export type BoxSystemPropName = keyof typeof BOX_SYSTEM_PROPS;

/** The loosest shape a framework's Box props can have; each framework narrows it. */
export type BoxSystemProps = {
  [K in BoxSystemPropName]?: BoxResponsiveValue<string | number | undefined>;
} & {
  /** Makes the Box a query container, which its descendants' `@`-keys answer to. */
  container?: boolean;
};

/** Token groups a color can name as `"<group>.<name>"`: `"bg.surface"` → `var(--okkly-bg-surface)`. */
const COLOR_TOKEN_GROUPS = new Set(["accent", "text", "bg", "border", "feedback", "glass"]);

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** A step on the 4px scale, kept as a `calc` so a subtree can rescale it through `--okkly-space-unit`. */
const onSpacingScale = (step: number) => `calc(${step} * var(--okkly-space-unit))`;

function toCss(kind: BoxValueKind, value: string | number): string {
  if (typeof value === "string") {
    const token = kind === "color" && /^([a-z]+)\.([a-z0-9-]+)$/.exec(value);
    return token && COLOR_TOKEN_GROUPS.has(token[1])
      ? `var(--okkly-${token[1]}-${token[2]})`
      : value;
  }
  switch (kind) {
    case "spacing":
    case "radius":
      return onSpacingScale(value);
    // As in MUI: a fraction of one is a percentage, anything larger is pixels.
    case "size":
      return value > 0 && value <= 1 ? `${value * 100}%` : `${value}px`;
    case "border":
      return `${value}px solid var(--okkly-border-default)`;
    default:
      return String(value);
  }
}

/**
 * The class and variable suffix a responsive key maps to — `""` for `base`,
 * `-md` for a viewport breakpoint, `-cq-md` for `@md` — or `undefined` for a
 * key the stylesheet has no rules for.
 */
function breakpointSuffix(key: string): string | undefined {
  if (key === "base") return "";
  if (key.startsWith("@")) {
    const name = key.slice(1);
    return (BOX_CONTAINER_BREAKPOINTS as readonly string[]).includes(name)
      ? `-cq-${name}`
      : undefined;
  }
  return (BOX_BREAKPOINTS as readonly string[]).includes(key) ? `-${key}` : undefined;
}

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

/**
 * Splits a Box's props into the system props — resolved into classes and CSS
 * variables — and the rest, which the caller forwards to the element.
 *
 * @example
 * resolveBoxSystemProps({ p: 2, display: { base: "block", md: "flex" }, id: "x" });
 * // {
 * //   className: "okkly-box--p okkly-box--display okkly-box--display-md",
 * //   style: {
 * //     "--okkly-box-p": "calc(2 * var(--okkly-space-unit))",
 * //     "--okkly-box-display": "block",
 * //     "--okkly-box-display-md": "flex",
 * //   },
 * //   rest: { id: "x" },
 * // }
 */
export function resolveBoxSystemProps<P extends BoxSystemProps>(
  props: P,
): ResolvedBoxSystemProps<P> {
  const classes: string[] = [];
  const style: Record<string, string> = {};
  const rest: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key === "container") {
      if (value) classes.push("okkly-box--container");
      continue;
    }
    if (!Object.hasOwn(BOX_SYSTEM_PROPS, key)) {
      rest[key] = value;
      continue;
    }
    const kind = BOX_SYSTEM_PROPS[key as BoxSystemPropName];
    const name = kebab(key);
    const values: [string, unknown][] =
      value !== null && typeof value === "object" ? Object.entries(value) : [["base", value]];

    for (const [breakpoint, breakpointValue] of values) {
      if (breakpointValue == null) continue;
      const suffix = breakpointSuffix(breakpoint);
      // An unknown key would name a class the stylesheet never defines.
      if (suffix === undefined) continue;
      classes.push(`okkly-box--${name}${suffix}`);
      style[`--okkly-box-${name}${suffix}`] = toCss(kind, breakpointValue as string | number);
    }
  }

  return {
    className: classes.join(" "),
    style,
    rest: rest as Omit<P, BoxSystemPropName | "container">,
  };
}
