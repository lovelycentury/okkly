import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  afterRenderEffect,
  effect,
  input,
  output,
  untracked,
  viewChild,
  type ElementRef,
} from "@angular/core";

// Matches `--okkly-time-picker-row-height`'s default (2.5rem @ 16px root) —
// only used when the real rendered height can't be measured (e.g. a headless
// test environment with no layout engine, which always reports 0).
const FALLBACK_ROW_HEIGHT = 40;

/** `Element.scrollTo` isn't implemented everywhere — fall back to a plain jump. */
function scrollElementTo(el: HTMLElement, top: number, behavior: ScrollBehavior): void {
  if (typeof el.scrollTo === "function") el.scrollTo({ top, behavior });
  else el.scrollTop = top;
}

/**
 * One scrollable value list (hours, minutes, or AM/PM) inside `OkklyTimePicker`
 * — a plain, MUI `MultiSectionDigitalClock`-style column: uniform rows, the
 * selected one picked out with a filled pill, no wheel/fisheye effect. Built
 * on native scrolling with CSS `scroll-snap` rather than a drag library, so
 * the browser's own touch/trackpad momentum gives the "coast to a stop on a
 * value" feel for free.
 *
 * Internal — not exported from the package, mirrors react's/vue's private
 * `WheelColumn`.
 */
@Component({
  selector: "div[okklyTimePickerColumn]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-time-picker__column",
    role: "spinbutton",
    tabindex: "0",
    "[attr.aria-label]": "ariaLabel()",
    "[attr.aria-valuenow]": "value()",
    "[attr.aria-valuemin]": "values()[0]",
    "[attr.aria-valuemax]": "values()[values().length - 1]",
    "[attr.aria-valuetext]": "formatValue()(value())",
    "(keydown)": "onKeydown($event)",
  },
  templateUrl: "./WheelColumn.html",
})
export class OkklyTimePickerColumn {
  readonly values = input.required<readonly number[]>();
  readonly value = input.required<number>();
  readonly formatValue = input.required<(value: number) => string>();
  readonly ariaLabel = input.required<string>();
  readonly valueChange = output<number>();

  private readonly viewportRef = viewChild.required<ElementRef<HTMLDivElement>>("viewport");

  private rowHeight = FALLBACK_ROW_HEIGHT;
  // Always holds "the value we last told the outside world about" — compared
  // against in the sync effect below to tell a change apart as self-inflicted
  // (already scrolled, or mid-gesture) vs. genuinely external. `null` until
  // that effect's first run has captured the starting value — a required
  // signal input throws if read synchronously in the constructor, so this
  // can't be seeded any earlier than the effect's own first pass.
  private lastReported: number | null = null;
  // The scrollTop a smooth scroll *we* started is heading for. While set, the
  // scroll listener ignores every intermediate position — otherwise the rows
  // crossed on the way get committed as values (e.g. switching `format` from
  // 13:00 re-dials the hour from row 13 to row 0 and emits 12, 11, 10…, and a
  // ResizeObserver re-centre mid-animation could strand it on one of them).
  private programmaticTarget: number | null = null;

  constructor() {
    // Land on the initial value with no animation, and measure the real
    // rendered row height before the first paint (CSS sizes it in `rem`, so a
    // hardcoded pixel constant would drift with the root font size). Reads
    // `value`/`values` through `untracked` — this must run once on mount, not
    // on every value change (the sync effect below owns that). Re-measures on
    // resize too — `DateTimePicker` pushes a taller viewport in via a CSS var
    // once it has measured a `Calendar` beside it — and re-centres the value.
    afterRenderEffect((onCleanup) => {
      const el = this.viewportRef().nativeElement;
      const measure = () => {
        const row = el.querySelector<HTMLElement>(".okkly-time-picker__slide");
        if (row?.offsetHeight) this.rowHeight = row.offsetHeight;
      };
      measure();
      el.scrollTop = untracked(() => this.targetScrollTop(this.indexOf(this.value())));

      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(() => {
        measure();
        // A hard jump supersedes any smooth scroll still in flight.
        this.programmaticTarget = null;
        el.scrollTop = untracked(() => this.targetScrollTop(this.indexOf(this.value())));
      });
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    });

    // The list's native drag/momentum/snap does all the "inertia" work by
    // itself — this only turns the settled scroll position back into a value
    // (as soon as a new row crosses center, not just once scrolling fully
    // stops). Runs once on mount; the closures below read signals lazily when
    // the browser actually fires the events, which is not a reactive read.
    afterRenderEffect((onCleanup) => {
      const el = this.viewportRef().nativeElement;
      const update = () => {
        const target = this.programmaticTarget;
        if (target !== null) {
          if (Math.abs(el.scrollTop - target) > 1) return;
          this.programmaticTarget = null;
        }
        const values = untracked(this.values);
        const centered = el.scrollTop / this.rowHeight;
        const nearestIndex = Math.min(Math.max(Math.round(centered), 0), values.length - 1);
        const nearest = values[nearestIndex];
        if (nearest !== undefined && nearest !== this.lastReported) {
          this.lastReported = nearest;
          this.valueChange.emit(nearest);
        }
      };
      // Any real gesture hands control back to the user mid-animation.
      const releaseToUser = () => {
        this.programmaticTarget = null;
      };
      const userEvents = ["wheel", "touchstart", "pointerdown"] as const;
      el.addEventListener("scroll", update, { passive: true });
      for (const type of userEvents) el.addEventListener(type, releaseToUser, { passive: true });
      onCleanup(() => {
        el.removeEventListener("scroll", update);
        for (const type of userEvents) el.removeEventListener(type, releaseToUser);
      });
    });

    // Reacts to *externally*-driven value changes only. A run whose `value`
    // already matches `lastReported` was caused by us (the scroll listener
    // above, or `commitIndex` below, both update that field right before
    // emitting) — the scroll position is already correct, or the user's
    // gesture is still in progress and must not be interrupted.
    // Force-scrolling on every self-inflicted run is what made scrolling feel
    // robotic: it fought the browser's own momentum on every row crossed
    // mid-drag.
    effect(() => {
      const value = this.value();
      this.values(); // re-run when the value set itself changes too (e.g. `step`)
      // First run ever: nothing has scrolled yet (the mount effect above owns
      // that, unanimated) — just capture the starting point, matching react's
      // `useRef(value)` starting equal to the initial value.
      if (this.lastReported === null) {
        this.lastReported = value;
        return;
      }
      const isSelfInflicted = value === this.lastReported;
      this.lastReported = value;
      if (isSelfInflicted) return;
      const el = this.viewportRef().nativeElement;
      const index = this.indexOf(value);
      if (Math.abs(el.scrollTop - this.targetScrollTop(index)) > 1) {
        this.smoothScrollToIndex(el, index);
      }
    });
  }

  protected indexOf(v: number): number {
    return Math.max(this.values().indexOf(v), 0);
  }

  // The list carries half a viewport of padding at each end (see
  // `__column-container` in the SCSS), so centring row `i` is exactly
  // `i * rowHeight` — every value can reach the middle, ends included.
  private targetScrollTop(index: number): number {
    return index * this.rowHeight;
  }

  private smoothScrollToIndex(el: HTMLElement, index: number): void {
    const top = this.targetScrollTop(index);
    this.programmaticTarget = top;
    scrollElementTo(el, top, "smooth");
  }

  // Click/keyboard commit the value directly instead of only nudging the
  // scroll position and waiting for the scroll listener above to notice —
  // that listener depends on real layout that headless test environments
  // don't provide.
  protected commitIndex(index: number): void {
    const next = this.values()[index];
    if (next === undefined) return;
    this.lastReported = next;
    this.valueChange.emit(next);
    const el = this.viewportRef().nativeElement;
    this.smoothScrollToIndex(el, index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    // ARIA authoring practice for role="spinbutton": Up increases, Down decreases.
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.step(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      this.step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      this.commitIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      this.commitIndex(this.values().length - 1);
    }
  }

  private step(delta: number): void {
    const next = Math.min(
      Math.max(this.indexOf(this.value()) + delta, 0),
      this.values().length - 1,
    );
    this.commitIndex(next);
  }

  protected isSelected(v: number): boolean {
    return v === this.value();
  }
}
