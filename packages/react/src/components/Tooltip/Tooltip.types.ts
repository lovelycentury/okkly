import type { FocusEvent, MouseEvent, ReactElement, ReactNode, Ref } from "react";
import type { PopperPlacement } from "../Popper/Popper.types";
import type { TransitionTimeoutWithAuto } from "../../types";

export type TooltipPlacement = PopperPlacement;

export type TooltipTriggerProps = {
  /**
   * Ref.
   *
   * @default undefined
   * @type {Ref<HTMLElement>}
   */
  ref?: Ref<HTMLElement>;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  "aria-describedby"?: string;
  /**
   * On Mouse Enter.
   *
   * @default undefined
   * @type {(event: MouseEvent) => void}
   */
  onMouseEnter?: (event: MouseEvent) => void;
  /**
   * On Mouse Leave.
   *
   * @default undefined
   * @type {(event: MouseEvent) => void}
   */
  onMouseLeave?: (event: MouseEvent) => void;
  /**
   * On Focus.
   *
   * @default undefined
   * @type {(event: FocusEvent) => void}
   */
  onFocus?: (event: FocusEvent) => void;
  /**
   * On Blur.
   *
   * @default undefined
   * @type {(event: FocusEvent) => void}
   */
  onBlur?: (event: FocusEvent) => void;
};

/**
 * Props follow MUI's Tooltip API (https://mui.com/material-ui/api/tooltip/) as closely
 * as this design allows: `title`/`children`/`placement`/`open`/`defaultOpen`/`onOpen`/
 * `onClose`/`enterDelay`/`leaveDelay`/`arrow`/`disableHoverListener`/
 * `disableFocusListener` match name-for-name. `interactive` is MUI's
 * `disableInteractive` with the sense flipped — same default behaviour, and see
 * the prop for why. Deliberate gaps: no `sx`/`classes`/`slots`, no
 * `describeChild`, no `followCursor`, no `enterTouchDelay`.
 *
 * Built on Popper, like MUI's. That is what makes it flip near a viewport edge,
 * escape an `overflow: hidden` ancestor, and put its arrow on the side it
 * actually ended up on rather than the side that was asked for.
 */
export interface TooltipProps {
  /**
   * Tooltip content (MUI `title`). An empty title renders nothing, as in MUI.
   *
   * @default undefined
   * @type {ReactNode}
   */
  title: ReactNode;
  /**
   * Element that triggers the tooltip.
   *
   * @default undefined
   * @type {ReactElement<TooltipTriggerProps>}
   */
  children: ReactElement<TooltipTriggerProps>;
  /**
   * Placement.
   *
   * @default "top"
   * @type {TooltipPlacement}
   */
  placement?: TooltipPlacement;
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open?: boolean;
  /**
   * Default Open.
   *
   * @default false
   * @type {boolean}
   */
  defaultOpen?: boolean;
  /**
   * On Open.
   *
   * @default undefined
   * @type {() => void}
   */
  onOpen?: () => void;
  /**
   * On Close.
   *
   * @default undefined
   * @type {() => void}
   */
  onClose?: () => void;
  /**
   * Enter Delay.
   *
   * @default 200
   * @type {number}
   */
  enterDelay?: number;
  /**
   * Leave Delay.
   *
   * @default 0
   * @type {number}
   */
  leaveDelay?: number;
  /**
   * Arrow.
   *
   * @default true
   * @type {boolean}
   */
  arrow?: boolean;
  /**
   * Disable Hover Listener.
   *
   * @default false
   * @type {boolean}
   */
  disableHoverListener?: boolean;
  /**
   * Disable Focus Listener.
   *
   * @default false
   * @type {boolean}
   */
  disableFocusListener?: boolean;
  /**
   * Keep the tooltip open while the pointer is inside it, so its content can be read at leisure — or selected, or followed to a link. MUI spells this `disableInteractive` and has been interactive-by-default since v5; the sense is inverted here, but the default behaviour matches.
   *
   * @default true
   * @type {boolean}
   */
  interactive?: boolean;
  /**
   * Force the tooltip to *describe* the trigger rather than name it, even when the
   * trigger has no name of its own. Off by default: see the note on `trigger`
   * below for why the choice is normally made automatically.
   *
   * @default false
   * @type {boolean}
   */
  describeChild?: boolean;
  /**
   * Grow timeout; `'auto'` like MUI.
   *
   * @default "auto"
   * @type {TransitionTimeoutWithAuto}
   */
  transitionDuration?: TransitionTimeoutWithAuto;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
