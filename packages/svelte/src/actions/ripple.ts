import type { Action } from "svelte/action";

export interface RippleOptions {
  /**
   * Whether the ripple effect is disabled.
   *
   * @default false
   */
  disabled?: boolean;
}

/**
 * Ripple feedback for a clickable element — the Svelte counterpart of
 * `useRipple` + `<Ripple>` in `@okkly/react`, collapsed into one action since
 * that is Svelte's primitive for "behaviour attached to an element".
 *
 * The overlay is created lazily on the first press and inserted as the node's
 * first child, so it paints behind whatever the node already renders. The node
 * must be `position: relative; overflow: hidden` — `.okkly-button` and friends
 * already are.
 *
 * ```svelte
 * <button class="okkly-component okkly-button" use:ripple={{ disabled }}>…</button>
 * ```
 */
export const ripple: Action<HTMLElement, RippleOptions | undefined> = (node, options = {}) => {
  let disabled = options.disabled ?? false;
  let overlay: HTMLElement | null = null;
  let isPointerDown = false;
  /**
   * Ripples whose animation finished while the pointer was still down. They
   * stay painted until release, so a held button reads as pressed.
   */
  const finished = new Set<HTMLElement>();

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("span");
    overlay.className = "okkly-component okkly-ripple";
    overlay.setAttribute("aria-hidden", "true");
    node.prepend(overlay);
    return overlay;
  }

  function start(event: PointerEvent) {
    // `:disabled` covers a native control, `[aria-disabled]` the anchor case —
    // so a caller only has to pass `disabled` through to the DOM.
    if (disabled || node.matches(":disabled, [aria-disabled='true']")) return;

    const rect = node.getBoundingClientRect();
    isPointerDown = true;

    const element = document.createElement("span");
    element.className = "okkly-ripple__element";
    element.style.setProperty("--okkly-ripple-left", `${event.clientX - rect.left}px`);
    element.style.setProperty("--okkly-ripple-top", `${event.clientY - rect.top}px`);
    element.addEventListener(
      "animationend",
      () => {
        if (isPointerDown) finished.add(element);
        else element.remove();
      },
      { once: true },
    );

    ensureOverlay().append(element);
  }

  function release() {
    if (!isPointerDown) return;
    isPointerDown = false;
    for (const element of finished) element.remove();
    finished.clear();
  }

  node.addEventListener("pointerdown", start);
  node.addEventListener("pointerup", release);
  node.addEventListener("pointerleave", release);
  node.addEventListener("pointercancel", release);

  return {
    update(next = {}) {
      disabled = next.disabled ?? false;
    },
    destroy() {
      node.removeEventListener("pointerdown", start);
      node.removeEventListener("pointerup", release);
      node.removeEventListener("pointerleave", release);
      node.removeEventListener("pointercancel", release);
      finished.clear();
      overlay?.remove();
      overlay = null;
    },
  };
};
