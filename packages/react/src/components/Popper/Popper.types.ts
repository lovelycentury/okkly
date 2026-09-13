import type { HTMLAttributes, ReactNode, Ref } from "react";
import type { Instance, Modifier, Options, Placement, VirtualElement } from "@popperjs/core";

export type PopperPlacement = Placement;

export type PopperAnchorEl =
  HTMLElement | VirtualElement | (() => HTMLElement | VirtualElement | null) | null;

export interface PopperTransitionProps {
  /**
   * In.
   *
   * @default undefined
   * @type {boolean}
   */
  in: boolean;
  /**
   * On Enter.
   *
   * @default undefined
   * @type {() => void}
   */
  onEnter: () => void;
  /**
   * On Exited.
   *
   * @default undefined
   * @type {() => void}
   */
  onExited: () => void;
}

export interface PopperChildrenProps {
  /**
   * Placement.
   *
   * @default "bottom"
   * @type {Placement}
   */
  placement: Placement;
  /**
   * Transition Props.
   *
   * @default undefined
   * @type {PopperTransitionProps}
   */
  TransitionProps?: PopperTransitionProps;
}

/**
 * Props follow MUI's Popper API (https://mui.com/material-ui/api/popper/) as closely
 * as this design allows: `open`/`anchorEl`/`placement`/`modifiers`/`popperOptions`/
 * `disablePortal`/`keepMounted`/`transition`/`popperRef` match name-for-name.
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps`, no `component` polymorphism,
 * no RTL `direction` flip helper (ltr only for now).
 */
export interface PopperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open: boolean;
  /**
   * Anchor El.
   *
   * @default undefined
   * @type {PopperAnchorEl}
   */
  anchorEl?: PopperAnchorEl;
  /**
   * Placement.
   *
   * @default "bottom"
   * @type {PopperPlacement}
   */
  placement?: PopperPlacement;
  /**
   * When true, children stay mounted while closed (hidden via `display: none`).
   *
   * @default false
   * @type {boolean}
   */
  keepMounted?: boolean;
  /**
   * Disable Portal.
   *
   * @default false
   * @type {boolean}
   */
  disablePortal?: boolean;
  /**
   * Container.
   *
   * @default undefined
   * @type {Element | DocumentFragment | null}
   */
  container?: Element | DocumentFragment | null;
  /**
   * Modifiers.
   *
   * @default undefined
   * @type {Array<Partial<Modifier<string, object>>>}
   */
  modifiers?: Array<Partial<Modifier<string, object>>>;
  /**
   * Popper Options.
   *
   * @default defaultPopperOptions
   * @type {Partial<Options>}
   */
  popperOptions?: Partial<Options>;
  /**
   * Popper Ref.
   *
   * @default undefined
   * @type {Ref<Instance | null>}
   */
  popperRef?: Ref<Instance | null>;
  /**
   * When true, children receive `TransitionProps` (render-prop API) so a transition like Grow can drive enter/exit while the popper stays mounted.
   *
   * @default false
   * @type {boolean}
   */
  transition?: boolean;
  /**
   * Size the popper from its anchor — what a select or an autocomplete listbox wants, so the panel lines up with the field. - `true` pins the width to the anchor's exactly. - `"min"` uses it as a floor instead, so a `width` in `style` (or longer content) can make the panel wider than the field, never narrower. MUI has no prop for this; it is done there with a Popper.js modifier, and that is exactly what this is, just named.
   *
   * @default false
   * @type {boolean | "min"}
   */
  matchAnchorWidth?: boolean | "min";
  /**
   * Floor for the popper's width. Pairs with `matchAnchorWidth` for narrow anchors.
   *
   * @default undefined
   * @type {number | string}
   */
  minWidth?: number | string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode | ((props: PopperChildrenProps) => ReactNode)}
   */
  children?: ReactNode | ((props: PopperChildrenProps) => ReactNode);
}
