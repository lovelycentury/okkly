import { ref, watchEffect, type Ref } from "vue";

export interface UseMediaQueryOptions {
  /** Value read before the query can be measured (SSR, or no `matchMedia`). Defaults to `false`. */
  defaultMatches?: boolean;
  /** Override for `window.matchMedia`, mainly for testing. */
  matchMedia?: (query: string) => MediaQueryList;
}

function resolveMatchMedia(
  options: UseMediaQueryOptions,
): ((query: string) => MediaQueryList) | undefined {
  if (options.matchMedia) return options.matchMedia;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia.bind(window);
  }
  return undefined;
}

/**
 * Subscribes to a CSS media query — the Vue counterpart of `useMediaQuery` in
 * `@okkly/react-hooks`. `query` is a getter rather than a plain string so a
 * reactive query (built from props) re-subscribes automatically when it
 * changes, instead of only on mount.
 */
export function useMediaQuery(
  query: () => string,
  options: UseMediaQueryOptions = {},
): Ref<boolean> {
  const { defaultMatches = false } = options;
  const matches = ref(defaultMatches);

  watchEffect((onCleanup) => {
    const matchMedia = resolveMatchMedia(options);
    if (!matchMedia) {
      matches.value = defaultMatches;
      return;
    }
    const mediaQueryList = matchMedia(query());
    matches.value = mediaQueryList.matches;
    const onChange = () => {
      matches.value = mediaQueryList.matches;
    };
    mediaQueryList.addEventListener("change", onChange);
    onCleanup(() => mediaQueryList.removeEventListener("change", onChange));
  });

  return matches;
}
