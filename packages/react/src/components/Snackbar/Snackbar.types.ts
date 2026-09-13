import type { ReactNode } from "react";
import type { AlertSeverity } from "../Alert/Alert.types";

export type SnackbarAnchorVertical = "top" | "bottom";
export type SnackbarAnchorHorizontal = "left" | "center" | "right";

export interface SnackbarAnchorOrigin {
  vertical: SnackbarAnchorVertical;
  horizontal: SnackbarAnchorHorizontal;
}

/**
 * Props follow MUI's Snackbar API (https://mui.com/material-ui/api/snackbar/) as closely
 * as this design allows: `open`/`onClose`/`autoHideDuration`/`message`/`action`/
 * `anchorOrigin`/`children` match name-for-name. Deliberate gaps: no `sx`/`classes`,
 * adds `severity` to compose `Alert` styling, `onClose` takes no `reason` argument,
 * and there is no click-away dismissal — the timer, Escape, and the dismiss button
 * are the ways out. No queue: one snackbar at a time.
 */
export interface SnackbarProps {
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open: boolean;
  /**
   * On Close.
   *
   * @default undefined
   * @type {() => void}
   */
  onClose?: () => void;
  /**
   * Auto Hide Duration.
   *
   * @default 4000
   * @type {number}
   */
  autoHideDuration?: number;
  /**
   * Message.
   *
   * @default undefined
   * @type {ReactNode}
   */
  message?: ReactNode;
  /**
   * Action.
   *
   * @default undefined
   * @type {ReactNode}
   */
  action?: ReactNode;
  /**
   * Anchor Origin.
   *
   * @default DEFAULT_ANCHOR
   * @type {SnackbarAnchorOrigin}
   */
  anchorOrigin?: SnackbarAnchorOrigin;
  /**
   * Severity.
   *
   * @default "info"
   * @type {AlertSeverity}
   */
  severity?: AlertSeverity;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
