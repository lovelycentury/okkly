import {
  DestroyRef,
  afterRenderEffect,
  effect,
  inject,
  signal,
  untracked,
  type Signal,
} from "@angular/core";
import type { TransitionMode, TransitionTimeoutWithAuto } from "../types";

/** MUI `theme.transitions.duration.enteringScreen` */
export const DURATION_ENTERING_SCREEN = 225;
/** MUI `theme.transitions.duration.leavingScreen` */
export const DURATION_LEAVING_SCREEN = 195;

/** MUI `theme.transitions.easing.easeInOut` */
export const EASING_EASE_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * MUI-compatible duration for height-based transitions.
 *
 * @see https://www.wolframalpha.com/input/?i=(4+%2B+15+*+t%5E0.25+%2B+t%2F5)+*+10
 */
export function getAutoHeightDuration(size: number): number {
  if (!size) return 0;
  const constant = size / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

/** Force layout so the next style change always starts a fresh CSS transition. */
export function reflow(node: HTMLElement): void {
  void node.scrollTop;
}

export function resolveTransitionDuration(
  timeout: TransitionTimeoutWithAuto,
  mode: TransitionMode,
  autoSize?: number,
): number {
  if (timeout === "auto") return getAutoHeightDuration(autoSize ?? 0);
  if (typeof timeout === "number") return timeout;
  return timeout[mode] ?? (mode === "enter" ? DURATION_ENTERING_SCREEN : DURATION_LEAVING_SCREEN);
}

function scale(value: number): string {
  return `scale(${value}, ${value ** 2})`;
}

function applyTransition(node: HTMLElement, duration: number): void {
  node.style.transition = [
    `opacity ${duration}ms ${EASING_EASE_IN_OUT} 0ms`,
    `transform ${Math.round(duration * 0.666)}ms ${EASING_EASE_IN_OUT} 0ms`,
  ].join(",");
}

/** Cancels a running grow, leaving whatever style it had reached in place. */
export type CancelGrow = () => void;

export interface GrowOptions {
  /** Grow timeout; `"auto"` derives one from the element's height, as MUI does. */
  timeout: TransitionTimeoutWithAuto;
  /** Corner the scale grows from. `Grow`'s own default in `@okkly/react` is the centre. */
  transformOrigin?: string;
}

/**
 * Drives one Grow-style enter on `node` — the same scale+fade `<Grow>` plays in
 * `@okkly/react`, condensed to the single case the Popper-backed surfaces need
 * (no appear/exit callbacks, no `addEndListener`) and driven straight off the
 * element, since Angular has no transition component to wrap it in.
 */
export function growEnter(node: HTMLElement, options: GrowOptions, done?: () => void): CancelGrow {
  applyExitedStyle(node, options.transformOrigin);
  const duration = resolveTransitionDuration(options.timeout, "enter", node.clientHeight);
  applyTransition(node, duration);
  // Reflow so the browser registers the exited style above before the
  // transition to the entered one below is requested — otherwise the two are
  // coalesced into a single frame and nothing appears to animate.
  reflow(node);
  node.style.opacity = "1";
  node.style.transform = "none";
  const timer = setTimeout(() => done?.(), duration);
  return () => clearTimeout(timer);
}

/** Drives one Grow-style exit on `node`, then calls `done`. */
export function growExit(node: HTMLElement, options: GrowOptions, done?: () => void): CancelGrow {
  const duration = resolveTransitionDuration(options.timeout, "exit", node.clientHeight);
  applyTransition(node, duration);
  node.style.opacity = "0";
  node.style.transform = scale(0.75);
  const timer = setTimeout(() => done?.(), duration);
  return () => clearTimeout(timer);
}

/** The style a surface starts from, and returns to once it has grown out. */
function applyExitedStyle(node: HTMLElement, transformOrigin?: string): void {
  node.style.transformOrigin = transformOrigin ?? "";
  node.style.opacity = "0";
  node.style.transform = scale(0.75);
}

export interface GrowSurfaceOptions {
  /** Whether the surface should be on screen. */
  open: () => boolean;
  /** The element to animate, once the template has put it in the DOM. */
  element: () => HTMLElement | null | undefined;
  /** Grow timeout; `"auto"` like MUI. */
  timeout: () => TransitionTimeoutWithAuto;
  /** Corner the scale grows from. */
  transformOrigin?: string;
  /** Called as the surface mounts — wire it to `OkklyPopper.notifyEnter()`. */
  onEnter?: () => void;
  /** Called once the exit has finished — wire it to `OkklyPopper.notifyExited()`. */
  onExited?: () => void;
}

/**
 * The mount → grow in → grow out → unmount cycle a Popper-backed surface goes
 * through, as one signal: bind the returned `mounted` to the `@if` around the
 * element and `element()` to its `viewChild`. This is what React writes as
 * `<Popper transition>{({ TransitionProps }) => <Grow {...TransitionProps}>}`,
 * split in two because Angular has no render props — the surface owns the
 * animation and reports back to Popper through `onEnter`/`onExited`, which is
 * what lets Popper stay mounted for the whole way out.
 *
 * Must be called from an injection context.
 */
export function growSurface(options: GrowSurfaceOptions): Signal<boolean> {
  const mounted = signal(false);
  let cancel: CancelGrow | null = null;

  // Pre-render, so the element exists by the time the enter below runs.
  effect(() => {
    if (!options.open()) return;
    mounted.set(true);
    options.onEnter?.();
  });

  afterRenderEffect(() => {
    const open = options.open();
    const node = options.element();
    if (!node) return;
    // The timeout is read untracked: changing it mid-flight must not restart
    // the animation that is already playing.
    const growOptions: GrowOptions = {
      timeout: untracked(options.timeout),
      transformOrigin: options.transformOrigin,
    };
    cancel?.();
    cancel = open
      ? growEnter(node, growOptions)
      : growExit(node, growOptions, () => {
          mounted.set(false);
          options.onExited?.();
        });
  });

  inject(DestroyRef).onDestroy(() => cancel?.());

  return mounted.asReadonly();
}
