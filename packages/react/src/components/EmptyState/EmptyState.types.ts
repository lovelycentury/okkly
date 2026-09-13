import type { HTMLAttributes, ReactNode } from "react";
import type { SeverityIconSeverity } from "../SeverityIcon/SeverityIcon.types";

export type EmptyStateSize = "small" | "medium" | "large";
export type EmptyStateColor = "primary" | "dante" | "indigo" | "danger";

/**
 * No direct MUI equivalent — closest is a custom empty-list pattern. Provides a
 * centered column layout with optional icon halo, title, description, and action slot.
 */
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Headline explaining the empty state.
   *
   * @default undefined
   * @type {ReactNode}
   */
  title: ReactNode;
  /**
   * Supporting copy.
   *
   * @default undefined
   * @type {ReactNode}
   */
  description?: ReactNode;
  /**
   * Custom illustration or icon node — overrides the default SeverityIcon.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Which glyph the default icon draws. The colour comes from `color`, not from
   * here — so `severity="danger"` on a `primary` panel is a cross in mint.
   *
   * @default undefined
   * @type {SeverityIconSeverity}
   */
  severity?: SeverityIconSeverity;
  /**
   * Accent tone for the halo and the icon.
   *
   * @default "primary"
   * @type {EmptyStateColor}
   */
  color?: EmptyStateColor;
  /**
   * Primary action slot (e.g. a Button).
   *
   * @default undefined
   * @type {ReactNode}
   */
  action?: ReactNode;
  /**
   * Layout scale.
   *
   * @default "medium"
   * @type {EmptyStateSize}
   */
  size?: EmptyStateSize;
}
