import { watchEffect, type Ref } from "vue";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapOptions {
  /**
   * Move focus to the first focusable child once the trap engages. Separated
   * from `enabled` because `Modal` splits the two: `disableAutoFocus` keeps
   * the Tab loop while leaving the caller's own initial focus alone.
   *
   * @default true
   */
  autoFocus?: boolean;
}

/**
 * Confines Tab/Shift+Tab to the focusable children of `containerRef` while
 * `enabled()` reads `true` — the Vue counterpart of `useFocusTrap` in
 * `@okkly/react-hooks`. Runs post-flush so a template ref that only exists
 * once its `v-if` branch renders is already attached by the time the trap
 * looks for it.
 */
export function useFocusTrap(
  containerRef: Ref<HTMLElement | null | undefined>,
  enabled: () => boolean,
  { autoFocus = true }: UseFocusTrapOptions = {},
): void {
  watchEffect(
    (onCleanup) => {
      if (!enabled() || !containerRef.value) return;
      const container = containerRef.value;
      if (autoFocus) {
        const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
        focusable[0]?.focus();
      }

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab") return;
        const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
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

      container.addEventListener("keydown", onKeyDown);
      onCleanup(() => container.removeEventListener("keydown", onKeyDown));
    },
    { flush: "post" },
  );
}
