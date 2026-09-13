import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";

export type CardVariant = "solid" | "raised" | "glass" | "outline" | "aura";
export type CardColor = "primary" | "dante" | "indigo";
export type CardPadding = "none" | "sm" | "md" | "lg";

/**
 * Props follow MUI's Card API (https://mui.com/material-ui/api/card/) where they
 * overlap: `raised` maps to the elevated surface, `children` is the slot tree.
 * Deliberate gaps: composition uses `CardHeader` / `CardContent` / `CardActions` /
 * `CardMedia` subcomponents instead of flat props; `variant` adds glass/outline/aura
 * treatments from this design system.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Elevated surface with shadow.
   *
   * @default false
   * @type {boolean}
   */
  raised?: boolean;
  /**
   * Inner padding preset for content slots.
   *
   * @default "md"
   * @type {CardPadding}
   */
  padding?: CardPadding;
  /**
   * Surface treatment — `solid` is default (no modifier).
   *
   * @default "solid"
   * @type {CardVariant}
   */
  variant?: CardVariant;
  /**
   * Accent tone for `aura` variant.
   *
   * @default "primary"
   * @type {CardColor}
   */
  color?: CardColor;
  /**
   * Hover lift on interactive cards.
   *
   * @default false
   * @type {boolean}
   */
  interactive?: boolean;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Title.
   *
   * @default undefined
   * @type {ReactNode}
   */
  title?: ReactNode;
  /**
   * Subheader.
   *
   * @default undefined
   * @type {ReactNode}
   */
  subheader?: ReactNode;
  /**
   * Action.
   *
   * @default undefined
   * @type {ReactNode}
   */
  action?: ReactNode;
  /**
   * Avatar.
   *
   * @default undefined
   * @type {ReactNode}
   */
  avatar?: ReactNode;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface CardMediaProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Image height — number is px, string is any CSS length.
   *
   * @default 150
   * @type {number | string}
   */
  height?: number | string;
}
