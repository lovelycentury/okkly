import {
  DestroyRef,
  Directive,
  booleanAttribute,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  untracked,
} from "@angular/core";
import { structuralTransition, type TransitionRunner } from "../../helpers/transition";
import {
  DEFAULT_TIMEOUT,
  EASING_EASE_OUT,
  EASING_SHARP,
  createCssTransition,
  easingFor,
  reflow,
  timeoutFor,
} from "../../helpers/transitions";
import type { TransitionEasing, TransitionTimeout } from "../../types";

export type SlideTimeout = TransitionTimeout;
export type SlideDirection = "left" | "right" | "up" | "down";
/** The element whose edge the slide hides behind, or a function returning it. */
export type SlideContainer = HTMLElement | (() => HTMLElement | null) | null;

const DEFAULT_EASING: TransitionEasing = { enter: EASING_EASE_OUT, exit: EASING_SHARP };

function resolveContainer(container: SlideContainer | undefined): HTMLElement | null | undefined {
  return typeof container === "function" ? container() : container;
}

/**
 * The transform that parks `node` just past the edge it comes from — the
 * container's when there is one, the window's otherwise. A port of
 * `@okkly/react`'s (and MUI's) `getTranslateValue`, including the offset of a
 * transform the element already has.
 */
function getTranslateValue(
  direction: SlideDirection,
  node: HTMLElement,
  container: HTMLElement | null | undefined,
): string {
  const rect = node.getBoundingClientRect();
  const containerRect = container?.getBoundingClientRect();
  const containerWindow = node.ownerDocument.defaultView ?? window;
  const transform = containerWindow.getComputedStyle(node).getPropertyValue("transform");

  let offsetX = 0;
  let offsetY = 0;
  if (transform && transform !== "none") {
    const values = transform.split("(")[1]?.split(")")[0]?.split(",");
    if (values && values.length >= 6) {
      offsetX = Number.parseInt(values[4]!, 10);
      offsetY = Number.parseInt(values[5]!, 10);
    }
  }

  if (direction === "left") {
    return containerRect
      ? `translateX(${containerRect.right + offsetX - rect.left}px)`
      : `translateX(${containerWindow.innerWidth + offsetX - rect.left}px)`;
  }
  if (direction === "right") {
    return containerRect
      ? `translateX(-${rect.right - containerRect.left - offsetX}px)`
      : `translateX(-${rect.left + rect.width - offsetX}px)`;
  }
  if (direction === "up") {
    return containerRect
      ? `translateY(${containerRect.bottom + offsetY - rect.top}px)`
      : `translateY(${containerWindow.innerHeight + offsetY - rect.top}px)`;
  }
  return containerRect
    ? `translateY(-${rect.top - containerRect.top + rect.height - offsetY}px)`
    : `translateY(-${rect.top + rect.height - offsetY}px)`;
}

/**
 * Moves its element in from off-screen and back out. `direction` is where it
 * comes *from*. Inputs mirror `@okkly/react`'s `<Slide>` — `in`, `appear`,
 * `direction`, `container`, `timeout`, `easing`, `mountOnEnter`,
 * `unmountOnExit` and the six lifecycle callbacks — which follows MUI's Slide.
 *
 * A structural directive on the element it animates:
 * `<div *okklySlide="open; direction: 'left'; container: stage">`, where
 * `stage` is a template reference to the box the element hides behind — give
 * that box `overflow: hidden`. Without a container the element is parked
 * outside the window.
 *
 * Deliberate gaps: as with `OkklyFade` — `delay` instead of
 * `style.transitionDelay`, the lifecycle callbacks as outputs (long form only),
 * no `addEndListener`.
 */
@Directive({ selector: "[okklySlide]" })
export class OkklySlide {
  /**
   * Whether the element is shown — MUI's `in`.
   *
   * @default false
   */
  readonly in = input(false, { alias: "okklySlide", transform: booleanAttribute });
  /**
   * Whether an element that starts shown slides in on its first render.
   *
   * @default true
   */
  readonly appear = input(true, { alias: "okklySlideAppear", transform: booleanAttribute });
  /**
   * The edge the element comes from: `down` enters from above, `up` from below.
   *
   * @default "down"
   */
  readonly direction = input<SlideDirection>("down", { alias: "okklySlideDirection" });
  /**
   * The element whose edge the slide hides behind, instead of the window's.
   *
   * @default undefined
   */
  readonly container = input<SlideContainer | undefined>(undefined, {
    alias: "okklySlideContainer",
  });
  /**
   * Milliseconds for both directions, or `{ enter, exit }`.
   *
   * @default { enter: 225, exit: 195 }
   */
  readonly timeout = input<SlideTimeout>(DEFAULT_TIMEOUT, { alias: "okklySlideTimeout" });
  /**
   * CSS timing function for both directions, or `{ enter, exit }`.
   *
   * @default { enter: EASING_EASE_OUT, exit: EASING_SHARP }
   */
  readonly easing = input<TransitionEasing>(DEFAULT_EASING, { alias: "okklySlideEasing" });
  /**
   * Milliseconds to wait before sliding — a stagger is an index times a step.
   *
   * @default 0
   */
  readonly delay = input(0, {
    alias: "okklySlideDelay",
    transform: (value: unknown) => numberAttribute(value, 0),
  });
  /**
   * Keeps the element out of the DOM until it is first shown.
   *
   * @default false
   */
  readonly mountOnEnter = input(false, {
    alias: "okklySlideMountOnEnter",
    transform: booleanAttribute,
  });
  /**
   * Takes the element out of the DOM once it has slid away.
   *
   * @default false
   */
  readonly unmountOnExit = input(false, {
    alias: "okklySlideUnmountOnExit",
    transform: booleanAttribute,
  });

  /** Emits as the enter starts, with the element. */
  readonly enter = output<HTMLElement>();
  /** Emits once the enter is under way. */
  readonly entering = output<HTMLElement>();
  /** Emits once the element is in place. */
  readonly entered = output<HTMLElement>();
  /** Emits as the exit starts. */
  readonly exit = output<HTMLElement>();
  /** Emits once the exit is under way. */
  readonly exiting = output<HTMLElement>();
  /** Emits once the element has slid away (before it is unmounted). */
  readonly exited = output<HTMLElement>();

  /** The animated element, as last seen by the runner. */
  private node: HTMLElement | null = null;

  private park(node: HTMLElement): void {
    node.style.transform = getTranslateValue(
      this.direction(),
      node,
      resolveContainer(this.container()),
    );
  }

  private readonly runner: TransitionRunner = {
    rest: (node, status) => {
      this.node = node;
      node.style.transition = "";
      if (status === "entered") node.style.transform = "none";
      else this.park(node);
      node.style.visibility = status === "exited" ? "hidden" : "";
    },
    enter: (node) => {
      this.node = node;
      node.style.visibility = "";
      this.park(node);
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
      this.park(node);
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
    className: () => `okkly-slide okkly-slide--${this.direction()}`,
    outputs: this,
  });

  constructor() {
    // A parked element has to follow its edge: re-park it when the direction or
    // container changes, and — for the edges that move with the window's size —
    // when the window resizes.
    effect((onCleanup) => {
      const shown = this.in();
      const direction = this.direction();
      this.container();
      untracked(() => {
        if (shown || this.status() !== "exited" || !this.node?.isConnected) return;
        this.park(this.node);
      });
      if (shown || direction === "down" || direction === "right") return;

      const containerWindow = this.node?.ownerDocument.defaultView ?? window;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const onResize = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          if (this.node?.isConnected && untracked(this.status) === "exited") this.park(this.node);
        }, 166);
      };
      containerWindow.addEventListener("resize", onResize);
      onCleanup(() => {
        if (timer) clearTimeout(timer);
        containerWindow.removeEventListener("resize", onResize);
      });
    });

    inject(DestroyRef).onDestroy(() => (this.node = null));
  }
}
