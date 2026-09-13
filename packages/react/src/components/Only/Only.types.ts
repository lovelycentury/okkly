import type { ReactNode } from "react";

export type OnlyBreakpoint = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";

export interface OnlyProps {
  /** Render children from this breakpoint upward (inclusive). */
  from?: OnlyBreakpoint;
  /** Render children up to this breakpoint (exclusive). */
  to?: OnlyBreakpoint;
  children?: ReactNode;
}
