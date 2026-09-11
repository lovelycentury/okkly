import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

export type FieldSize = "small" | "medium" | "large";
export type FieldColor =
  "primary" | "secondary" | "dante" | "violet" | "ember" | "ice" | "contrast";

/** Marks the projected element that renders in the control box's start adornment slot. */
@Directive({ selector: "[okklyFieldStartAdornment]" })
export class OkklyFieldStartAdornment {}

/** Marks the projected element that renders in the control box's end adornment slot. */
@Directive({ selector: "[okklyFieldEndAdornment]" })
export class OkklyFieldEndAdornment {}

/** Ids `OkklyField` derives from the control id, so a wrapper can wire aria attributes to them. */
export function getFieldIds(id: string, hasLabel: boolean, hasHelperText: boolean) {
  return {
    labelId: hasLabel ? `${id}-label` : undefined,
    helperId: hasHelperText ? `${id}-helper` : undefined,
  };
}

/**
 * The shared shell behind TextField, Select and Autocomplete: label row,
 * bordered control box with optional adornments, and helper text. Mirrors
 * `@okkly/react`'s internal `Field` component.
 *
 * Internal on purpose — not exported from `src/index.ts`. It exists to stop
 * its consumers from re-implementing (and slowly disagreeing about) focus
 * rings, error colours and label spacing, not to become a public layout
 * primitive. Its styling counterpart is the `field.shell` SCSS mixin.
 *
 * Deliberate gap: no equivalent of React's `controlProps`/`ref` on the control
 * box — no current consumer needs to anchor a popup on it yet. Adornment
 * presence is an explicit `hasStartAdornment`/`hasEndAdornment` input rather
 * than self-detected, because a wrapper (e.g. `OkklyTextField`) forwards
 * projected content through `ngProjectAs`, under which a `contentChild` query
 * here would never see the original marker directive.
 *
 * Attribute selector on the `<div>` its consumer (`OkklyTextField`, one day
 * `OkklySelect`) declares — an element selector would wrap that div in a
 * second, unstyled `<okkly-field>` tag, pushing the BEM block one level
 * deeper than React's single root `<div>`.
 */
@Component({
  selector: "div[okklyField]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "hostClasses()",
  },
  templateUrl: "./Field.html",
})
export class OkklyField {
  /**
   * BEM block the emitted classes are namespaced under, e.g. `"okkly-text-field"`.
   * Each consumer keeps its own block so its public class names stay exactly what they were.
   */
  readonly block = input.required<string>();
  /** Id of the control this field wraps; the label's `for` and the helper id derive from it. */
  readonly id = input.required<string>();
  /**
   * Label.
   *
   * @default undefined
   */
  readonly label = input<string>();
  /**
   * Visually hides the label (still present for assistive tech).
   *
   * @default false
   */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * Size.
   *
   * @default "medium"
   */
  readonly size = input<FieldSize>("medium");
  /**
   * Color.
   *
   * @default "primary"
   */
  readonly color = input<FieldColor>("primary");
  /**
   * Error.
   *
   * @default false
   */
  readonly error = input(false, { transform: booleanAttribute });
  /**
   * Helper text.
   *
   * @default undefined
   */
  readonly helperText = input<string>();
  /**
   * Disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Full width.
   *
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /**
   * `<label for>` only works for real form controls, so a wrapper whose control is not one
   * (a `div[role="combobox"]`, say) passes `false` and points at `${id}-label` with
   * `aria-labelledby` on the control itself instead.
   *
   * @default undefined
   */
  readonly htmlFor = input<string | false>();
  /**
   * Whether an element was projected into the start adornment slot.
   *
   * @default false
   */
  readonly hasStartAdornment = input(false, { transform: booleanAttribute });
  /**
   * Whether an element was projected into the end adornment slot.
   *
   * @default false
   */
  readonly hasEndAdornment = input(false, { transform: booleanAttribute });

  protected readonly labelId = computed(() => (this.label() ? `${this.id()}-label` : undefined));
  protected readonly helperId = computed(() =>
    this.helperText() ? `${this.id()}-helper` : undefined,
  );
  protected readonly computedFor = computed(() => {
    const htmlFor = this.htmlFor();
    return htmlFor === false ? null : (htmlFor ?? this.id());
  });

  protected readonly hostClasses = computed(() =>
    [
      "okkly-component",
      this.block(),
      this.color() !== "primary" && `${this.block()}--color-${this.color()}`,
      this.size() !== "medium" && `${this.block()}--${this.size()}`,
      this.error() && `${this.block()}--error`,
      this.disabled() && `${this.block()}--disabled`,
      this.fullWidth() && `${this.block()}--full-width`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
