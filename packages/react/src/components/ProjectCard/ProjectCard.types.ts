import type { HTMLAttributes, ReactNode } from "react";

export interface ProjectCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /**
   * Background image (transparent OK).
   *
   * @default undefined
   * @type {string}
   */
  image?: string;
  /**
   * Brand mark, top-left.
   *
   * @default undefined
   * @type {ReactNode}
   */
  logo?: ReactNode;
  /**
   * Project name.
   *
   * @default undefined
   * @type {string}
   */
  title: string;
  /**
   * One-two line summary.
   *
   * @default undefined
   * @type {string}
   */
  description?: string;
  /**
   * Category pills.
   *
   * @default []
   * @type {string[]}
   */
  tags?: string[];
  /**
   * Show device mockup.
   *
   * @default false
   * @type {boolean}
   */
  device?: boolean;
  /**
   * Opens the case (↗).
   *
   * @default undefined
   * @type {string}
   */
  href?: string;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
