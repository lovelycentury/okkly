import {
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  effect,
  inject,
  signal,
  untracked,
  type EmbeddedViewRef,
  type OutputEmitterRef,
  type Signal,
} from "@angular/core";
import { reflow } from "./transitions";

/** Where a transition is, as in react-transition-group. */
export type TransitionStatus = "unmounted" | "exited" | "entering" | "entered" | "exiting";

/** The six lifecycle moments a transition reports, each handed the animated element. */
export type TransitionPhase = "enter" | "entering" | "entered" | "exit" | "exiting" | "exited";

/**
 * What one kind of transition (`Fade`, `Grow`…) does to its element. The state
 * machine decides when; the runner decides how.
 */
export interface TransitionRunner {
  /** Puts the element in the resting style of a status that is not animating. */
  rest(node: HTMLElement, status: "entered" | "exited"): void;
  /**
   * Starts the enter from the exited style: sets the CSS `transition` and the
   * entered target. Returns how long it runs, in milliseconds.
   */
  enter(node: HTMLElement, appearing: boolean): number;
  /** Runs once the enter has finished. */
  entered?(node: HTMLElement): void;
  /** Starts the exit and returns how long it runs, in milliseconds. */
  exit(node: HTMLElement): number;
}

export interface TransitionOptions {
  /** Whether the element should be shown — MUI's `in`. */
  in: () => boolean;
  /** Whether an element that starts shown animates in on its first render. */
  appear: () => boolean;
  /** Keeps the element out of the DOM until it is first shown. */
  mountOnEnter: () => boolean;
  /** Takes the element out of the DOM once it has finished leaving. */
  unmountOnExit: () => boolean;
  runner: TransitionRunner;
  /** The animated element, once it is in the DOM. */
  node: () => HTMLElement | null | undefined;
  /** Puts the element in the DOM. Called before rendering, so it exists by the time the enter runs. */
  mount: () => void;
  /** Takes the element out of the DOM. */
  unmount: () => void;
  /** Reports each lifecycle moment, e.g. to the directive's outputs. */
  emit?: (phase: TransitionPhase, node: HTMLElement) => void;
}

/**
 * The react-transition-group `<Transition>` state machine the MUI-style
 * transitions run on, rebuilt on signals: mount → enter → entered → exit →
 * exited → (unmount). Must be called from an injection context.
 */
export function transitionStateMachine(options: TransitionOptions): Signal<TransitionStatus> {
  const status = signal<TransitionStatus>("unmounted");
  let initialized = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  // Pre-render: mount whatever the next frame needs, so it is rendered by the
  // time the post-render step below animates it.
  effect(() => {
    const shown = options.in();
    untracked(() => {
      const keepMounted = !options.mountOnEnter() && !options.unmountOnExit();
      if (shown || (!initialized && keepMounted)) options.mount();
    });
  });

  const performEnter = (node: HTMLElement, appearing: boolean) => {
    cancel();
    options.emit?.("enter", node);
    status.set("entering");
    const duration = options.runner.enter(node, appearing);
    options.emit?.("entering", node);
    timer = setTimeout(() => {
      timer = null;
      status.set("entered");
      options.runner.entered?.(node);
      options.emit?.("entered", node);
    }, duration);
  };

  const performExit = (node: HTMLElement) => {
    cancel();
    options.emit?.("exit", node);
    status.set("exiting");
    const duration = options.runner.exit(node);
    options.emit?.("exiting", node);
    timer = setTimeout(() => {
      timer = null;
      status.set("exited");
      options.runner.rest(node, "exited");
      options.emit?.("exited", node);
      if (options.unmountOnExit()) {
        options.unmount();
        status.set("unmounted");
      }
    }, duration);
  };

  // Post-render: the element is in the DOM with its bindings rendered, so it
  // can be measured and animated.
  afterRenderEffect(() => {
    const shown = options.in();
    untracked(() => {
      const node = options.node();
      if (!initialized) {
        initialized = true;
        if (!node) return;
        if (shown && options.appear()) {
          options.runner.rest(node, "exited");
          reflow(node);
          performEnter(node, true);
        } else {
          options.runner.rest(node, shown ? "entered" : "exited");
          status.set(shown ? "entered" : "exited");
        }
        return;
      }
      if (!node) return;
      const current = status();
      if (shown && current !== "entering" && current !== "entered") {
        // A freshly mounted element starts from the exited style.
        if (current === "unmounted") {
          options.runner.rest(node, "exited");
          reflow(node);
        }
        performEnter(node, false);
      } else if (!shown && (current === "entering" || current === "entered")) {
        performExit(node);
      }
    });
  });

  inject(DestroyRef).onDestroy(cancel);

  return status.asReadonly();
}

/** The six lifecycle outputs a transition directive exposes. */
export interface TransitionOutputs {
  enter: OutputEmitterRef<HTMLElement>;
  entering: OutputEmitterRef<HTMLElement>;
  entered: OutputEmitterRef<HTMLElement>;
  exit: OutputEmitterRef<HTMLElement>;
  exiting: OutputEmitterRef<HTMLElement>;
  exited: OutputEmitterRef<HTMLElement>;
}

/**
 * Runs a transition on the element a structural directive sits on
 * (`<div *okklyFade="open">`): the directive's template is stamped out into
 * its container, and its first element is what animates. `className` goes on
 * that element, as React's transitions merge theirs onto the child.
 *
 * Must be called from the directive's injection context.
 */
export function structuralTransition(
  options: Omit<TransitionOptions, "node" | "mount" | "unmount" | "emit"> & {
    className: () => string;
    outputs: TransitionOutputs;
  },
): Signal<TransitionStatus> {
  const template = inject(TemplateRef);
  const container = inject(ViewContainerRef);
  let view: EmbeddedViewRef<unknown> | null = null;

  const node = () =>
    view?.rootNodes.find((root): root is HTMLElement => root.nodeType === Node.ELEMENT_NODE);

  // The class list is kept in step with `className()` — Slide's changes with its direction.
  let appliedClasses: string[] = [];
  afterRenderEffect(() => {
    const classes = options.className().split(" ").filter(Boolean);
    untracked(() => {
      const element = node();
      if (!element) return;
      element.classList.remove(...appliedClasses);
      element.classList.add(...classes);
      appliedClasses = classes;
    });
  });

  return transitionStateMachine({
    ...options,
    node,
    mount: () => {
      if (view) return;
      view = container.createEmbeddedView(template);
      node()?.classList.add(...(appliedClasses = options.className().split(" ").filter(Boolean)));
    },
    unmount: () => {
      container.clear();
      view = null;
    },
    emit: (phase, element) => options.outputs[phase].emit(element),
  });
}
