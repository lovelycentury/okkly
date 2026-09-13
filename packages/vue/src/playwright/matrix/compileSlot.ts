import { compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import type { Slot, VNode } from "vue";

/**
 * Turns raw slot markup into a slot function — what Playwright's Vue `mount()`
 * does with its `slots` option (this mirrors its `__pwCreateSlot`). The fast
 * matrix path renders every cell inside `ScreenshotMatrix.vue` instead of
 * through `mount()`, so it has to compile the markup itself. Runs in the
 * browser, never in the Node test runner.
 */
export const compileSlot = (markup: string): Slot => {
  // The compiler only emits slot functions for a component invocation, so the
  // markup becomes the default slot of a built-in (which needs no resolving)
  // and that slot is picked back out of the rendered vnode.
  const { code } = compile(`<transition><template #default>${markup}</template></transition>`, {
    mode: "function",
    prefixIdentifiers: false,
  });
  const render = new Function("Vue", code)(Vue) as (context: object) => VNode;

  return () => (render({}).children as Record<string, Slot>).default!();
};
