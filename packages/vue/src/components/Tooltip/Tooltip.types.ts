import type { PopperPlacement } from "../Popper/Popper.types";
import type { TransitionTimeoutWithAuto } from "../../types";

export type TooltipPlacement = PopperPlacement;

/**
 * Props follow MUI's Tooltip API (https://mui.com/material-ui/api/tooltip/)
 * as closely as this design allows, mirroring `@okkly/react`'s `<Tooltip>`
 * name-for-name: `placement`/`enterDelay`/`leaveDelay`/`arrow`/
 * `disableHoverListener`/`disableFocusListener`/`interactive`/
 * `describeChild`/`transitionDuration` match name-for-name. `interactive`
 * is MUI's `disableInteractive` with the sense flipped — same default
 * behaviour, and see the prop below for why. Deliberate gaps: no
 * `sx`/`classes`/`slots`, no `followCursor`, no `enterTouchDelay`.
 *
 * Built on `Popper`, like MUI's. That is what makes it flip near a viewport
 * edge, escape an `overflow: hidden` ancestor, and put its arrow on the
 * side it actually ended up on rather than the side that was asked for.
 *
 * Vue-forced differences:
 * - The trigger (React's single-child `children`) becomes the default
 *   slot. The component clones the slot's single vnode (via `cloneVNode`,
 *   Vue's counterpart of `cloneElement`) to merge its listeners and ARIA
 *   attributes directly onto it — no extra wrapper element, same as React.
 * - `title` narrows from `ReactNode` to `string` for the common case; fill
 *   the `#title` slot instead for rich content, which overrides the prop
 *   and is treated the same way React treats a non-string `title`.
 * - The controlled `open`/`onOpen`/`onClose` triad becomes a named
 *   `defineModel<boolean | undefined>("open", { default: undefined })`,
 *   with `defaultOpen` still seeding it once while unbound (the same
 *   `Accordion` pattern) — plus separate `open`/`close` emits, since React
 *   keeps those as distinct notifications rather than folding them into a
 *   single change event.
 * - `className` is dropped — a consumer's `class` merges onto the popup
 *   automatically.
 */
export interface TooltipProps {
  /**
   * Tooltip content. An empty title renders nothing, as in MUI. Ignored
   * when the `#title` slot is filled.
   *
   * @default undefined
   */
  title?: string;
  /**
   * Placement.
   *
   * @default "top"
   */
  placement?: TooltipPlacement;
  /**
   * Seeds the open state once while `open` is unbound.
   *
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Delay before opening, in ms.
   *
   * @default 200
   */
  enterDelay?: number;
  /**
   * Delay before closing, in ms.
   *
   * @default 0
   */
  leaveDelay?: number;
  /**
   * Shows a small arrow pointing at the trigger.
   *
   * @default true
   */
  arrow?: boolean;
  /**
   * Disables the hover/unhover trigger listeners.
   *
   * @default false
   */
  disableHoverListener?: boolean;
  /**
   * Disables the focus/blur trigger listeners.
   *
   * @default false
   */
  disableFocusListener?: boolean;
  /**
   * Keep the tooltip open while the pointer is inside it, so its content
   * can be read at leisure — or selected, or followed to a link. MUI
   * spells this `disableInteractive` and has been interactive-by-default
   * since v5; the sense is inverted here, but the default behaviour
   * matches.
   *
   * @default true
   */
  interactive?: boolean;
  /**
   * Force the tooltip to *describe* the trigger rather than name it, even
   * when the trigger has no name of its own. Off by default: normally the
   * choice is made automatically from whether the trigger already has an
   * accessible name.
   *
   * @default false
   */
  describeChild?: boolean;
  /**
   * Grow timeout; `"auto"` like MUI.
   *
   * @default "auto"
   */
  transitionDuration?: TransitionTimeoutWithAuto;
}
