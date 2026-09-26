import { DOCUMENT, afterRenderEffect, effect, inject } from "@angular/core";

/**
 * The overlay plumbing `@okkly/react` attaches with hooks and `@okkly/vue`
 * with composables. Each one is a function called from a component's injection
 * context, taking its `enabled` flag as a getter so the signals it reads are
 * tracked and the listener is added and removed as that state changes, rather
 * than once on construction.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Calls `handler` on every Escape keydown while `enabled()` reads `true`. */
export function onEscapeKey(handler: (event: KeyboardEvent) => void, enabled: () => boolean): void {
  const document = inject(DOCUMENT);
  effect((onCleanup) => {
    if (!enabled()) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler(event);
    };
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });
}

/**
 * Calls `handler` for a `mousedown` whose target lands outside `element()`,
 * while `enabled()` reads `true`. `element` is read at click time rather than
 * tracked, so a view query that is still empty on the first reactive run is
 * not a problem.
 */
export function onClickOutside(
  element: () => HTMLElement | null | undefined,
  handler: (event: MouseEvent) => void,
  enabled: () => boolean,
): void {
  const document = inject(DOCUMENT);
  effect((onCleanup) => {
    if (!enabled()) return;
    const onPointerDown = (event: MouseEvent) => {
      const node = element();
      if (node && !node.contains(event.target as Node)) handler(event);
    };
    document.addEventListener("mousedown", onPointerDown);
    onCleanup(() => document.removeEventListener("mousedown", onPointerDown));
  });
}

export interface TrapFocusOptions {
  /**
   * Move focus to the first focusable child once the trap engages. Separated
   * from `enabled` because `OkklyModal` splits the two: `disableAutoFocus`
   * keeps the Tab loop while leaving the caller's own initial focus alone.
   */
  autoFocus?: () => boolean;
}

/**
 * Confines Tab/Shift+Tab to the focusable children of `container()` while
 * `enabled()` reads `true`. Runs after render, so an element that only exists
 * once its `@if` branch renders is already attached when the trap looks for it.
 */
export function trapFocus(
  container: () => HTMLElement | null | undefined,
  enabled: () => boolean,
  { autoFocus }: TrapFocusOptions = {},
): void {
  const document = inject(DOCUMENT);
  afterRenderEffect((onCleanup) => {
    const node = container();
    if (!enabled() || !node) return;

    if (autoFocus?.() ?? true) {
      node.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    onCleanup(() => node.removeEventListener("keydown", onKeyDown));
  });
}

/**
 * Locks `document.body` scrolling while `enabled()` reads `true`, restoring
 * whatever the previous `overflow` was once it stops.
 */
export function lockBodyScroll(enabled: () => boolean): void {
  const document = inject(DOCUMENT);
  effect((onCleanup) => {
    if (!enabled()) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    onCleanup(() => {
      document.body.style.overflow = previous;
    });
  });
}
