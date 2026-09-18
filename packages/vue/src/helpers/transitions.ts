import type { TransitionEasing, TransitionMode, TransitionTimeoutWithAuto } from "../types";

/** MUI `theme.transitions.duration.enteringScreen` */
export const DURATION_ENTERING_SCREEN = 225;
/** MUI `theme.transitions.duration.leavingScreen` */
export const DURATION_LEAVING_SCREEN = 195;
/** MUI `theme.transitions.duration.standard` */
export const DURATION_STANDARD = 300;

/** MUI `theme.transitions.easing.easeInOut` */
export const EASING_EASE_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)";
/** MUI `theme.transitions.easing.easeOut` */
export const EASING_EASE_OUT = "cubic-bezier(0.0, 0, 0.2, 1)";
/** MUI `theme.transitions.easing.sharp` */
export const EASING_SHARP = "cubic-bezier(0.4, 0, 0.6, 1)";

export const DEFAULT_TIMEOUT = { enter: DURATION_ENTERING_SCREEN, exit: DURATION_LEAVING_SCREEN };

/**
 * MUI-compatible duration for height/width-based transitions.
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
  return timeout[mode] ?? 0;
}

export function resolveTransitionEasing(
  easing: TransitionEasing | undefined,
  mode: TransitionMode,
): string {
  if (typeof easing === "object") return easing[mode] ?? EASING_EASE_IN_OUT;
  return easing ?? EASING_EASE_IN_OUT;
}

export function createCssTransition(
  props: string | string[],
  options: { duration: number; easing?: string; delay?: string | number } = { duration: 0 },
): string {
  const { duration, easing = EASING_EASE_IN_OUT, delay = 0 } = options;
  const delayCss = typeof delay === "string" ? delay : `${delay}ms`;
  const propsList = Array.isArray(props) ? props : [props];
  return propsList
    .map((animatedProp) => `${animatedProp} ${duration}ms ${easing} ${delayCss}`)
    .join(",");
}
