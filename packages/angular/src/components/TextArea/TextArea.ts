import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  viewChild,
  type ElementRef,
} from "@angular/core";

export type TextAreaSize = "small" | "medium" | "large";
export type TextAreaColor = "primary" | "dante";
export type TextAreaResize = "none" | "vertical" | "both";

/** `numberAttribute` that keeps an unset input unset rather than `NaN`. */
const optionalNumber = (value: unknown): number | undefined =>
  value == null || value === "" ? undefined : numberAttribute(value);

let nextId = 0;

/**
 * A multi-line text field with an optional character counter and auto-growing
 * height. Inputs follow MUI's multiline TextField, as `@okkly/react`'s
 * `<TextArea>` does — `label`, `hideLabel`, `size`, `color`, `error`,
 * `helperText`, `fullWidth`, `disabled`, `rows`, `maxRows`, `autosize`,
 * `maxLength`, `resize`, `required`.
 *
 * Deliberate gaps: `value` is a `model()` (`[(value)]`) standing in for
 * React's `value`/`defaultValue` + `onChange`. `label` and `helperText` are
 * text where React takes any node. Only `id`, `name` and `placeholder` reach
 * the native `<textarea>` — Angular has no `{...rest}` spread onto a nested
 * element.
 */
@Component({
  selector: "okkly-text-area",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-text-area",
    "[class]": "modifiers()",
    // These belong on the native textarea, not on this element.
    "[attr.id]": "null",
    "[attr.name]": "null",
  },
  templateUrl: "./TextArea.html",
})
export class OkklyTextArea {
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
   * Field text sizing.
   *
   * @default "medium"
   */
  readonly size = input<TextAreaSize>("medium");
  /**
   * Tints the focus ring and glow. `dante` is a rare, deliberate accent moment.
   *
   * @default "primary"
   */
  readonly color = input<TextAreaColor>("primary");
  /**
   * Marks the field invalid, with a red border.
   *
   * @default false
   */
  readonly error = input(false, { transform: booleanAttribute });
  /**
   * Text below the field (footer row, left).
   *
   * @default undefined
   */
  readonly helperText = input<string>();
  /**
   * Takes the full width of its container.
   *
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /**
   * Whether the field is disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Minimum visible rows.
   *
   * @default 3
   */
  readonly rows = input(3, { transform: numberAttribute });
  /**
   * Maximum rows when `autosize` is on.
   *
   * @default undefined
   */
  readonly maxRows = input(undefined, { transform: optionalNumber });
  /**
   * Grows the height with the content.
   *
   * @default false
   */
  readonly autosize = input(false, { transform: booleanAttribute });
  /**
   * Character limit; shows an "n / max" counter in the footer.
   *
   * @default undefined
   */
  readonly maxLength = input(undefined, { transform: optionalNumber });
  /**
   * Manual resize handle. Ignored when `autosize` is on.
   *
   * @default "vertical"
   */
  readonly resize = input<TextAreaResize>("vertical");
  /**
   * Marks the field required and shows an asterisk after the label.
   *
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * Empty-state hint.
   *
   * @default undefined
   */
  readonly placeholder = input<string>();
  /**
   * Id of the native textarea. Generated when omitted.
   *
   * @default undefined
   */
  readonly id = input<string>();
  /**
   * Form field name, set on the native textarea.
   *
   * @default undefined
   */
  readonly name = input<string>();
  /**
   * The text. Two-way bindable as `[(value)]`.
   *
   * @default ""
   */
  readonly value = model("");

  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>("textarea");

  private readonly generatedId = `okkly-text-area-${nextId++}`;
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);
  protected readonly helperId = computed(() =>
    this.helperText() ? `${this.inputId()}-helper` : undefined,
  );
  protected readonly counterId = computed(() =>
    this.maxLength() != null ? `${this.inputId()}-counter` : undefined,
  );
  protected readonly describedBy = computed(
    () => [this.helperId(), this.counterId()].filter(Boolean).join(" ") || null,
  );
  protected readonly showFooter = computed(() => !!this.helperText() || this.maxLength() != null);

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "primary" && `okkly-text-area--color-${this.color()}`,
      this.size() !== "medium" && `okkly-text-area--${this.size()}`,
      this.error() && "okkly-text-area--error",
      this.fullWidth() && "okkly-text-area--full-width",
      this.autosize() && "okkly-text-area--autosize",
      this.resize() !== "vertical" && `okkly-text-area--resize-${this.resize()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );

  constructor() {
    // Autosize: measure after the value lands in the DOM, then clamp the
    // height between `rows` and `maxRows` lines.
    afterRenderEffect({
      write: () => {
        const element = this.textarea().nativeElement;
        this.value();
        const rows = this.rows();
        const maxRows = this.maxRows();
        if (!this.autosize()) {
          element.style.height = "";
          element.style.overflowY = "";
          return;
        }
        element.style.height = "auto";
        const styles = getComputedStyle(element);
        const lineHeight = Number.parseFloat(styles.lineHeight);
        const paddingBlock =
          Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
        const borderBlock =
          Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);
        const minHeight = rows * lineHeight + paddingBlock + borderBlock;
        let nextHeight = Math.max(element.scrollHeight, minHeight);
        if (maxRows != null) {
          const maxHeight = maxRows * lineHeight + paddingBlock + borderBlock;
          nextHeight = Math.min(nextHeight, maxHeight);
          element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
        } else {
          element.style.overflowY = "hidden";
        }
        element.style.height = `${nextHeight}px`;
      },
    });
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }
}
