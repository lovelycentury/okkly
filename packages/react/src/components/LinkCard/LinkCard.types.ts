import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";

export type LinkCardColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type LinkCardSize = "small" | "medium" | "large";

/**
 * The signature "vizitka" row: a tappable link to a destination (writing,
 * work, socials). No MUI equivalent — closest is ListItemButton, but this
 * design's fixed title/subtitle/meta shape and `featured` glow have no
 * direct API to mirror.
 */
export interface LinkCardProps extends Omit<HTMLAttributes<HTMLElement>, "onClick" | "title"> {
  /**
   * Primary label.
   *
   * @default undefined
   * @type {string}
   */
  title: string;
  /**
   * Supporting line.
   *
   * @default undefined
   * @type {string}
   */
  subtitle?: string;
  /**
   * Right-aligned tag/handle, e.g. "essays" or "@handle".
   *
   * @default undefined
   * @type {ReactNode}
   */
  meta?: ReactNode;
  /**
   * Accent dot, glass surface + glow.
   *
   * @default false
   * @type {boolean}
   */
  featured?: boolean;
  /**
   * Accent tone when featured (dante-ready).
   *
   * @default "primary"
   * @type {LinkCardColor}
   */
  color?: LinkCardColor;
  /**
   * Row density.
   *
   * @default "medium"
   * @type {LinkCardSize}
   */
  size?: LinkCardSize;
  /**
   * Destination URL — renders an `<a>`.
   *
   * @default undefined
   * @type {string}
   */
  href?: string;
  /**
   * Click handler; works with or without `href`.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLAnchorElement | HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void}
   */
  onClick?: (
    event: MouseEvent<HTMLAnchorElement | HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
  ) => void;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
