import type { SharedTransitionProps, TransitionTimeoutWithAuto } from "../../types";

export type CollapseTimeout = TransitionTimeoutWithAuto;
export type CollapseOrientation = "vertical" | "horizontal";

/**
 * Props mirror `@okkly/react`'s `<Collapse>` name-for-name, which in turn
 * follows MUI's Collapse. See {@link SharedTransitionProps} for `in`/
 * `appear`/`easing` and the differences from React's transition family there
 * — `keepMounted` does not apply here: unlike the rest of the family,
 * Collapse owns a wrapper it never removes, so the content is mounted by
 * default. `unmountOnExit` opts into removing it once fully collapsed.
 */
export interface CollapseProps extends Omit<SharedTransitionProps, "keepMounted"> {
  /**
   * Timeout.
   *
   * @default DURATION_STANDARD
   * @type {CollapseTimeout}
   */
  timeout?: CollapseTimeout;
  /**
   * Orientation.
   *
   * @default "vertical"
   * @type {CollapseOrientation}
   */
  orientation?: CollapseOrientation;
  /**
   * Width (horizontal) or height (vertical) when collapsed.
   *
   * @default "0px"
   * @type {number | string}
   */
  collapsedSize?: number | string;
  /**
   * Removes the content from the DOM once fully collapsed, instead of leaving it mounted.
   *
   * @default false
   * @type {boolean}
   */
  unmountOnExit?: boolean;
}
