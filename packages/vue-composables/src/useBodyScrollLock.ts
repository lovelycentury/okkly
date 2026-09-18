import { watchEffect } from "vue";

/**
 * Locks `document.body` scrolling while `enabled()` reads `true`, restoring
 * whatever the previous `overflow` was once it stops — the Vue counterpart of
 * `useBodyScrollLock` in `@okkly/react-hooks`.
 */
export function useBodyScrollLock(enabled: () => boolean): void {
  watchEffect((onCleanup) => {
    if (!enabled()) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    onCleanup(() => {
      document.body.style.overflow = previous;
    });
  });
}
