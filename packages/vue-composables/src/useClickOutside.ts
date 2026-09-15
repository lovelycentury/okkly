import { watchEffect, type Ref } from "vue";

/**
 * Calls `handler` for a `mousedown` whose target lands outside `elementRef`,
 * while `enabled()` reads `true` — the Vue counterpart of `useClickOutside` in
 * `@okkly/react-hooks`. `elementRef` is read at click time, not tracked, so a
 * template ref that is still `null` on the first reactive run is not a problem.
 */
export function useClickOutside<T extends HTMLElement>(
  elementRef: Ref<T | null | undefined>,
  handler: (event: MouseEvent) => void,
  enabled: () => boolean,
): void {
  watchEffect((onCleanup) => {
    if (!enabled()) return;
    const onPointerDown = (event: MouseEvent) => {
      const element = elementRef.value;
      if (element && !element.contains(event.target as Node)) {
        handler(event);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    onCleanup(() => document.removeEventListener("mousedown", onPointerDown));
  });
}
