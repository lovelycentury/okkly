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
 *
 * Props mirror `@okkly/react`'s `<InlineAction>` name-for-name. Vue-forced
 * differences: the controlled `value` + `onChange` pair becomes an unnamed
 * `defineModel<string>()`, so consumers can `v-model` it — this component has
 * no uncontrolled `defaultValue` in React either, so there is none here.
 * `actionIcon` (`ReactNode` in React) becomes the `action-icon` slot.
 * `onAction` becomes the `action` emit — a prop and an emit sharing a name is
 * fine in Vue, since `props.action`/`emit("action")` live in separate
 * namespaces. `className`/`id` are dropped from this list since Vue's own
 * fallthrough (`class`) and `useId()` (`id`) handle them; every other native
 * `<input>` attribute (`placeholder` aside, which stays a declared prop) falls
 * through to the rendered `<input>` on its own.
 */
export interface InlineActionProps {
  /**
   * Empty-state hint.
   *
   * @default undefined
   */
  placeholder?: string;
  /**
   * Inline button label.
   *
   * @default "Copy"
   */
  action?: string;
  /**
   * Overall scale.
   *
   * @default "medium"
   */
  size?: InlineActionSize;
  /**
   * Fill colour (dante-ready). Defaults to the ambient section tone, then primary/mint.
   *
   * @default undefined
   */
  color?: InlineActionColor;
  /**
   * How the tone is carried on the action button.
   *
   * @default "filled"
   */
  fill?: InlineActionFill;
  /**
   * Caption under the field (feedback).
   *
   * @default undefined
   */
  message?: string;
  /**
   * Visual state.
   *
   * @default "default"
   */
  state?: InlineActionState;
  /**
   * Value shown, action locked.
   *
   * @default false
   */
  readonly?: boolean;
  /**
   * Spinner in the button.
   *
   * @default false
   */
  loading?: boolean;
  /**
   * Blocks input & action.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Id of the rendered `<input>`. Auto-generated with `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
}
