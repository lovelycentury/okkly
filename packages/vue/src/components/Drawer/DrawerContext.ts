import { inject, type InjectionKey } from "vue";
import type { DrawerState } from "./Drawer.types";

export const DrawerStateKey: InjectionKey<DrawerState> = Symbol("DrawerState");

/**
 * The state of the enclosing `Drawer`, for content that renders differently
 * in the `mini` short view — icons with tooltips instead of labels, say. The
 * `okkly-drawer--mini` class on the drawer root covers the CSS-only case.
 */
export function useDrawerState(): DrawerState {
  const state = inject(DrawerStateKey);
  if (!state) throw new Error("useDrawerState must be used within Drawer");
  return state;
}
