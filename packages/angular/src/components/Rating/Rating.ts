import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from "@angular/core";

export type RatingSize = "small" | "medium" | "large";
export type RatingColor = "warning" | "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type RatingIcon = "star" | "heart";
export type RatingPrecision = 0.5 | 1;

/** How much of one glyph is filled. */
type GlyphKind = "full" | "half" | "empty";

/**
 * Replaces the built-in glyph: `<ng-template okklyRatingIcon>…</ng-template>`.
 * Stamped once per glyph (twice for a half one), so it is a template rather
 * than projected content.
 */
@Directive({ selector: "ng-template[okklyRatingIcon]" })
export class OkklyRatingIcon {
  readonly template = inject(TemplateRef);
}

const STAR_PATH =
  "M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.77l-5.86 3.08 1.12-6.54-4.75-4.63 6.56-.95L12 2.5z";
const HEART_PATH =
  "M12 21s-6.5-4.35-9-8.35C1.5 10.5 2.5 6.5 6 5.5c2-.6 4 .5 6 2.5 2-2 4-3.1 6-2.5 3.5 1 4.5 5 3 7.15C18.5 16.65 12 21 12 21z";

function defaultGetLabelText(value: number): string {
  return `${value} Star${value !== 1 ? "s" : ""}`;
}

/**
 * A row of stars (or hearts) to show or pick a score. Inputs follow MUI's
 * Rating, as `@okkly/react`'s `<Rating>` does — `value`, `max`, `precision`,
 * `size`, `color`, `icon`, `readOnly`, `disabled`, `label`, `name`,
 * `getLabelText`.
 *
 * Deliberate gaps: `value` is a `model<number | null>()` (`[(value)]`)
 * standing in for React's `value`/`defaultValue` + `onChange`. A custom glyph
 * is an `okklyRatingIcon` template rather than a node passed to `icon`, and
 * `label` is text.
 */
@Component({
  selector: "okkly-rating",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  host: {
    class: "okkly-component okkly-rating",
    "[class]": "modifiers()",
    "[attr.role]": "interactive() ? 'radiogroup' : 'img'",
    "[attr.aria-label]": "interactive() ? null : displayValue() + ' of ' + max()",
    "[attr.name]": "null",
    "(mouseleave)": "hoverValue.set(null)",
  },
  templateUrl: "./Rating.html",
})
export class OkklyRating {
  /**
   * Current score, `null` for none. Two-way bindable as `[(value)]`.
   *
   * @default null
   */
  readonly value = model<number | null>(null);
  /**
   * Number of glyphs.
   *
   * @default 5
   */
  readonly max = input(5, { transform: numberAttribute });
  /**
   * Smallest step a score can take: half glyphs (`0.5`) or whole ones (`1`).
   *
   * @default 0.5
   */
  readonly precision = input<RatingPrecision, unknown>(0.5, {
    transform: (value) => (numberAttribute(value, 0.5) === 1 ? 1 : 0.5),
  });
  /**
   * Glyph size.
   *
   * @default "medium"
   */
  readonly size = input<RatingSize>("medium");
  /**
   * Fill colour — the default gold is `--okkly-feedback-warning`.
   *
   * @default "warning"
   */
  readonly color = input<RatingColor>("warning");
  /**
   * Built-in glyph. An `okklyRatingIcon` template wins over it.
   *
   * @default "star"
   */
  readonly icon = input<RatingIcon>("star");
  /**
   * Display only — no hover or click.
   *
   * @default false
   */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /**
   * Non-interactive and dimmed.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Trailing summary, e.g. "4.8 · 128 reviews".
   *
   * @default undefined
   */
  readonly label = input<string>();
  /**
   * Set on each interactive glyph button, for form grouping.
   *
   * @default undefined
   */
  readonly name = input<string>();
  /**
   * Accessible name of each glyph button, from the score it picks.
   *
   * @default "1 Star", "2 Stars", …
   */
  readonly getLabelText = input<(value: number) => string>(defaultGetLabelText);

  protected readonly customIcon = contentChild(OkklyRatingIcon);
  protected readonly hoverValue = signal<number | null>(null);

  protected readonly interactive = computed(() => !this.readOnly() && !this.disabled());
  protected readonly displayValue = computed(() => this.hoverValue() ?? this.value() ?? 0);
  protected readonly glyphs = computed(() => {
    const display = this.displayValue();
    return Array.from({ length: this.max() }, (_, index): GlyphKind => {
      const position = index + 1;
      if (display >= position) return "full";
      if (display >= position - 0.5) return "half";
      return "empty";
    });
  });

  protected readonly glyphPath = computed(() => (this.icon() === "heart" ? HEART_PATH : STAR_PATH));

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "warning" && `okkly-rating--color-${this.color()}`,
      this.size() !== "medium" && `okkly-rating--${this.size()}`,
      this.readOnly() && "okkly-rating--read-only",
      this.disabled() && "okkly-rating--disabled",
    ]
      .filter(Boolean)
      .join(" "),
  );

  private valueFromPointer(event: MouseEvent, index: number): number {
    if (this.precision() === 1) return index + 1;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    return ratio <= 0.5 ? index + 0.5 : index + 1;
  }

  protected onClick(event: MouseEvent, index: number): void {
    if (!this.interactive()) return;
    const next = this.valueFromPointer(event, index);
    this.value.set(next === this.value() ? null : next);
  }

  protected onMove(event: MouseEvent, index: number): void {
    if (!this.interactive()) return;
    this.hoverValue.set(this.valueFromPointer(event, index));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) return;
    const step = this.precision();
    const base = this.value() ?? 0;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      this.value.set(Math.min(this.max(), base + step));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      this.value.set(Math.max(0, base - step) || null);
    }
  }
}
