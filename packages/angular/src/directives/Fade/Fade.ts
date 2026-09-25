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

export type FadeTimeout = TransitionTimeout;

/**
 * Fades its element's opacity in and out. Inputs mirror `@okkly/react`'s
 * `<Fade>` — `in`, `appear`, `timeout`, `easing`, `mountOnEnter`,
 * `unmountOnExit` and the six lifecycle callbacks — which follows MUI's Fade.
 *
 * A structural directive rather than a wrapper, since the transition is
 * written onto the element itself: `<div *okklyFade="open">`, with the other
 * inputs in the microsyntax — `*okklyFade="open; timeout: 300; unmountOnExit:
 * true"`. Mounting and unmounting are real: with `unmountOnExit` the element
 * leaves the DOM once it has faded out.
 *
 * Deliberate gaps: React reads a `transitionDelay` from `style`; here it is
 * `delay`, in milliseconds. The lifecycle callbacks are outputs (`enter`,
 * `entering`, `entered`, `exit`, `exiting`, `exited`), each handed the element;
 * the `*` shorthand cannot bind outputs, so listen on the long form —
 * `<ng-template [okklyFade]="open" (exited)="…"><div>…</div></ng-template>`.
 * No `addEndListener`.
 */
@Directive({ selector: "[okklyFade]" })
export class OkklyFade {
  /**
   * Whether the element is shown — MUI's `in`.
   *
   * @default false
   */
  readonly in = input(false, { alias: "okklyFade", transform: booleanAttribute });
  /**
   * Whether an element that starts shown fades in on its first render.
   *
   * @default true
   */
  readonly appear = input(true, { alias: "okklyFadeAppear", transform: booleanAttribute });
  /**
   * Milliseconds for both directions, or `{ enter, exit }`.
   *
   * @default { enter: 225, exit: 195 }
   */
  readonly timeout = input<FadeTimeout>(DEFAULT_TIMEOUT, { alias: "okklyFadeTimeout" });
  /**
   * CSS timing function for both directions, or `{ enter, exit }`.
   *
   * @default undefined
   */
  readonly easing = input<TransitionEasing | undefined>(undefined, { alias: "okklyFadeEasing" });
  /**
   * Milliseconds to wait before fading — a stagger is an index times a step.
   *
   * @default 0
   */
  readonly delay = input(0, {
    alias: "okklyFadeDelay",
    transform: (value: unknown) => numberAttribute(value, 0),
  });
  /**
   * Keeps the element out of the DOM until it is first shown.
   *
   * @default false
   */
  readonly mountOnEnter = input(false, {
    alias: "okklyFadeMountOnEnter",
    transform: booleanAttribute,
  });
  /**
   * Takes the element out of the DOM once it has faded out.
   *
   * @default false
   */
  readonly unmountOnExit = input(false, {
    alias: "okklyFadeUnmountOnExit",
    transform: booleanAttribute,
  });

  /** Emits as the enter starts, with the element. */
  readonly enter = output<HTMLElement>();
  /** Emits once the enter is under way. */
  readonly entering = output<HTMLElement>();
  /** Emits once the element has fully faded in. */
  readonly entered = output<HTMLElement>();
  /** Emits as the exit starts. */
  readonly exit = output<HTMLElement>();
  /** Emits once the exit is under way. */
  readonly exiting = output<HTMLElement>();
  /** Emits once the element has fully faded out (before it is unmounted). */
  readonly exited = output<HTMLElement>();

  private readonly runner: TransitionRunner = {
    rest: (node, status) => {
      node.style.transition = "";
      node.style.opacity = status === "entered" ? "1" : "0";
      node.style.visibility = status === "exited" ? "hidden" : "";
    },
    enter: (node) => {
      node.style.visibility = "";
      reflow(node);
      const duration = timeoutFor(this.timeout(), "enter");
      node.style.transition = createCssTransition("opacity", {
        duration,
        easing: easingFor(this.easing(), "enter"),
        delay: this.delay(),
      });
      node.style.opacity = "1";
      return duration + this.delay();
    },
    exit: (node) => {
      const duration = timeoutFor(this.timeout(), "exit");
      node.style.transition = createCssTransition("opacity", {
        duration,
        easing: easingFor(this.easing(), "exit"),
        delay: this.delay(),
      });
      node.style.opacity = "0";
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
    className: () => "okkly-fade",
    outputs: this,
  });
}
