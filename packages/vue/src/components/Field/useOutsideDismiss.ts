import { watchEffect, type Ref } from "vue";

/**
 * Closes a dropdown when a pointer press lands outside every element in
 * `refs`. The Vue port of the identically-named hook in `@okkly/react`'s
 * `Field` folder.
 *
 * `useClickOutside` from `@okkly/vue-composables` takes a single ref, which is
 * not enough here: the field and its popup are in different DOM trees (the
 * popup is portaled), so "outside" means outside *both*. Autocomplete and,
 * later, Select share this instead of each growing its own copy.
 *
 * Listens on `mousedown` rather than `click` so the popup closes on press —
 * matching how native menus feel, and avoiding a click that started inside
 * the popup but ended outside being read as a dismissal.
 */
export function useOutsideDismiss(
  refs: Ref<HTMLElement | null | undefined>[],
  enabled: () => boolean,
  onDismiss: (event: MouseEvent) => void,
): void {
  watchEffect((onCleanup) => {
    if (!enabled()) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.value?.contains(target))) return;
      onDismiss(event);
    };

    document.addEventListener("mousedown", handlePointerDown);
    onCleanup(() => document.removeEventListener("mousedown", handlePointerDown));
  });
}
