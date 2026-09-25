/**
 * Shared shapes for the dismissible overlays (`OkklyModal`, `OkklyPopover`)
 * and for the transitions they open with, mirroring `@okkly/react`'s
 * `src/types`.
 */

/** Why the overlay closed. */
export type OverlayCloseReason = "backdropClick" | "escapeKeyDown";

/**
 * What a `(close)` listener is handed. React passes `(event, reason)` as two
 * arguments; an Angular `output()` emits a single value, so the pair travels
 * as one object — a caller can still treat an accidental backdrop click
 * differently from a deliberate Escape, or refuse to close on one of them.
 *
 * @see https://mui.com/material-ui/api/dialog/#dialog-prop-onClose
 */
export interface OverlayCloseEvent {
  /** The DOM event a document listener or a click handler saw. */
  event: Event;
  /** Why the overlay closed. */
  reason: OverlayCloseReason;
}

/** Milliseconds, either for both directions or one per direction (`appear` falls back to `enter`). */
export type TransitionTimeout = number | { appear?: number; enter?: number; exit?: number };

/** A CSS timing function, either for both directions or one per direction. */
export type TransitionEasing = string | { enter?: string; exit?: string };

/** A timeout, or `"auto"` to derive one from the element's height, as MUI does. */
export type TransitionTimeoutWithAuto = TransitionTimeout | "auto";

/** Which half of a transition a duration is being resolved for. */
export type TransitionMode = "enter" | "exit";
