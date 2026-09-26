import { Directive, booleanAttribute, input, numberAttribute, output } from "@angular/core";
import { structuralTransition, type TransitionRunner } from "../../helpers/transition";
import {
  DEFAULT_TIMEOUT,
  createCssTransition,
  easingFor,
  reflow,
  timeoutFor,
} from "../../helpers/transitions";
import type { TransitionEasing, TransitionTimeout } from "../../types";

export type ZoomTimeout = TransitionTimeout;

/**
 * Scales its element from nothing to full size and back, without touching
 * opacity. Inputs mirror `@okkly/react`'s `<Zoom>` — `in`, `appear`,
 * `timeout`, `easing`, `mountOnEnter`, `unmountOnExit` and the six lifecycle
 * callbacks — which follows MUI's Zoom.
 *
 * A structural directive on the element it animates: `<div *okklyZoom="open">`,
 * other inputs in the microsyntax.
 *
 * Deliberate gaps: as with `OkklyFade` — `delay` instead of
 * `style.transitionDelay`, the lifecycle callbacks as outputs (long form only),
 * no `addEndListener`.
 */
@Directive({ selector: "[okklyZoom]" })
export class OkklyZoom {
  /**
   * Whether the element is shown — MUI's `in`.
   *
   * @default false
   */
  readonly in = input(false, { alias: "okklyZoom", transform: booleanAttribute });
  /**
   * Whether an element that starts shown zooms in on its first render.
   *
   * @default true
   */
  readonly appear = input(true, { alias: "okklyZoomAppear", transform: booleanAttribute });
  /**
   * Milliseconds for both directions, or `{ enter, exit }`.
   *
   * @default { enter: 225, exit: 195 }
   */
  readonly timeout = input<ZoomTimeout>(DEFAULT_TIMEOUT, { alias: "okklyZoomTimeout" });
  /**
   * CSS timing function for both directions, or `{ enter, exit }`.
   *
   * @default undefined
   */
  readonly easing = input<TransitionEasing | undefined>(undefined, { alias: "okklyZoomEasing" });
  /**
   * Milliseconds to wait before zooming — a stagger is an index times a step.
   *
   * @default 0
   */
  readonly delay = input(0, {
    alias: "okklyZoomDelay",
    transform: (value: unknown) => numberAttribute(value, 0),
  });
  /**
   * Keeps the element out of the DOM until it is first shown.
   *
   * @default false
   */
  readonly mountOnEnter = input(false, {
    alias: "okklyZoomMountOnEnter",
    transform: booleanAttribute,
  });
  /**
   * Takes the element out of the DOM once it has zoomed away.
   *
   * @default false
   */
  readonly unmountOnExit = input(false, {
    alias: "okklyZoomUnmountOnExit",
    transform: booleanAttribute,
  });

  /** Emits as the enter starts, with the element. */
  readonly enter = output<HTMLElement>();
  /** Emits once the enter is under way. */
  readonly entering = output<HTMLElement>();
  /** Emits once the element is at full size. */
  readonly entered = output<HTMLElement>();
  /** Emits as the exit starts. */
  readonly exit = output<HTMLElement>();
  /** Emits once the exit is under way. */
  readonly exiting = output<HTMLElement>();
  /** Emits once the element has zoomed away (before it is unmounted). */
  readonly exited = output<HTMLElement>();

  private readonly runner: TransitionRunner = {
    rest: (node, status) => {
      node.style.transition = "";
      node.style.transform = status === "entered" ? "none" : "scale(0)";
      node.style.visibility = status === "exited" ? "hidden" : "";
    },
    enter: (node) => {
      node.style.visibility = "";
      reflow(node);
      const duration = timeoutFor(this.timeout(), "enter");
      node.style.transition = createCssTransition("transform", {
        duration,
        easing: easingFor(this.easing(), "enter"),
        delay: this.delay(),
      });
      node.style.transform = "none";
      return duration + this.delay();
    },
    exit: (node) => {
      const duration = timeoutFor(this.timeout(), "exit");
      node.style.transition = createCssTransition("transform", {
        duration,
        easing: easingFor(this.easing(), "exit"),
        delay: this.delay(),
      });
      node.style.transform = "scale(0)";
      return duration + this.delay();
    },
  };

  /** Where the transition is — `unmounted`, `exited`, `entering`, `entered` or `exiting`. */
  readonly status = structuralTransition({
    in: () => this.in(),
    appear: () => this.appear(),
    mountOnEnter: () => this.mountOnEnter(),
    unmountOnExit: () => this.unmountOnExit(),
    runner: this.runner,
    className: () => "okkly-zoom",
    outputs: this,
  });
}
