import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { transitionStateMachine, type TransitionRunner } from "../../helpers/transition";
import {
  DURATION_STANDARD,
  easingFor,
  getAutoHeightDuration,
  reflow,
  timeoutFor,
} from "../../helpers/transitions";
import type { TransitionEasing, TransitionTimeoutWithAuto } from "../../types";

export type CollapseTimeout = TransitionTimeoutWithAuto;
export type CollapseOrientation = "vertical" | "horizontal";

/**
 * Marks content the collapse renders lazily:
 * `<ng-template okklyCollapseContent>…</ng-template>`. Unlike projected
 * content, it is created on enter and — with `unmountOnExit` — destroyed once
 * the collapse has closed, as React unmounts its children.
 */
@Directive({ selector: "ng-template[okklyCollapseContent]" })
export class OkklyCollapseContent {
  readonly template = inject(TemplateRef);
}

/**
 * Animates its content's height (or width) between `collapsedSize` and its
 * natural size, moving whatever follows. Inputs mirror `@okkly/react`'s
 * `<Collapse>` — `in`, `appear`, `orientation`, `collapsedSize`, `timeout`,
 * `easing`, `mountOnEnter`, `unmountOnExit` and the six lifecycle callbacks —
 * which follows MUI's Collapse.
 *
 * A component rather than a directive, as it renders wrappers of its own to
 * measure the content: `<okkly-collapse [in]="open">…</okkly-collapse>`.
 *
 * Deliberate gaps: the lifecycle callbacks are outputs (`enter` … `exited`).
 * Projected content is always there — Angular creates it with the parent — so
 * `mountOnEnter`/`unmountOnExit` apply to content in an
 * `<ng-template okklyCollapseContent>`; while unmounted, the collapse itself
 * is `display: none`, where React renders nothing. No `addEndListener`.
 */
@Component({
  selector: "okkly-collapse",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  host: {
    class: "okkly-component okkly-collapse",
    "[class]": "modifiers()",
    "[style.min-height]": "isHorizontal() ? null : cssCollapsedSize()",
    "[style.min-width]": "isHorizontal() ? cssCollapsedSize() : null",
    "[style.display]": "isUnmounted() ? 'none' : null",
  },
  templateUrl: "./Collapse.html",
  // React's root is a <div>; this host is a custom element, inline by default,
  // and an inline box ignores the height the collapse animates.
  styles: `
    okkly-collapse {
      display: block;
    }
  `,
})
export class OkklyCollapse {
  /**
   * Whether the content is shown — MUI's `in`.
   *
   * @default false
   */
  readonly in = input(false, { transform: booleanAttribute });
  /**
   * Whether content that starts shown opens on the first render.
   *
   * @default true
   */
  readonly appear = input(true, { transform: booleanAttribute });
  /**
   * Which dimension animates: height (`vertical`) or width (`horizontal`).
   *
   * @default "vertical"
   */
  readonly orientation = input<CollapseOrientation>("vertical");
  /**
   * Size left showing when closed — a number is pixels, a string any CSS length.
   *
   * @default "0px"
   */
  readonly collapsedSize = input<number | string>("0px");
  /**
   * Milliseconds, `{ enter, exit }`, or `"auto"` to derive them from the content's size.
   *
   * @default 300
   */
  readonly timeout = input<CollapseTimeout>(DURATION_STANDARD);
  /**
   * CSS timing function for both directions, or `{ enter, exit }`.
   *
   * @default undefined
   */
  readonly easing = input<TransitionEasing>();
  /**
   * Keeps `okklyCollapseContent` out of the DOM until the collapse first opens.
   *
   * @default false
   */
  readonly mountOnEnter = input(false, { transform: booleanAttribute });
  /**
   * Destroys `okklyCollapseContent` once the collapse has closed.
   *
   * @default false
   */
  readonly unmountOnExit = input(false, { transform: booleanAttribute });

  /** Emits as the enter starts, with the collapse element. */
  readonly enter = output<HTMLElement>();
  /** Emits once the enter is under way. */
  readonly entering = output<HTMLElement>();
  /** Emits once the content is fully open. */
  readonly entered = output<HTMLElement>();
  /** Emits as the exit starts. */
  readonly exit = output<HTMLElement>();
  /** Emits once the exit is under way. */
  readonly exiting = output<HTMLElement>();
  /** Emits once the content has fully closed (before it is unmounted). */
  readonly exited = output<HTMLElement>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly wrapper = viewChild.required<ElementRef<HTMLElement>>("wrapper");
  protected readonly lazyContent = contentChild(OkklyCollapseContent);
  protected readonly contentMounted = signal(false);

  protected readonly isHorizontal = computed(() => this.orientation() === "horizontal");
  protected readonly cssCollapsedSize = computed(() => {
    const size = this.collapsedSize();
    return typeof size === "number" ? `${size}px` : size;
  });

  private get dimension(): "width" | "height" {
    return this.isHorizontal() ? "width" : "height";
  }

  private wrapperSize(): number {
    const wrapper = this.wrapper().nativeElement;
    return this.isHorizontal() ? wrapper.clientWidth : wrapper.clientHeight;
  }

  private applyTiming(node: HTMLElement, mode: "enter" | "exit", size: number): number {
    const timeout = this.timeout();
    const duration = timeout === "auto" ? getAutoHeightDuration(size) : timeoutFor(timeout, mode);
    node.style.transitionDuration = `${duration}ms`;
    const easing = easingFor(this.easing(), mode);
    if (easing) node.style.transitionTimingFunction = easing;
    return duration;
  }

  private readonly runner: TransitionRunner = {
    rest: (node, status) => {
      node.style[this.dimension] = status === "entered" ? "" : this.cssCollapsedSize();
    },
    enter: (node) => {
      const wrapper = this.wrapper().nativeElement;
      // A horizontal wrapper is taken out of the flow so its natural width can
      // be measured while the root is still collapsed.
      if (this.isHorizontal()) wrapper.style.position = "absolute";
      node.style[this.dimension] = this.cssCollapsedSize();
      reflow(node);
      const size = this.wrapperSize();
      wrapper.style.position = "";
      const duration = this.applyTiming(node, "enter", size);
      node.style[this.dimension] = `${size}px`;
      return duration;
    },
    entered: (node) => {
      node.style[this.dimension] = "auto";
    },
    exit: (node) => {
      // Lock the current size in px before leaving `auto`, then animate down from it.
      const size = this.wrapperSize();
      node.style[this.dimension] = `${size}px`;
      reflow(node);
      const duration = this.applyTiming(node, "exit", size);
      node.style[this.dimension] = this.cssCollapsedSize();
      return duration;
    },
  };

  /** Where the transition is — `unmounted`, `exited`, `entering`, `entered` or `exiting`. */
  readonly status = transitionStateMachine({
    in: () => this.in(),
    appear: () => this.appear(),
    mountOnEnter: () => this.mountOnEnter(),
    unmountOnExit: () => this.unmountOnExit(),
    runner: this.runner,
    node: () => this.host,
    mount: () => this.contentMounted.set(true),
    unmount: () => this.contentMounted.set(false),
    emit: (phase, node) => this[phase].emit(node),
  });

  /**
   * Whether the collapse stands in for React's unmounted root. Gated on the
   * mount inputs and on `in`: the state machine also starts out `unmounted`,
   * and hiding the host then would zero the size an appearing enter measures.
   */
  protected readonly isUnmounted = computed(
    () =>
      this.status() === "unmounted" && !this.in() && (this.mountOnEnter() || this.unmountOnExit()),
  );

  protected readonly modifiers = computed(() => {
    const status = this.status();
    const hidden =
      (status === "exited" || status === "unmounted") &&
      !this.in() &&
      this.cssCollapsedSize() === "0px";
    return [
      `okkly-collapse--${this.orientation()}`,
      status === "entered" && "okkly-collapse--entered",
      hidden && "okkly-collapse--hidden",
    ]
      .filter(Boolean)
      .join(" ");
  });
}
