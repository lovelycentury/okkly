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
  output,
} from "@angular/core";

export type InlineActionSize = "small" | "medium" | "large";
export type InlineActionColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";
export type InlineActionFill = "filled" | "soft" | "outline" | "gradient" | "glass";
export type InlineActionState =
  | "default"
  | "hover"
  | "focus"
  | "filled"
  | "loading"
  | "success"
  | "error"
  | "readonly"
  | "disabled";

/** Marks the projected glyph that replaces the action button's default arrow. */
@Directive({ selector: "[okklyInlineActionIcon]" })
export class OkklyInlineActionIcon {}

/** States that paint a modifier of their own; the rest look like `default`. */
const STYLED_STATES: ReadonlySet<InlineActionState> = new Set([
  "hover",
  "focus",
  "success",
  "error",
  "readonly",
]);

let nextId = 0;

/**
 * A text field with an action button inside it — copy, send, retry — and a
 * feedback caption underneath. Inputs mirror `@okkly/react`'s `<InlineAction>`
 * name-for-name — `value`, `placeholder`, `action`, `size`, `color`, `fill`,
 * `message`, `state`, `readonly`, `loading`, `disabled`. Neither MUI nor
 * Angular Material has one.
 *
 * Deliberate gaps: `value` is a `model()` (`[(value)]`) standing in for
 * React's `value` + `onChange`, and `onAction` is the `actionClick` output, as
 * `action` already names the button's label. React's `actionIcon` is projected
 * content tagged `okklyInlineActionIcon`. Only `id`, `name`, `type` and
 * `aria-label` reach the native `<input>` — Angular has no `{...rest}` spread
 * onto a nested element.
 */
@Component({
  selector: "okkly-inline-action",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-inline-action",
    "[class]": "modifiers()",
    // These belong on the native input, not on this element.
    "[attr.id]": "null",
    "[attr.name]": "null",
    "[attr.type]": "null",
    "[attr.aria-label]": "null",
  },
  templateUrl: "./InlineAction.html",
})
export class OkklyInlineAction {
  /**
   * Field value. Two-way bindable as `[(value)]`.
   *
   * @default ""
   */
  readonly value = model("");
  /**
   * Empty-state hint.
   *
   * @default undefined
   */
  readonly placeholder = input<string>();
  /**
   * Inline button label.
   *
   * @default "Copy"
   */
  readonly action = input("Copy");
  /**
   * Overall scale.
   *
   * @default "medium"
   */
  readonly size = input<InlineActionSize>("medium");
  /**
   * Fill colour. Unset, it follows the ambient section tone, then primary.
   *
   * @default undefined
   */
  readonly color = input<InlineActionColor>();
  /**
   * How the tone is carried on the action button.
   *
   * @default "filled"
   */
  readonly fill = input<InlineActionFill>("filled");
  /**
   * Caption under the field (feedback).
   *
   * @default undefined
   */
  readonly message = input<string>();
  /**
   * Visual state. `disabled`, `loading` and `readonly` win over it.
   *
   * @default "default"
   */
  readonly state = input<InlineActionState>("default");
  /**
   * Value shown, action locked.
   *
   * @default false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Spinner in the button.
   *
   * @default false
   */
  readonly loading = input(false, { transform: booleanAttribute });
  /**
   * Blocks input and action.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Id of the native input. Generated when omitted.
   *
   * @default undefined
   */
  readonly id = input<string>();
  /**
   * Form field name, set on the native input.
   *
   * @default undefined
   */
  readonly name = input<string>();
  /**
   * Native input type.
   *
   * @default "text"
   */
  readonly type = input("text");
  /**
   * Accessible name for the field, set on the native input — the control has no label of its own.
   *
   * @default undefined
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });

  /** Emits when the action button is clicked (never while read-only or disabled). */
  readonly actionClick = output<void>();

  private readonly customIcon = contentChild(OkklyInlineActionIcon);
  protected readonly hasCustomIcon = computed(() => !!this.customIcon());

  private readonly generatedId = `okkly-inline-action-${nextId++}`;
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);
  protected readonly messageId = computed(() =>
    this.message() ? `${this.inputId()}-message` : null,
  );

  protected readonly effectiveState = computed<InlineActionState>(() =>
    this.disabled()
      ? "disabled"
      : this.loading()
        ? "loading"
        : this.readonly()
          ? "readonly"
          : this.state(),
  );
  protected readonly isReadOnly = computed(() => this.effectiveState() === "readonly");
  protected readonly isLocked = computed(() => this.disabled() || this.isReadOnly());

  protected readonly modifiers = computed(() => {
    const state = this.effectiveState();
    return [
      this.color() && `okkly-inline-action--color-${this.color()}`,
      this.fill() !== "filled" && `okkly-inline-action--fill-${this.fill()}`,
      this.size() !== "medium" && `okkly-inline-action--${this.size()}`,
      STYLED_STATES.has(state) && `okkly-inline-action--state-${state}`,
    ]
      .filter(Boolean)
      .join(" ");
  });

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected onAction(): void {
    if (!this.isReadOnly()) this.actionClick.emit();
  }
}
