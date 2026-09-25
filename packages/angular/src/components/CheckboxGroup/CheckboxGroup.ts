import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from "@angular/core";
import {
  CHECKBOX_GROUP,
  type CheckboxColor,
  type CheckboxGroupState,
  type CheckboxSize,
} from "../Checkbox/Checkbox";

let nextId = 0;

/**
 * A labelled set of checkboxes that share one question. Inputs mirror
 * `@okkly/react`'s `<CheckboxGroup>` name-for-name — `name`, `value`,
 * `disabled`, `size`, `color`, `label` — and, as there, `okkly-checkbox`
 * children are nested directly and pick the group up (through DI here, a
 * context in React): their `value` selects the option, and the group owns
 * the selection array.
 *
 * Deliberate gaps: React's `value`/`defaultValue`/`onChange` trio is one
 * `model()`, so `[(value)]` binds the selection and a one-way `[value]` is
 * just its starting point — the group, like Angular Material's controls,
 * keeps what the user picks either way.
 */
@Component({
  selector: "okkly-checkbox-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CHECKBOX_GROUP, useExisting: OkklyCheckboxGroup }],
  host: {
    class: "okkly-component okkly-checkbox-group",
    role: "group",
    "[attr.aria-label]": "label() || null",
    // `name` belongs to the nested inputs, not to this element.
    "[attr.name]": "null",
  },
  template: `
    @if (label()) {
      <span class="okkly-checkbox-group__label">{{ label() }}</span>
    }
    <ng-content />
  `,
})
export class OkklyCheckboxGroup implements CheckboxGroupState {
  /**
   * Shared `name` of every nested checkbox. Generated when omitted.
   *
   * @default undefined
   */
  readonly groupName = input<string | undefined>(undefined, { alias: "name" });
  /**
   * Selected values. Two-way bindable as `[(value)]`.
   *
   * @default []
   */
  readonly value = model<string[]>([]);
  /**
   * Disables every nested checkbox.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Applied to every nested checkbox that does not set its own.
   *
   * @default "medium"
   */
  readonly size = input<CheckboxSize>("medium");
  /**
   * Applied to every nested checkbox that does not set its own.
   *
   * @default "primary"
   */
  readonly color = input<CheckboxColor>("primary");
  /**
   * Group label, shown above the options and used as the group's accessible name.
   *
   * @default undefined
   */
  readonly label = input<string>();

  private readonly generatedName = `okkly-checkbox-group-${nextId++}`;

  readonly name = computed(() => this.groupName() ?? this.generatedName);

  isChecked(option: string): boolean {
    return this.value().includes(option);
  }

  toggle(option: string, checked: boolean): void {
    const current = this.value();
    if (checked === current.includes(option)) return;
    this.value.set(checked ? [...current, option] : current.filter((item) => item !== option));
  }
}
