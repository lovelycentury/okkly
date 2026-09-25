import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from "@angular/core";
import { CHIP_GROUP_OPTION, type ChipGroupOptionState } from "../Chip/Chip";

export type ChipGroupColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/**
 * Turns an `okkly-chip` into a selectable option of the surrounding
 * `OkklyChipGroup`: `<okkly-chip okklyChipGroupOption="design" label="Design" />`.
 * The chip becomes a toggle button whose selected and disabled state come from
 * the group, and a click (or Enter/Space) toggles its value there.
 */
@Directive({
  selector: "okkly-chip[okklyChipGroupOption]",
  providers: [{ provide: CHIP_GROUP_OPTION, useExisting: OkklyChipGroupOption }],
  host: { "(click)": "toggle()" },
})
export class OkklyChipGroupOption implements ChipGroupOptionState {
  /** The value this option contributes to the group's `value`. */
  readonly value = input.required<string>({ alias: "okklyChipGroupOption" });

  private readonly group = inject(OkklyChipGroup);

  readonly selected = computed(() => this.group.isSelected(this.value()));
  readonly disabled = computed(() => this.group.disabled());

  protected toggle(): void {
    this.group.toggle(this.value());
  }
}

/**
 * A wrapping row of chips that manage single or multiple selection together.
 * Inputs mirror `@okkly/react`'s `<ChipGroup>` — `value`, `exclusive`,
 * `color`, `disabled` — and the shape follows Angular Material's
 * `mat-chip-listbox`: `[(value)]` binds the selection (a string when
 * `exclusive`, a string array otherwise) and the options are chips marked
 * `okklyChipGroupOption`.
 *
 * Deliberate gaps: React takes an `items` array with `onClick`/`onRemove`
 * callbacks and keeps `children` as an escape hatch. Here composition is the
 * only form — chips without `okklyChipGroupOption` are the escape hatch, and a
 * removable chip uses its own `removable` and `(removed)`. While `value` is
 * unset, each option keeps its own `selected`, as React's `item.selected` does.
 */
@Component({
  selector: "okkly-chip-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-chip-group",
    "[class]": "modifiers()",
    "[attr.role]": "hasOptions() ? 'group' : null",
  },
  template: "<ng-content />",
})
export class OkklyChipGroup {
  /**
   * Selected value(s) — a string when `exclusive`, a string array otherwise.
   * Two-way bindable as `[(value)]`.
   *
   * @default undefined
   */
  readonly value = model<string | string[] | undefined>(undefined);
  /**
   * Single-select mode.
   *
   * @default false
   */
  readonly exclusive = input(false, { transform: booleanAttribute });
  /**
   * Tone applied to selected chips.
   *
   * @default "primary"
   */
  readonly color = input<ChipGroupColor>("primary");
  /**
   * Disables every chip in the group.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly options = contentChildren(OkklyChipGroupOption);

  protected readonly hasOptions = computed(() => this.options().length > 0);

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "primary" && `okkly-chip-group--color-${this.color()}`,
      this.disabled() && "okkly-chip-group--disabled",
    ]
      .filter(Boolean)
      .join(" "),
  );

  /** Whether `optionValue` is selected, or `undefined` while the group holds no value. */
  isSelected(optionValue: string): boolean | undefined {
    const value = this.value();
    if (value === undefined) return undefined;
    return this.exclusive()
      ? value === optionValue
      : Array.isArray(value) && value.includes(optionValue);
  }

  /** Selects `optionValue`, or toggles it in and out when not `exclusive`. */
  toggle(optionValue: string): void {
    if (this.disabled()) return;
    if (this.exclusive()) {
      this.value.set(optionValue);
      return;
    }
    const current = Array.isArray(this.value()) ? (this.value() as string[]) : [];
    this.value.set(
      current.includes(optionValue)
        ? current.filter((entry) => entry !== optionValue)
        : [...current, optionValue],
    );
  }
}
