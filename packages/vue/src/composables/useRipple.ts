import { onMounted, ref, shallowRef, type Ref } from "vue";

export interface RippleInstance {
  left: string;
  top: string;
  animationEnded: boolean;
}

type PointerLikeEvent = { clientX: number; clientY: number };

// Keyed by native event name, the shape `v-on="events"` expects — not React's
// `onMouseDown` prop naming.
type TouchRippleEvents = {
  touchstart: (event: TouchEvent) => void;
  touchend: () => void;
  touchcancel: () => void;
};

type MouseRippleEvents = {
  mousedown: (event: MouseEvent) => void;
  mouseleave: () => void;
  mouseup: () => void;
};

export interface UseRippleReturn {
  ripples: Ref<Map<string, RippleInstance>>;
  events: Ref<TouchRippleEvents | MouseRippleEvents>;
  hideRipple: (id: string | undefined) => void;
}

/**
 * Tracks ripple circles for a clickable element — the Vue counterpart of
 * `useRipple` in `@okkly/react-hooks`. `containerRef` is measured for
 * click-relative coordinates, usually the element the ripple overlay paints
 * into. Bind `events` with `v-on` onto whichever element receives the
 * mouse/touch input.
 */
export function useRipple(containerRef: Ref<HTMLElement | null | undefined>): UseRippleReturn {
  let isPointerDown = false;
  const ripples = ref(new Map<string, RippleInstance>());

  function startRipple(point: PointerLikeEvent) {
    const rect = containerRef.value?.getBoundingClientRect();
    if (!rect) return;
    isPointerDown = true;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    ripples.value.set(id, {
      left: `${point.clientX - rect.left}px`,
      top: `${point.clientY - rect.top}px`,
      animationEnded: false,
    });
  }

  function hideRipple(id: string | undefined) {
    if (!id) return;
    const ripple = ripples.value.get(id);
    if (!ripple) return;
    // While the pointer is still down the ripple stays painted, so a held
    // button reads as pressed; release clears everything that has finished.
    if (isPointerDown) ripples.value.set(id, { ...ripple, animationEnded: true });
    else ripples.value.delete(id);
  }

  function hideRipples() {
    isPointerDown = false;
    for (const [id, ripple] of ripples.value) {
      if (ripple.animationEnded) ripples.value.delete(id);
    }
  }

  const events = shallowRef<TouchRippleEvents | MouseRippleEvents>({
    mousedown: (event: MouseEvent) => startRipple(event),
    mouseleave: hideRipples,
    mouseup: hideRipples,
  });

  onMounted(() => {
    if (!window.matchMedia?.("(pointer: none)").matches) return;
    events.value = {
      touchstart: (event: TouchEvent) => event.touches[0] && startRipple(event.touches[0]),
      touchend: hideRipples,
      touchcancel: hideRipples,
    };
  });

  return { ripples, events, hideRipple };
}
