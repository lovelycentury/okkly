import { createCssTransition, reflow, resolveTransitionDuration } from "../../helpers/transitions";
import type { PopoverTransitionDuration } from "./Popover.types";

function scale(value: number): string {
  return `scale(${value}, ${value ** 2})`;
}

function applyTransition(node: HTMLElement, duration: number): void {
  node.style.transition = [
    createCssTransition("opacity", { duration }),
    createCssTransition("transform", { duration: Math.round(duration * 0.666) }),
  ].join(",");
}

/** The Grow-in-place style a paper starts and returns to once closed. */
export const growExitedStyle = {
  transformOrigin: "center top",
  opacity: 0,
  transform: scale(0.75),
};

/**
 * Drives one Grow-style enter for `node`, then calls `done` once it should be
 * considered finished — the same math `Grow` uses (see
 * `../../helpers/transitions`), condensed to the single case `Popover` needs
 * (no appear/exit callbacks, no `addEndListener`, and driven directly off the
 * paper rather than through `<Grow>`, since the paper already owns the ref
 * `useClickOutside` needs).
 */
export function growEnter(
  node: HTMLElement,
  timeout: PopoverTransitionDuration,
  done: () => void,
): void {
  const duration = resolveTransitionDuration(timeout, "enter", node.clientHeight);
  applyTransition(node, duration);
  // Reflow so the browser registers the exited style above before the
  // transition to the entered one below is requested — otherwise the two are
  // coalesced into a single frame and nothing appears to animate.
  reflow(node);
  node.style.opacity = "1";
  node.style.transform = "none";
  window.setTimeout(done, duration);
}

/** Drives one Grow-style exit for `node`, then calls `done`. */
export function growExit(
  node: HTMLElement,
  timeout: PopoverTransitionDuration,
  done: () => void,
): void {
  const duration = resolveTransitionDuration(timeout, "exit", node.clientHeight);
  applyTransition(node, duration);
  node.style.opacity = "0";
  node.style.transform = scale(0.75);
  window.setTimeout(done, duration);
}
