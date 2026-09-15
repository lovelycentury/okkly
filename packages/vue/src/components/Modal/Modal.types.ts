import type { OverlayCloseReason } from "../../types";

/**
 * The low-level primitive the modal overlays are built from — a dialog, a
 * drawer, and anything else that needs "portal + backdrop + trapped focus"
 * tomorrow. Modal owns only that plumbing; it renders no surface of its own,
 * so the default slot supplies all visual chrome.
 *
 * Props mirror `@okkly/react`'s `<Modal>` name-for-name, which in turn
 * follows MUI's Modal API (https://mui.com/material-ui/api/modal/) as
 * closely as this design allows: `open`/`container`/`keepMounted`/
 * `hideBackdrop`/`disablePortal`/`disableEscapeKeyDown`/`disableAutoFocus`/
 * `disableEnforceFocus`/`disableRestoreFocus`/`disableScrollLock` match
 * name-for-name, and closing reports `(event, reason)`. Deliberate gaps: no
 * `sx`/`classes`, no `closeAfterTransition` — with no built-in transition to
 * wait on, a consumer that animates keeps itself mounted with `keepMounted`.
 *
 * Vue-forced differences:
 * - `children` becomes the default slot.
 * - `onClose` becomes the `close` emit, still carrying `(event, reason)`.
 * - `slotProps.backdrop`, MUI's general "merge arbitrary props onto the
 *   backdrop" escape hatch, narrows to `backdropClass` — a single extra class
 *   for restyling it. Anything the backdrop click should additionally do
 *   belongs in the `close` handler, which already sees the `"backdropClick"`
 *   reason.
 */
export interface ModalProps {
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open: boolean;
  /**
   * Container. Node the portal mounts into. Defaults to `document.body`.
   *
   * @default undefined
   * @type {Element | null}
   */
  container?: Element | null;
  /**
   * Disable Portal.
   *
   * @default false
   * @type {boolean}
   */
  disablePortal?: boolean;
  /**
   * Disable Escape Key Down.
   *
   * @default false
   * @type {boolean}
   */
  disableEscapeKeyDown?: boolean;
  /**
   * Disable Auto Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableAutoFocus?: boolean;
  /**
   * Disable Enforce Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableEnforceFocus?: boolean;
  /**
   * Disable Restore Focus.
   *
   * @default false
   * @type {boolean}
   */
  disableRestoreFocus?: boolean;
  /**
   * Disable Scroll Lock.
   *
   * @default false
   * @type {boolean}
   */
  disableScrollLock?: boolean;
  /**
   * Hide Backdrop.
   *
   * @default false
   * @type {boolean}
   */
  hideBackdrop?: boolean;
  /**
   * Keep Mounted.
   *
   * @default false
   * @type {boolean}
   */
  keepMounted?: boolean;
  /**
   * Extra class applied to the backdrop.
   *
   * @default undefined
   * @type {string}
   */
  backdropClass?: string;
}

export type { OverlayCloseReason };
