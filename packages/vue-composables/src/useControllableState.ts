import { computed, ref, type ComputedRef } from "vue";

export interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

export interface UseControllableStateReturn<T> {
  value: ComputedRef<T>;
  setValue: (next: T) => void;
}

/**
 * The Vue port of `@okkly/react-hooks`'s `useControllableState`: a value that
 * is controlled when `options().value` is not `undefined`, and otherwise
 * falls back to an internal ref seeded from `defaultValue` — read once, on
 * first call, exactly like React's `useState(defaultValue)` initializer.
 *
 * `options` is a getter, called fresh whenever the composable needs it, since
 * a `setup()` body — unlike a React hook's — runs only once rather than every
 * render. `setValue` never writes to the internal ref while controlled, and it
 * only calls `onChange` in response to an actual `setValue` call — never on
 * its own, so mounting this produces no spurious `onChange` call the way
 * eagerly seeding a `defineModel` from `defaultValue` would.
 */
export function useControllableState<T>(
  options: () => UseControllableStateOptions<T>,
): UseControllableStateReturn<T> {
  const uncontrolled = ref(options().defaultValue) as unknown as { value: T };

  const value = computed<T>(() => {
    const opts = options();
    return opts.value !== undefined ? opts.value : uncontrolled.value;
  });

  function setValue(next: T) {
    const opts = options();
    if (opts.value === undefined) uncontrolled.value = next;
    opts.onChange?.(next);
  }

  return { value, setValue };
}
