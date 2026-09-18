import type { ModalProps } from "../Modal/Modal.types";
import type { TransitionTimeoutWithAuto } from "../../types";

/** `false` removes the cap entirely, as in MUI. */
export type DialogMaxWidth = "xs" | "sm" | "md" | "lg" | "xl" | false;

/**
 * Built on `Modal`, which owns the portal, backdrop, focus trap, scroll lock
 * and focus restoration — exactly the split MUI draws. Dialog adds only the
 * centred container and the sized paper on top, and opens the paper with
 * `Grow` (MUI's own Dialog transition, and the same one `Tooltip`/`Popover`
 * use) while the backdrop fades in alongside it.
 *
 * Props follow MUI's Dialog API (https://mui.com/material-ui/api/dialog/) as
 * closely as this design allows: `open`/`fullWidth`/`maxWidth`/`fullScreen`
 * match name-for-name, and every `Modal` prop (`keepMounted`, `container`,
 * `disableEscapeKeyDown`, …) is inherited and forwarded. Vue-forced
 * differences: `children` becomes the default slot, `onClose` becomes the
 * `close` emit (still carrying `(event, reason)` so a caller can tell a stray
 * backdrop click from a deliberate Escape), and composition uses the
 * `DialogTitle`/`DialogContent`/`DialogActions`/`DialogClose` components
 * exported alongside this one. Deliberate gaps: no `sx`/`classes`, simple
 * focus trap (first focusable only wraps Tab).
 */
export interface DialogProps extends ModalProps {
  /**
   * Full Width.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Max Width.
   *
   * @default "sm"
   */
  maxWidth?: DialogMaxWidth;
  /**
   * Full Screen.
   *
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Grow timeout; `'auto'` like MUI.
   *
   * @default "auto"
   */
  transitionDuration?: TransitionTimeoutWithAuto;
}
