import type { HTMLAttributes, ReactNode } from "react";

export type StatCardSize = "sm" | "md" | "lg";
export type StatCardColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

export interface StatCardTrend {
  value: string;
  up: boolean;
}

/**
 * One key metric per card. No MUI equivalent — closest is a custom dashboard tile;
 * props mirror the figma StatCard spec (`value`, `label`, `trend`, accent tone).
 */
export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * What the metric measures.
   *
   * @default undefined
   * @type {string}
   */
  label: string;
  /**
   * The headline number or string.
   *
   * @default undefined
   * @type {ReactNode}
   */
  value: ReactNode;
  /**
   * Optional delta badge (green up / red down).
   *
   * @default undefined
   * @type {StatCardTrend}
   */
  trend?: StatCardTrend;
  /**
   * Optional glyph shown top-right.
   *
   * @default undefined
   * @type {ReactNode}
   */
  icon?: ReactNode;
  /**
   * Accent tone for highlighted cards.
   *
   * @default "primary"
   * @type {StatCardColor}
   */
  color?: StatCardColor;
  /**
   * When true, value picks up the accent tone and the card glows.
   *
   * @default false
   * @type {boolean}
   */
  accent?: boolean;
  /**
   * Supporting copy below the label.
   *
   * @default undefined
   * @type {string}
   */
  description?: string;
  /**
   * Card density.
   *
   * @default "md"
   * @type {StatCardSize}
   */
  size?: StatCardSize;
}
