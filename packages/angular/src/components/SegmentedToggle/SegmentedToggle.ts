import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from "@angular/core";
import { OkklyIcon, type IconSource } from "../Icon/Icon";

export type SegmentedToggleColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/** One segment of the toggle. */
export interface SegmentedToggleItem {
  /** What the segment selects. */
  value: string;
  /** Visible text. */
  label?: string;
  /**
   * Leading glyph: raw SVG markup (an `@okkly/icons` export), or a template for
   * anything else. Decorative — hidden from assistive tech.
   */
  icon?: IconSource | TemplateRef<unknown>;
  /** Accessible name of an icon-only segment. */
  ariaLabel?: string;
  /** Disables this segment alone. */
  disabled?: boolean;
}

/**
 * A row of connected segments for view modes, filters or short option sets —
 * one active at a time, or several as a toggle group. Inputs follow MUI's
 * ToggleButtonGroup, as `@okkly/react`'s `<SegmentedToggle>` does — `items`,
 * `value`, `exclusive`, `color`, `disabled`; Angular Material's
 * `mat-button-toggle-group` is the same idea.
 *
 * Deliberate gaps: `value` is a `model()` (`[(value)]`) standing in for
 * React's `value`/`defaultValue` + `onChange` — a string when `exclusive`, an
 * array otherwise. An item's `icon` is raw SVG markup or a `TemplateRef`, and
 * `label` is text. Items take an `ariaLabel`, which React's lack, so an
 * icon-only segment can be named.
 */
@Component({
  selector: "okkly-segmented-toggle",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, OkklyIcon],
  host: {
    class: "okkly-component okkly-segmented-toggle",
    "[class]": "modifiers()",
    role: "group",
  },
  templateUrl: "./SegmentedToggle.html",
})
export class OkklySegmentedToggle {
  /**
   * The segments.
   *
   * @default []
   */
  readonly items = input<readonly SegmentedToggleItem[]>([]);
  /**
   * The selection — a value when `exclusive`, an array of values otherwise. Two-way bindable as `[(value)]`.
   *
   * @default undefined
   */
  readonly value = model<string | string[] | undefined>(undefined);
  /**
   * Only one segment active at a time.
   *
   * @default true
   */
  readonly exclusive = input(true, { transform: booleanAttribute });
  /**
   * Tone of the active segment.
   *
   * @default "primary"
   */
  readonly color = input<SegmentedToggleColor>("primary");
  /**
   * Disables every segment.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "primary" && `okkly-segmented-toggle--color-${this.color()}`,
      this.disabled() && "okkly-segmented-toggle--disabled",
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected isActive(segmentValue: string): boolean {
    const current = this.value();
    if (this.exclusive()) return current === segmentValue;
    return Array.isArray(current) && current.includes(segmentValue);
  }

  protected isTemplate(icon: SegmentedToggleItem["icon"]): icon is TemplateRef<unknown> {
    return icon instanceof TemplateRef;
  }

  protected select(segmentValue: string): void {
    if (this.exclusive()) {
      this.value.set(segmentValue);
      return;
    }
    const current = this.value();
    const selected = Array.isArray(current) ? [...current] : [];
    const index = selected.indexOf(segmentValue);
    if (index >= 0) selected.splice(index, 1);
    else selected.push(segmentValue);
    this.value.set(selected);
  }
}
