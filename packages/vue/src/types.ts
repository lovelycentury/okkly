/**
 * Shared shapes for the dismissible overlays (Modal, Popover), mirroring
 * `@okkly/react`'s `src/types/overlays.ts`. A handler is told *what* dismissed
 * the overlay, so a caller can treat an accidental backdrop click differently
 * from a deliberate Escape — or refuse to close on one of them. See
 * https://mui.com/material-ui/api/dialog/#dialog-prop-onClose.
 *
 * There is no Vue equivalent of React's `SyntheticEvent`, so the event is
 * always the native DOM `Event` a document listener or a click handler saw.
 */

/** Why the overlay closed. */
export type OverlayCloseReason = "backdropClick" | "escapeKeyDown";

export type OverlayCloseHandler<Reason extends string = OverlayCloseReason> = (
  event: Event,
  reason: Reason,
) => void;

/**
 * Shared shapes for the transition family (`Fade`, `Grow`, `Zoom`, `Slide`,
 * `Collapse`), mirroring `@okkly/react`'s `src/types/transitions.ts`.
 */

export type TransitionTimeout = number | { enter?: number; exit?: number };
export type TransitionTimeoutWithAuto = TransitionTimeout | "auto";
export type TransitionEasing = string | { enter?: string; exit?: string };
export type TransitionMode = "enter" | "exit";

/**
 * Props every member of the family shares. React's `in`/`appear`/`easing`
 * carry over name-for-name (`in` is a valid Vue prop key: it is only a
 * reserved word as a bare identifier, not as an object property, so
 * `props.in` and `:in="…"` both work). `mountOnEnter`/`unmountOnExit` —
 * react-transition-group's two independent knobs for whether the child stays
 * in the DOM before its first entrance and after its last exit — collapse
 * into one `keepMounted`, since Vue has no `cloneElement`-style way to inject
 * a ref into arbitrary slot content: a component here can only reach the
 * slot's root element through `<Transition>`'s own `enter`/`leave` hooks,
 * which fire on a `v-if` or a `v-show` toggle but never on both at once.
 * `keepMounted` picks `v-show` (hidden via `display: none` once the exit
 * finishes) over the default `v-if` (removed from the DOM once the exit
 * finishes) — the Vue-native way to keep the child around, in place of
 * React's "mounted throughout, hidden via `visibility`".
 *
 * Dropped entirely: `addEndListener` (a react-transition-group escape hatch
 * with no Vue equivalent — every component here already owns its end-of-
 * transition timing) and the `onEntering`/`onExiting` half of React's six
 * lifecycle callbacks (Vue's `<Transition>` exposes one hook per phase, not
 * RTG's three-part state machine) — `enter`/`entered`/`exit`/`exited` remain
 * as emits.
 */
export interface SharedTransitionProps {
  /**
   * In. Whether the child is shown.
   *
   * @default false
   */
  in?: boolean;
  /**
   * Appear. Whether the transition also runs on the very first render, if `in` starts `true`.
   *
   * @default true
   */
  appear?: boolean;
  /**
   * Easing.
   *
   * @default undefined
   */
  easing?: TransitionEasing;
  /**
   * Keep Mounted. Keeps the child in the DOM (`v-show`) instead of removing it (`v-if`) once hidden.
   *
   * @default false
   */
  keepMounted?: boolean;
}
