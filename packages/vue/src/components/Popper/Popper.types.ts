import type { Modifier, Options, Placement, VirtualElement } from "@popperjs/core";

export type PopperPlacement = Placement;

export type PopperAnchorEl =
  HTMLElement | VirtualElement | (() => HTMLElement | VirtualElement | null) | null;

/** What a transition-driving child needs, handed through the default slot's `transitionProps`. */
export interface PopperTransitionSlotProps {
  /**
   * In. Whether the child should be in its entered state.
   *
   * @default undefined
   * @type {boolean}
   */
  in: boolean;
  /**
   * On Enter. Call once the enter transition has been kicked off.
   *
   * @default undefined
   * @type {() => void}
   */
  onEnter: () => void;
  /**
   * On Exited. Call once the exit transition has finished — this is what lets
   * Popper unmount only after the child is done animating out.
   *
   * @default undefined
   * @type {() => void}
   */
  onExited: () => void;
}

/** Scope handed to the default slot. */
export interface PopperSlotProps {
  /**
   * Placement Popper.js actually resolved to, which can differ from the
   * requested one once `flip`/`shift` keep it on screen.
   *
   * @default undefined
   * @type {Placement}
   */
  placement: PopperPlacement;
  /**
   * Present only when `transition` is set. Wire `in` and the two callbacks
   * into whatever drives the child's own enter/exit animation.
   *
   * @default undefined
   * @type {PopperTransitionSlotProps}
   */
  transitionProps?: PopperTransitionSlotProps;
}

/**
 * Props mirror `@okkly/react`'s `<Popper>` name-for-name, which in turn
 * follows MUI's Popper API (https://mui.com/material-ui/api/popper/) as
 * closely as this design allows: `open`/`anchorEl`/`placement`/`keepMounted`/
 * `disablePortal`/`container`/`modifiers`/`popperOptions`/`transition`/
 * `matchAnchorWidth`/`minWidth` match name-for-name. Deliberate gaps: no
 * `sx`/`classes`/`slots`/`slotProps`, no `component` polymorphism, no RTL
 * `direction` flip helper (ltr only for now).
 *
 * Vue-forced differences:
 * - `children`, including React's render-prop form, becomes the default slot,
 *   scoped with `{ placement, transitionProps }` — see
 *   {@link PopperSlotProps}. `TransitionProps.onEnter`/`onExited` keep their
 *   React shape as plain callbacks rather than becoming emits, since they are
 *   meant to be spread onto whatever transition primitive the slot content
 *   uses, exactly as the React render prop was.
 * - `popperRef` is dropped. Put a template ref on `<Popper>` and read the
 *   exposed `popperInstance` instead of threading a ref prop through.
 * - `role` stays an explicit prop (rather than falling through natively) so
 *   its `"tooltip"` default can still be overridden like every other prop.
 *   Every other native attribute — `class`, `style`, `id`, `aria-*`, `data-*`
 *   — falls through to the root element.
 */
export interface PopperProps {
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
   * When true, the slot content stays mounted while closed (hidden via `display: none`).
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
   * Container. Node the portal mounts into. Defaults to `document.body`.
   *
   * @default undefined
   * @type {Element | DocumentFragment | null}
   */
  container?: Element | DocumentFragment | null;
  /**
   * Modifiers. Extra Popper.js modifiers, e.g. `offset`.
   *
   * @default undefined
   * @type {Array<Partial<Modifier<string, object>>>}
   */
  modifiers?: Array<Partial<Modifier<string, object>>>;
  /**
   * Popper Options. Passed to Popper.js's `createPopper` alongside the modifiers above.
   *
   * @default undefined
   * @type {Partial<Options>}
   */
  popperOptions?: Partial<Options>;
  /**
   * When true, the default slot receives `transitionProps` (`{ in, onEnter, onExited }`) so a transition can drive enter/exit while Popper stays mounted for the whole exit.
   *
   * @default false
   * @type {boolean}
   */
  transition?: boolean;
  /**
   * Size the popper from its anchor — what a select or an autocomplete listbox wants, so the panel lines up with the field. `true` pins the width to the anchor's exactly. `"min"` uses it as a floor instead, so a `width` in `style` (or longer content) can make the panel wider than the field, never narrower.
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
   * Role. The ARIA role of the popper element.
   *
   * @default "tooltip"
   * @type {string}
   */
  role?: string;
}
