import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  type EmbeddedViewRef,
} from "@angular/core";
import { mediaQuery } from "../../helpers/media-query";

export type OnlyBreakpoint = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";

/** A viewport range: `from` inclusive, `to` exclusive, either optional. */
export interface OnlyRange {
  /** Render from this breakpoint upward (inclusive). */
  from?: OnlyBreakpoint;
  /** Render up to this breakpoint (exclusive). */
  to?: OnlyBreakpoint;
}

// Mirrors $breakpoints in packages/design-system/src/styles/breakpoints.scss —
// keep the two in sync when a breakpoint value changes.
const BREAKPOINT_PX: Record<OnlyBreakpoint, number> = {
  "2xs": 320,
  xs: 577,
  sm: 769,
  md: 993,
  lg: 1441,
  xl: 1921,
};

function buildQuery(from: OnlyBreakpoint | undefined, to: OnlyBreakpoint | undefined): string {
  const conditions: string[] = [];
  if (from) conditions.push(`(min-width: ${BREAKPOINT_PX[from]}px)`);
  if (to) conditions.push(`(max-width: ${BREAKPOINT_PX[to] - 1}px)`);
  return conditions.length > 0 ? conditions.join(" and ") : "all";
}

/**
 * Renders its element only while the viewport is within `[from, to)` — the
 * counterpart of `@okkly/react`'s `<Only>`, whose `from` and `to` it takes.
 * Omit `from` for "up to `to`", omit `to` for "`from` and up", omit both to
 * always render. Unlike CSS-based hiding, content outside the range is never
 * created.
 *
 * A structural directive rather than a component, since projected content is
 * always created with its parent: `*okklyOnly="{ from: 'sm', to: 'md' }"`, or
 * `<ng-template okklyOnly [okklyOnlyFrom]="…" [okklyOnlyTo]="…">`.
 */
@Directive({ selector: "[okklyOnly]" })
export class OkklyOnly {
  /**
   * The range, as `{ from, to }`. A bare `*okklyOnly` always renders.
   *
   * @default undefined
   */
  readonly range = input<OnlyRange | "" | null | undefined>(undefined, { alias: "okklyOnly" });
  /**
   * Render from this breakpoint upward (inclusive). Wins over `range.from`.
   *
   * @default undefined
   */
  readonly from = input<OnlyBreakpoint>(undefined, { alias: "okklyOnlyFrom" });
  /**
   * Render up to this breakpoint (exclusive). Wins over `range.to`.
   *
   * @default undefined
   */
  readonly to = input<OnlyBreakpoint>(undefined, { alias: "okklyOnlyTo" });

  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  private view: EmbeddedViewRef<unknown> | undefined;

  private readonly query = computed(() => {
    const range = this.range() || {};
    return buildQuery(this.from() ?? range.from, this.to() ?? range.to);
  });
  private readonly matches = mediaQuery(() => this.query());

  constructor() {
    effect(() => {
      if (this.matches() && !this.view) {
        this.view = this.container.createEmbeddedView(this.template);
      } else if (!this.matches() && this.view) {
        this.container.clear();
        this.view = undefined;
      }
    });
  }
}
