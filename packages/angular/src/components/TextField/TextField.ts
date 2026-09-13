import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
} from "@angular/core";
import { OkklyField, type FieldColor, type FieldSize, getFieldIds } from "../Field/Field";

export type TextFieldSize = FieldSize;
export type TextFieldColor = FieldColor;

let nextId = 0;

/** Marks the projected element that renders before the input, inside the border. */
@Directive({ selector: "[okklyTextFieldStartAdornment]" })
export class OkklyTextFieldStartAdornment {}

/** Marks the projected element that renders after the input, inside the border. */
@Directive({ selector: "[okklyTextFieldEndAdornment]" })
export class OkklyTextFieldEndAdornment {}

/**
 * Props follow MUI's TextField API (https://mui.com/material-ui/api/text-field/)
 * as closely as this design allows: `label`/`size`/`error`/`helperText`/
 * `disabled`/`fullWidth`/`color`/`value`/`required` all match name-for-name,
 * and `startAdornment`/`endAdornment` arrive as projected content tagged with
 * `okklyTextFieldStartAdornment`/`okklyTextFieldEndAdornment` rather than as
 * inputs, since Angular has no `ReactNode` equivalent. A controlled
 * `value`/`onChange` pair becomes a single `model()`.
 *
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps` (no CSS-in-JS system
 * here), no `variant` (the design has one visual treatment, not
 * filled/outlined/standard), no `multiline`/`rows`/`select`/`margin` (not in
 * this component's Figma spec), and no passthrough for arbitrary native input
 * attributes — Angular has no `{...rest}` spread onto a nested element, so
 * only the attributes below reach the `<input>`.
 *
 * Both adornment slots route through `OkklyField`'s own slots via
 * `ngProjectAs` (see `TextField.html`). Project them statically, or toggle
 * each independently — adding both for the first time in the same structural
 * block (e.g. one `@if` wrapping both marker elements) hits an Angular
 * limitation where dynamically-added siblings that resolve to different
 * forwarded `ng-content` slots across a nested component are silently
 * dropped. A single adornment, or both present from creation, are unaffected.
 */
@Component({
  selector: "okkly-text-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [OkklyField],
  templateUrl: "./TextField.html",
})
export class OkklyTextField {
  /**
   * Field label.
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
   * Field height & text.
   *
   * @default "medium"
   */
  readonly size = input<TextFieldSize>("medium");
  /**
   * Tints the focus ring/glow. One of every design-system accent token —
   * `primary`, `secondary`, `dante`, `violet`, `ember`, `ice`, `contrast`.
   *
   * @default "primary"
   */
  readonly color = input<TextFieldColor>("primary");
  /**
   * Marks invalid + red border.
   *
   * @default false
   */
  readonly error = input(false, { transform: booleanAttribute });
  /**
   * Text below field.
   *
   * @default undefined
   */
  readonly helperText = input<string>();
  /**
   * If `true`, the field takes the full width of its container.
   *
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /**
   * Disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Read-only.
   *
   * @default false
   */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * Native `<input>` type.
   *
   * @default "text"
   */
  readonly type = input<string>("text");
  /**
   * Placeholder shown while the input is empty.
   *
   * @default undefined
   */
  readonly placeholder = input<string>();
  /**
   * Id of the native `<input>`. Generated when omitted.
   *
   * @default undefined
   */
  readonly id = input<string>();
  /**
   * The input's value. Bind two-way with `[(value)]`.
   *
   * @default ""
   */
  readonly value = model<string>("");

  private readonly generatedId = `okkly-text-field-${nextId++}`;
  /** Id actually rendered on the `<input>` — `id()` when set, otherwise a generated one. */
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);

  private readonly startAdornment = contentChild(OkklyTextFieldStartAdornment);
  private readonly endAdornment = contentChild(OkklyTextFieldEndAdornment);
  /** Whether an element was projected into the start adornment slot. */
  protected readonly hasStartAdornment = computed(() => !!this.startAdornment());
  /** Whether an element was projected into the end adornment slot. */
  protected readonly hasEndAdornment = computed(() => !!this.endAdornment());

  protected readonly helperId = computed(
    () => getFieldIds(this.inputId(), !!this.label(), !!this.helperText()).helperId,
  );

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
