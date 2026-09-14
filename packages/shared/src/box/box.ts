/**
 * Box's system props — the MUI-style shorthands (`p`, `mx`, `display`,
 * `bgcolor`…) — resolved into the classes and CSS variables that
 * `@okkly/design-system`'s Box stylesheet reads. Every framework's Box runs its
 * props through `resolveBoxSystemProps` and puts the result on its root
 * element, so all of them render the same DOM.
 */
import type {
  BoxBreakpoint,
  BoxContainerBreakpoint,
  BoxSystemPropName,
  BoxSystemProps,
  BoxValueKind,
  ResolvedBoxSystemProps,
} from "./box.types";

/** The viewport breakpoints, narrowest first — `$breakpoints` in breakpoints.scss. */
export const BOX_BREAKPOINTS = [
  "2xs",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
] as const satisfies readonly BoxBreakpoint[];

/** The container breakpoints, narrowest first — `$container-breakpoints` in breakpoints.scss. */
export const BOX_CONTAINER_BREAKPOINTS = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
] as const satisfies readonly BoxContainerBreakpoint[];

/**
 * Every system prop and how its value is read. Kept in step with `$props` in
 * the Box stylesheet, which names each class after the kebab-cased prop; the
 * `satisfies` clause keeps it in step with `BoxSystemProps`.
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
} as const satisfies Record<BoxSystemPropName, BoxValueKind>;

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
export function resolveBoxSystemProps<P extends BoxSystemProps & { container?: boolean }>(
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
