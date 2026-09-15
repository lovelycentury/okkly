import { watchEffect } from "vue";

/**
 * Calls `handler` on every Escape keydown while `enabled()` reads `true` — the
 * Vue counterpart of `useEscapeKey` in `@okkly/react-hooks`. `enabled` is a
 * getter rather than a plain boolean so the reactive state it reads (props,
 * refs) is tracked and the listener is added and removed as that state
 * changes, instead of once on mount.
 */
export function useEscapeKey(
  handler: (event: KeyboardEvent) => void,
  enabled: () => boolean,
): void {
  watchEffect((onCleanup) => {
    if (!enabled()) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler(event);
    };
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });
}
