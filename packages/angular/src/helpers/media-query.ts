import { DOCUMENT, effect, inject, signal, type Signal } from "@angular/core";

/**
 * Whether the viewport matches a CSS media query, kept current as it changes —
 * the counterpart of `@okkly/react-hooks`' `useMediaQuery`. The query is read
 * reactively, so it may depend on inputs; must be called in an injection
 * context. `false` until the first check, and wherever `matchMedia` is missing.
 */
export function mediaQuery(query: () => string): Signal<boolean> {
  const matches = signal(false);
  const view = inject(DOCUMENT).defaultView;
  effect((onCleanup) => {
    const list = view?.matchMedia?.(query());
    if (!list) return;
    matches.set(list.matches);
    const update = (event: MediaQueryListEvent) => matches.set(event.matches);
    list.addEventListener("change", update);
    onCleanup(() => list.removeEventListener("change", update));
  });
  return matches.asReadonly();
}
