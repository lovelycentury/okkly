import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

export type InlineActionSize = "small" | "medium" | "large";
export type InlineActionColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";
export type InlineActionFill = "filled" | "soft" | "outline" | "gradient" | "glass";
export type InlineActionState =
  | "default"
  | "hover"
  | "focus"
  | "filled"
  | "loading"
  | "success"
  | "error"
  | "readonly"
  | "disabled";

/**
 * `state` is the single source of truth for the non-native visual states
 * (loading/success/error/readonly/disabled — content this component can't
 * infer on its own). It's a purely presentational prop: this component runs
 * no async logic itself — a consumer's copy/subscribe/send flow sets `state`
 * (and `action`/`actionIcon`/`message`) as it progresses.
 * `disabled`/`loading`/`readonly` booleans are convenience overrides for the
 * common cases; they win over `state` when true (disabled > loading > readonly).
 * hover/focus work natively via CSS — `state="hover"|"focus"` only exists to
 * force those frames for Storybook/QA, matching the Figma spec's own enum.
 */
export interface InlineActionProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "onChange" | "readOnly"
> {
  /**
   * Field value.
   *
   * @default undefined
   * @type {string}
   */
  value?: string;
  /**
   * Empty-state hint.
   *
   * @default undefined
   * @type {string}
   */
  placeholder?: string;
  /**
   * Inline button label.
   *
   * @default "Copy"
   * @type {string}
   */
  action?: string;
  /**
   * Button trailing icon (overridden automatically for loading/success/error/readonly).
   *
   * @default undefined
   * @type {ReactNode}
   */
  actionIcon?: ReactNode;
  /**
   * Overall scale.
   *
   * @default "medium"
   * @type {InlineActionSize}
   */
  size?: InlineActionSize;
  /**
   * Fill colour (dante-ready). Defaults to the ambient section tone, then primary/mint.
   *
   * @default undefined
   * @type {InlineActionColor}
   */
  color?: InlineActionColor;
  /**
   * How the tone is carried on the action button.
   *
   * @default "filled"
   * @type {InlineActionFill}
   */
  fill?: InlineActionFill;
  /**
   * Caption under the field (feedback).
   *
   * @default undefined
   * @type {string}
   */
  message?: string;
  /**
   * Visual state.
   *
   * @default "default"
   * @type {InlineActionState}
   */
  state?: InlineActionState;
  /**
   * Value shown, action locked.
   *
   * @default false
   * @type {boolean}
   */
  readonly?: boolean;
  /**
   * Spinner in the button.
   *
   * @default false
   * @type {boolean}
   */
  loading?: boolean;
  /**
   * Blocks input & action.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Inline button handler.
   *
   * @default undefined
   * @type {() => void}
   */
  onAction?: () => void;
  /**
   * Value change handler.
   *
   * @default undefined
   * @type {(event: ChangeEvent<HTMLInputElement>) => void}
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
