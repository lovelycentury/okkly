import type { ReactNode } from "react";

export type SeverityIconSeverity =
  "success" | "info" | "warning" | "danger" | "primary" | "neutral";
export type SeverityIconSize = "small" | "medium" | "large";
export type SeverityIconShape = "circle" | "rounded";

/**
 * Small tinted status badge for alerts, dialogs, and list rows. No direct MUI
 * equivalent — closest is a styled `Avatar` or bare icon; this component
 * bundles tone, shape, size, and default severity glyphs.
 */
export interface SeverityIconProps {
  /**
   * Semantic tone — drives background tint and icon colour.
   *
   * @default "info"
   * @type {SeverityIconSeverity}
   */
  severity?: SeverityIconSeverity;
  /**
   * Badge dimensions.
   *
   * @default "medium"
   * @type {SeverityIconSize}
   */
  size?: SeverityIconSize;
  /**
   * Circle or rounded square.
   *
   * @default "circle"
   * @type {SeverityIconShape}
   */
  shape?: SeverityIconShape;
  /**
   * Override the built-in severity glyph.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Text equivalent of the tone, e.g. `"Failed"`. Omit when the surrounding
   * content already says it — the icon is then hidden from assistive tech.
   *
   * @default undefined
   * @type {string}
   */
  label?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
