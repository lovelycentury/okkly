import type * as okklyIcons from "@okkly/icons";

/**
 * Every icon export in `@okkly/icons`, inferred from the package itself —
 * `"iconStar" | "iconSearch" | …`. Adding an SVG to `@okkly/icons` and running
 * its `generate` script widens this union with no edit here.
 */
export type IconName = keyof typeof okklyIcons;

/** Raw SVG markup, as every `@okkly/icons` export is. */
export type IconSource = string;

export type IconSize = "small" | "medium" | "large" | "inherit";
export type IconColor =
  | "inherit"
  | "primary"
  | "dante"
  | "indigo"
  | "violet"
  | "ember"
  | "ice"
  | "success"
  | "warning"
  | "danger"
  | "muted";

/**
 * Props follow MUI's SvgIcon API (https://mui.com/material-ui/api/svg-icon/)
 * where the shapes line up, mirroring `@okkly/react`'s `<Icon>` name-for-name:
 * `color`/`fontSize`/`titleAccess` match. Deliberate gaps carried over from
 * React: the glyph arrives as SVG markup from `@okkly/icons` rather than as
 * children, so there is no `viewBox`/`inheritViewBox`/`htmlColor` — the
 * assets already declare their own viewBox and paint with `currentColor`,
 * which `color` drives.
 *
 * Vue-forced difference: React encodes "exactly one of `name`/`icon`" as a
 * discriminated union TypeScript enforces at the call site. `defineProps`
 * can't express that XOR, so both stay plain optional props here — give
 * neither and the icon renders empty.
 */
export interface IconProps {
  /**
   * Icon to render, picked by name with full autocomplete.
   *
   * @default undefined
   */
  name?: IconName;
  /**
   * Pre-imported SVG markup — `import { iconStar } from "@okkly/icons"`. Use
   * this for icons outside the package, or to keep a bundle lean.
   *
   * Injected as HTML, so it must be markup you control at build time. Never
   * pass a string that came from a user, an API, or a URL.
   *
   * @default undefined
   */
  icon?: IconSource;
  /**
   * Tint. `"inherit"` (the default) takes the surrounding text colour, which
   * is what you want inside a Button or a Typography block.
   *
   * @default "inherit"
   */
  color?: IconColor;
  /**
   * Glyph box. `"inherit"` tracks the surrounding font size (`1em`) instead
   * of the fixed scale.
   *
   * @default "medium"
   */
  fontSize?: IconSize;
  /**
   * Text alternative. Provide it when the icon is the only carrier of
   * meaning; omit it and the icon is hidden from assistive tech as
   * decoration.
   *
   * @default undefined
   */
  titleAccess?: string;
}
