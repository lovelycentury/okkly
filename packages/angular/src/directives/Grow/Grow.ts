import { Directive, booleanAttribute, input, numberAttribute, output } from "@angular/core";
import { structuralTransition, type TransitionRunner } from "../../helpers/transition";
import {
  createCssTransition,
  easingFor,
  getAutoHeightDuration,
  reflow,
  timeoutFor,
} from "../../helpers/transitions";
import type { TransitionEasing, TransitionTimeoutWithAuto } from "../../types";

export type GrowTimeout = TransitionTimeoutWithAuto;

function scale(value: number): string {
  return `scale(${value}, ${value ** 2})`;
}

/**
 * Scales and fades its element in and out, from its `transform-origin`.
 * Inputs mirror `@okkly/react`'s `<Grow>` — `in`, `appear`, `timeout`
 * (`"auto"` by default), `easing`, `mountOnEnter`, `unmountOnExit` and the six
 * lifecycle callbacks — which follows MUI's Grow.
 *
 * A structural directive on the element it animates: `<div *okklyGrow="open">`,
 * other inputs in the microsyntax. Set the origin with the element's own
 * `style="transform-origin: top left"`, as React takes it from `style`.
 *
 * Deliberate gaps: as with `OkklyFade` — `delay` instead of
 * `style.transitionDelay`, the lifecycle callbacks as outputs (long form only),
 * no `addEndListener`.
 */
@Directive({ selector: "[okklyGrow]" })
export class OkklyGrow {
  /**
   * Whether the element is shown — MUI's `in`.
   *
   * @default false
   */
  readonly in = input(false, { alias: "okklyGrow", transform: booleanAttribute });
  /**
   * Whether an element that starts shown grows in on its first render.
   *
   * @default true
   */
  readonly appear = input(true, { alias: "okklyGrowAppear", transform: booleanAttribute });
  /**
   * Milliseconds, `{ enter, exit }`, or `"auto"` to derive them from the element's height.
   *
   * @default "auto"
   */
  readonly timeout = input<GrowTimeout>("auto", { alias: "okklyGrowTimeout" });
  /**
   * CSS timing function of the scale, for both directions or `{ enter, exit }`.
   *
   * @default undefined
   */
  readonly easing = input<TransitionEasing | undefined>(undefined, { alias: "okklyGrowEasing" });
  /**
   * Milliseconds to wait before growing — a stagger is an index times a step.
   *
   * @default 0
   */
  readonly delay = input(0, {
    alias: "okklyGrowDelay",
    transform: (value: unknown) => numberAttribute(value, 0),
  });
  /**
   * Keeps the element out of the DOM until it is first shown.
   *
   * @default false
   */
  readonly mountOnEnter = input(false, {
    alias: "okklyGrowMountOnEnter",
    transform: booleanAttribute,
  });
  /**
   * Takes the element out of the DOM once it has shrunk away.
   *
   * @default false
   */
  readonly unmountOnExit = input(false, {
    alias: "okklyGrowUnmountOnExit",
    transform: booleanAttribute,
  });

  /** Emits as the enter starts, with the element. */
  readonly enter = output<HTMLElement>();
  /** Emits once the enter is under way. */
  readonly entering = output<HTMLElement>();
  /** Emits once the element has fully grown in. */
  readonly entered = output<HTMLElement>();
  /** Emits as the exit starts. */
  readonly exit = output<HTMLElement>();
  /** Emits once the exit is under way. */
  readonly exiting = output<HTMLElement>();
  /** Emits once the element has fully shrunk away (before it is unmounted). */
  readonly exited = output<HTMLElement>();

  private duration(node: HTMLElement, mode: "enter" | "exit"): number {
    const timeout = this.timeout();
    return timeout === "auto"
      ? getAutoHeightDuration(node.clientHeight)
      : timeoutFor(timeout, mode);
  }

  private readonly runner: TransitionRunner = {
    rest: (node, status) => {
      node.style.transition = "";
      node.style.opacity = status === "entered" ? "1" : "0";
      node.style.transform = status === "entered" ? "none" : scale(0.75);
      node.style.visibility = status === "exited" ? "hidden" : "";
    },
    enter: (node) => {
      node.style.visibility = "";
      reflow(node);
      const duration = this.duration(node, "enter");
      const delay = this.delay();
      node.style.transition = [
        createCssTransition("opacity", { duration, delay }),
        createCssTransition("transform", {
          duration: duration * 0.666,
          delay,
          easing: easingFor(this.easing(), "enter"),
        }),
      ].join(",");
      node.style.opacity = "1";
      node.style.transform = scale(1);
      return duration + delay;
    },
    entered: (node) => {
      node.style.transform = "none";
    },
    exit: (node) => {
      const duration = this.duration(node, "exit");
      const delay = this.delay();
      // The scale starts a third of the way in, so the exit reads as fading
      // first and shrinking after.
      node.style.transition = [
        createCssTransition("opacity", { duration, delay }),
        createCssTransition("transform", {
          duration: duration * 0.666,
          delay: delay || duration * 0.333,
          easing: easingFor(this.easing(), "exit"),
        }),
      ].join(",");
      node.style.opacity = "0";
      node.style.transform = scale(0.75);
      return duration + delay;
    },
  };

  /** Where the transition is — `unmounted`, `exited`, `entering`, `entered` or `exiting`. */
  readonly status = structuralTransition({
    in: () => this.in(),
    appear: () => this.appear(),
    mountOnEnter: () => this.mountOnEnter(),
    unmountOnExit: () => this.unmountOnExit(),
    runner: this.runner,
    className: () => "okkly-grow",
    outputs: this,
  });
}
