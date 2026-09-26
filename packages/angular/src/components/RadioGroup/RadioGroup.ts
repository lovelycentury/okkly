import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from "@angular/core";
import { RADIO_GROUP, type RadioColor, type RadioGroupState, type RadioSize } from "../Radio/Radio";

let nextId = 0;

/**
 * A labelled single choice. Inputs mirror `@okkly/react`'s `<RadioGroup>`
 * name-for-name — `name`, `value`, `disabled`, `size`, `color`, `label` —
 * which follows MUI's RadioGroup composition: `okkly-radio` children are
 * nested directly and pick the group up (through DI here, a context in
 * React), their `value` selecting the option.
 *
 * Deliberate gaps: React's `value`/`defaultValue`/`onChange` trio is one
 * `model()`, so `[(value)]` binds the choice and a one-way `[value]` is just
 * its starting point — as with Angular Material's `mat-radio-group`, the
 * group keeps what the user picks either way.
 */
@Component({
  selector: "okkly-radio-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: RADIO_GROUP, useExisting: OkklyRadioGroup }],
  host: {
    class: "okkly-component okkly-radio-group",
    role: "radiogroup",
    "[attr.aria-label]": "label() || null",
    // `name` belongs to the nested inputs, not to this element.
    "[attr.name]": "null",
  },
  templateUrl: "./RadioGroup.html",
})
export class OkklyRadioGroup implements RadioGroupState {
  /**
   * Shared `name` of every nested radio. Generated when omitted.
   *
   * @default undefined
   */
  readonly groupName = input<string | undefined>(undefined, { alias: "name" });
  /**
   * The selected option's value. Two-way bindable as `[(value)]`.
   *
   * @default undefined
   */
  readonly value = model<string | undefined>(undefined);
  /**
   * Disables every nested radio.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Applied to every nested radio that does not set its own.
   *
   * @default "medium"
   */
  readonly size = input<RadioSize>("medium");
  /**
   * Applied to every nested radio that does not set its own.
   *
   * @default "primary"
   */
  readonly color = input<RadioColor>("primary");
  /**
   * Group label, shown above the options and used as the group's accessible name.
   *
   * @default undefined
   */
  readonly label = input<string>();

  private readonly generatedName = `okkly-radio-group-${nextId++}`;

  readonly name = computed(() => this.groupName() ?? this.generatedName);

  select(option: string): void {
    this.value.set(option);
  }
}
