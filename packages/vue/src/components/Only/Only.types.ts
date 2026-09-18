export type OnlyBreakpoint = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Mounts its default slot only while the viewport falls within `[from, to)`.
 * Props mirror `@okkly/react`'s `<Only>` name-for-name: `from`/`to`.
 *
 * Vue-forced difference: `children` becomes the default slot, since Vue has
 * no `ReactNode`.
 */
export interface OnlyProps {
  /** Render the default slot from this breakpoint upward (inclusive). */
  from?: OnlyBreakpoint;
  /** Render the default slot up to this breakpoint (exclusive). */
  to?: OnlyBreakpoint;
}
