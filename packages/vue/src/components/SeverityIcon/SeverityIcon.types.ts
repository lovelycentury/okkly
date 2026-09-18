export type SeverityIconSeverity =
  "success" | "info" | "warning" | "danger" | "primary" | "neutral";
export type SeverityIconSize = "small" | "medium" | "large";
export type SeverityIconShape = "circle" | "rounded";

/**
 * Small tinted status badge for alerts, dialogs, and list rows. No direct MUI
 * equivalent — closest is a styled `Avatar` or bare icon; this component
 * bundles tone, shape, size, and default severity glyphs. Props mirror
 * `@okkly/react`'s `<SeverityIcon>` name-for-name: `severity`/`size`/`shape`/
 * `label`.
 *
 * Vue-forced difference: `icon` becomes the default slot rather than a prop,
 * since Vue has no `ReactNode` — fill it to override the built-in severity
 * glyph. `className` is dropped — a consumer's `class` merges onto the root
 * automatically.
 */
export interface SeverityIconProps {
  /**
   * Semantic tone — drives background tint and icon colour.
   *
   * @default "info"
   */
  severity?: SeverityIconSeverity;
  /**
   * Badge dimensions.
   *
   * @default "medium"
   */
  size?: SeverityIconSize;
  /**
   * Circle or rounded square.
   *
   * @default "circle"
   */
  shape?: SeverityIconShape;
  /**
   * Text equivalent of the tone, e.g. `"Failed"`. Omit when the surrounding
   * content already says it — the icon is then hidden from assistive tech.
   *
   * @default undefined
   */
  label?: string;
}
