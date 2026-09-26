import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { iconChevronDown, iconChevronUp, iconX } from "@okkly/icons";
import { OkklyChip } from "../Chip/Chip";
import {
  OkklyField,
  OkklyFieldEndAdornment,
  getFieldIds,
  type FieldColor,
  type FieldSize,
} from "../Field/Field";
import { OkklyIcon } from "../Icon/Icon";
import {
  OkklyOptionCheck,
  OkklyOptionDescription,
  OkklyOptionLabel,
  OkklyOptionRow,
  OkklyOptionScope,
} from "../Option/Option";
import { OkklyPopper } from "../Popper/Popper";
import { OkklySpinner } from "../Spinner/Spinner";
import {
  findNextEnabledIndex,
  groupOptions,
  normalizeMultipleValue,
  normalizeSingleValue,
  type OptionGroup,
  type SelectOption,
  type SelectionChangeEvent,
} from "../Select/selection";

export type AutocompleteSize = FieldSize;
export type AutocompleteColor = FieldColor;
/** Same shape as `SelectOption` — the two components share one option type. */
export type AutocompleteOption = SelectOption;
export type {
  SelectOption,
  SelectionChangeEvent,
  SelectionChangeReason,
} from "../Select/selection";

let nextId = 0;

const POPPER_MODIFIERS = [{ name: "offset", options: { offset: [0, 4] } }];

function defaultFilterOptions(
  options: readonly SelectOption[],
  inputValue: string,
): readonly SelectOption[] {
  const query = inputValue.trim().toLowerCase();
  if (!query) return options;
  return options.filter((option) => option.label.toLowerCase().includes(query));
}

/**
 * Props follow MUI's Autocomplete API (https://mui.com/material-ui/api/autocomplete/)
 * as closely as this design allows: `options`/`multiple`/`freeSolo`/`disabled`/
 * `label`/`error`/`helperText`/`fullWidth`/`size`/`required`/`name`/`groupBy`/
 * `openOnFocus`/`autoHighlight`/`autoSelect`/`blurOnSelect`/`clearOnEscape`/
 * `clearOnBlur`/`filterSelectedOptions`/`disableCloseOnSelect`/
 * `disableClearable`/`limitTags`/`loading`/`loadingText`/`noOptionsText`/
 * `clearText` all match name-for-name, and `value`/`inputValue`/`open` become
 * two-way-bindable `model()`s (`[(value)]`, `[(inputValue)]`, `[(open)]`).
 *
 * Deliberate gaps, the same call `OkklySelect` already made: no generic
 * option type — `SelectOption` is fixed to
 * `{ value: string; label: string; disabled?: boolean; description?: string }`
 * — so `getOptionLabel`/`getOptionDescription`/`isOptionEqualToValue` don't
 * exist; a row always reads `option.label`/`option.description`, and values
 * compare with `===`. No `renderOption`/`renderInput`/`renderGroup`/
 * `renderNoOptions`/`renderLoading`/`renderTags` — Angular has no
 * `ReactNode`/render-prop equivalent, so a row is always the built-in label +
 * description + tick, built from the `OkklyOption*` primitives.
 * `filterOptions`/`groupBy` stay as function inputs since they return data,
 * not markup — `filterOptions` narrows to `(options, inputValue) => options`,
 * dropping the `getOptionLabel` react hands it (redundant once every option
 * already has a fixed `.label`). `freeSolo` commits the typed text as the
 * `string` value itself — the hidden-input hooks it up like any other option,
 * with `{ value: text, label: text }` synthesised on the fly for rendering.
 * That also means the `name` hidden inputs submit each option's `value`
 * (matching `OkklySelect`), not its `label` the way react's port does. No
 * `className` forwarding onto the field's own root, matching `OkklySelect`/
 * `OkklyTextField`.
 */
@Component({
  selector: "okkly-autocomplete",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgTemplateOutlet,
    OkklyField,
    OkklyFieldEndAdornment,
    OkklyPopper,
    OkklyChip,
    OkklySpinner,
    OkklyIcon,
    OkklyOptionScope,
    OkklyOptionRow,
    OkklyOptionLabel,
    OkklyOptionDescription,
    OkklyOptionCheck,
  ],
  templateUrl: "./Autocomplete.html",
})
export class OkklyAutocomplete {
  /**
   * Options.
   *
   * @default []
   */
  readonly options = input<readonly SelectOption[]>([]);
  /**
   * Value. Two-way bindable as `[(value)]` — a string, or a string array in
   * `multiple` mode.
   *
   * @default null
   */
  readonly value = model<string | string[] | null>(null);
  /**
   * The text typed in the field. Two-way bindable as `[(inputValue)]` —
   * decoupled from `value` so it can hold text that matches nothing yet.
   *
   * @default ""
   */
  readonly inputValue = model<string>("");
  /**
   * Multiple.
   *
   * @default false
   */
  readonly multiple = input(false, { transform: booleanAttribute });
  /**
   * Free solo. Commits whatever is typed on Enter (reason `"createOption"`)
   * or on blur (reason `"blur"`) even when it matches no option.
   *
   * @default false
   */
  readonly freeSolo = input(false, { transform: booleanAttribute });
  /**
   * Disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Marks the field required and shows a dante asterisk after the label.
   *
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * Opens the popup as soon as the field is focused, before anything is typed.
   *
   * @default false
   */
  readonly openOnFocus = input(false, { transform: booleanAttribute });
  /**
   * Whether the listbox is open. Two-way bindable as `[(open)]`.
   *
   * @default false
   */
  readonly open = model(false);
  /**
   * Highlights the first option as you type, so Enter commits without arrowing.
   *
   * @default false
   */
  readonly autoHighlight = input(false, { transform: booleanAttribute });
  /**
   * Commits the highlighted option when the field is blurred.
   *
   * @default false
   */
  readonly autoSelect = input(false, { transform: booleanAttribute });
  /**
   * Blurs the field after a selection instead of refocusing it.
   *
   * @default false
   */
  readonly blurOnSelect = input(false, { transform: booleanAttribute });
  /**
   * Escape clears the value when the popup is already closed.
   *
   * @default false
   */
  readonly clearOnEscape = input(false, { transform: booleanAttribute });
  /**
   * Resets the input text on blur. Defaults to `true` unless `freeSolo`.
   *
   * @default undefined
   */
  readonly clearOnBlur = input<boolean>();
  /**
   * Hides options that are already selected. Most useful with `multiple`.
   *
   * @default false
   */
  readonly filterSelectedOptions = input(false, { transform: booleanAttribute });
  /**
   * Keeps the popup open after picking. Defaults to `true` for `multiple`.
   *
   * @default undefined
   */
  readonly disableCloseOnSelect = input<boolean>();
  /**
   * Disable clearable.
   *
   * @default false
   */
  readonly disableClearable = input(false, { transform: booleanAttribute });
  /**
   * Chips shown before collapsing to "+N". `-1` shows all. Multi-select only.
   *
   * @default -1
   */
  readonly limitTags = input(-1);
  /**
   * Groups options under sticky headers; also reorders them so groups are contiguous.
   *
   * @default undefined
   */
  readonly groupBy = input<(option: SelectOption) => string>();
  /**
   * Filters `options` against the current `inputValue`. Defaults to a
   * case-insensitive substring match against `option.label`.
   *
   * @default undefined
   */
  readonly filterOptions =
    input<(options: readonly SelectOption[], inputValue: string) => readonly SelectOption[]>();
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
   * Placeholder.
   *
   * @default "Search…"
   */
  readonly placeholder = input("Search…");
  /**
   * Size.
   *
   * @default "medium"
   */
  readonly size = input<AutocompleteSize>("medium");
  /**
   * Color.
   *
   * @default "primary"
   */
  readonly color = input<AutocompleteColor>("primary");
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
   * Full width.
   *
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /**
   * Loading.
   *
   * @default false
   */
  readonly loading = input(false, { transform: booleanAttribute });
  /**
   * Emits hidden inputs so the value reaches a plain `<form>` submit.
   *
   * @default undefined
   */
  readonly name = input<string>();
  /**
   * No options text.
   *
   * @default "No results"
   */
  readonly noOptionsText = input("No results");
  /**
   * Loading text.
   *
   * @default "Loading…"
   */
  readonly loadingText = input("Loading…");
  /**
   * Clear text.
   *
   * @default "Clear"
   */
  readonly clearText = input("Clear");
  /**
   * Accessible name of the toggle button while closed.
   *
   * @default "Open options"
   */
  readonly openText = input("Open options");
  /**
   * Accessible name of the toggle button while open.
   *
   * @default "Close options"
   */
  readonly closeText = input("Close options");
  /**
   * Width of the dropdown panel. It is never narrower than the field; this is
   * for the case where the options need more room than the input has.
   *
   * @default undefined
   */
  readonly popupWidth = input<number | string>();
  /**
   * Id of the field. Generated when omitted.
   *
   * @default undefined
   */
  readonly id = input<string>();

  /** Emits the reason behind a `value` change — `[(value)]` already carries the new value. */
  readonly change = output<SelectionChangeEvent>();

  protected readonly iconX = iconX;
  protected readonly iconChevronDown = iconChevronDown;
  protected readonly iconChevronUp = iconChevronUp;
  protected readonly popperModifiers = POPPER_MODIFIERS;

  private readonly generatedId = `okkly-autocomplete-${nextId++}`;
  protected readonly fieldId = computed(() => this.id() ?? this.generatedId);
  // Only `helperId` is needed: the input's own `id` equals `fieldId`, so
  // `<label for>` already associates them — unlike `OkklySelect`'s
  // `div[role="combobox"]` trigger, which needs `aria-labelledby` instead.
  protected readonly helperId = computed(
    () => getFieldIds(this.fieldId(), !!this.label(), !!this.helperText()).helperId,
  );
  protected readonly listboxId = computed(() => `${this.fieldId()}-listbox`);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fieldRef = viewChild<OkklyField>("field");
  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");
  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>("input");
  /** The field's control box, anchoring the popup — the counterpart of React's `controlRef`. */
  protected readonly controlElement = computed(() => this.fieldRef()?.controlElement() ?? null);

  protected readonly highlightedIndex = signal(-1);

  private readonly keepOpenOnSelect = computed(
    () => this.disableCloseOnSelect() ?? this.multiple(),
  );
  private readonly shouldClearOnBlur = computed(() => this.clearOnBlur() ?? !this.freeSolo());

  private readonly filtered = computed<readonly SelectOption[]>(() => {
    const custom = this.filterOptions();
    const apply = custom ?? defaultFilterOptions;
    let result = apply(this.options(), this.inputValue());
    if (this.filterSelectedOptions()) result = result.filter((option) => !this.isSelected(option));
    return result;
  });

  private readonly grouped = computed(() => {
    const groupBy = this.groupBy();
    return groupBy ? groupOptions(this.filtered(), groupBy) : null;
  });

  /** Options surviving the filter, in render order — reordered when `groupBy` is set. */
  protected readonly filteredOptions = computed<readonly SelectOption[]>(
    () => this.grouped()?.flat ?? this.filtered(),
  );
  /** `null` unless `groupBy` is set. */
  protected readonly groupedOptions = computed<OptionGroup[] | null>(
    () => this.grouped()?.groups ?? null,
  );

  protected isSelected(option: SelectOption): boolean {
    if (this.multiple()) {
      return normalizeMultipleValue(this.value()).includes(option.value);
    }
    return normalizeSingleValue(this.value()) === option.value;
  }

  /** Falls back to a `{ value, label: value }` pseudo-option for a `freeSolo` value with no matching option. */
  private resolveOption(value: string): SelectOption {
    return this.options().find((option) => option.value === value) ?? { value, label: value };
  }

  protected readonly tags = computed<readonly SelectOption[]>(() =>
    this.multiple()
      ? normalizeMultipleValue(this.value()).map((value) => this.resolveOption(value))
      : [],
  );
  protected readonly shownTags = computed(() => {
    const limit = this.limitTags();
    return limit < 0 ? this.tags() : this.tags().slice(0, limit);
  });
  protected readonly tagOverflow = computed(() => this.tags().length - this.shownTags().length);

  protected readonly hasValue = computed(() =>
    this.multiple() ? this.tags().length > 0 : normalizeSingleValue(this.value()) != null,
  );

  /** Options rendered as hidden `<input>`s so `name` reaches a plain form submit. */
  protected readonly hiddenInputs = computed<readonly SelectOption[]>(() => {
    if (this.multiple()) return this.tags();
    const value = normalizeSingleValue(this.value());
    return value != null ? [this.resolveOption(value)] : [];
  });

  protected readonly inputActivedescendant = computed(() => {
    const index = this.highlightedIndex();
    return this.open() && index >= 0 ? `${this.listboxId()}-option-${index}` : null;
  });

  protected readonly popupStyle = computed<Record<string, string>>(() => {
    const width = this.popupWidth();
    const style: Record<string, string> = {};
    if (width !== undefined) style["width"] = typeof width === "number" ? `${width}px` : width;
    return style;
  });

  protected readonly popoverClass = computed(() => {
    const size = this.size();
    return size === "medium"
      ? "okkly-autocomplete-popover"
      : `okkly-autocomplete-popover okkly-autocomplete-popover--${size}`;
  });

  constructor() {
    // Safety net for `open` transitions this component didn't itself drive —
    // an external `[(open)]` binding writes straight to the model, bypassing
    // `setOpen()`'s own synchronous seeding below. Effects are scheduled, not
    // synchronous with the write that triggers them, so a still-pending run
    // here can land *after* a keydown handler has since moved
    // `highlightedIndex` via arrow-key navigation; reading it untracked and
    // bailing out when it's already a valid, enabled option keeps this from
    // clobbering navigation `setOpen()` already seeded correctly. It also
    // re-highlights when typing narrows `filteredOptions` while already open.
    effect(() => {
      if (!this.open()) {
        this.highlightedIndex.set(-1);
        return;
      }
      const flat = this.filteredOptions();
      const current = untracked(() => this.highlightedIndex());
      if (current >= 0 && current < flat.length && !flat[current]?.disabled) return;
      this.highlightedIndex.set(this.computeOpenHighlight());
    });

    // Popper has no dismissal of its own; the whole field counts as "inside",
    // and the panel is portaled elsewhere in the DOM, so both are checked.
    effect((onCleanup) => {
      if (!this.open()) return;
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node;
        if (this.host.nativeElement.contains(target)) return;
        if (this.panel()?.nativeElement.contains(target)) return;
        this.setOpen(false);
      };
      this.document.addEventListener("mousedown", onPointerDown);
      onCleanup(() => this.document.removeEventListener("mousedown", onPointerDown));
    });
  }

  /** The highlight the popup should start with the instant it opens. */
  private computeOpenHighlight(): number {
    return this.autoHighlight() ? findNextEnabledIndex(this.filteredOptions(), -1, 1) : -1;
  }

  protected setOpen(open: boolean): void {
    if (this.disabled()) return;
    this.open.set(open);
    // Seeded synchronously, in the same call that flips `open` — a keydown
    // handler opening on one keypress and navigating on the very next relies
    // on this value already being right, and the constructor effect above
    // can't promise that (see its own comment).
    this.highlightedIndex.set(open ? this.computeOpenHighlight() : -1);
  }

  /**
   * The chevron, the clear button and the field's own padding all sit outside
   * the input, so without this the only live target in the control is the
   * input itself. A click anywhere in the box puts the caret in the input and
   * opens the list, as MUI's Autocomplete does. Native DOM events don't bubble
   * from the portaled listbox through the control, so — like `OkklySelect` —
   * no containment check against a click landing in the popup is needed here.
   */
  protected onControlClick(event: MouseEvent): void {
    if (this.disabled()) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, input")) return;
    this.inputElement()?.nativeElement.focus();
    this.setOpen(true);
  }

  protected onInputChange(event: Event): void {
    this.inputValue.set((event.target as HTMLInputElement).value);
    if (!this.open()) this.setOpen(true);
  }

  protected onInputFocus(): void {
    if (this.openOnFocus()) this.setOpen(true);
  }

  protected onInputBlur(): void {
    if (this.autoSelect() && this.open() && this.highlightedIndex() >= 0) {
      this.selectOption(this.highlightedIndex());
      return;
    }
    if (
      this.freeSolo() &&
      !this.multiple() &&
      this.inputValue().trim() &&
      normalizeSingleValue(this.value()) == null
    ) {
      const solo = this.inputValue().trim();
      this.value.set(solo);
      this.change.emit({ value: solo, reason: "blur", option: { value: solo, label: solo } });
      return;
    }
    if (this.shouldClearOnBlur()) {
      // Text that matched nothing would otherwise linger beside a value it
      // does not describe. A committed single value re-asserts its own label.
      const single = normalizeSingleValue(this.value());
      if (!this.multiple() && single != null) this.inputValue.set(this.resolveOption(single).label);
      else if (this.inputValue()) this.inputValue.set("");
    }
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const { key } = event;

    if (key === "ArrowDown") {
      event.preventDefault();
      if (!this.open()) this.setOpen(true);
      else
        this.highlightedIndex.set(
          findNextEnabledIndex(this.filteredOptions(), this.highlightedIndex(), 1),
        );
      return;
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      if (!this.open()) this.setOpen(true);
      else
        this.highlightedIndex.set(
          findNextEnabledIndex(this.filteredOptions(), this.highlightedIndex(), -1),
        );
      return;
    }
    if (key === "Enter") {
      // Unconditional: an uncommitted Enter in a text input still fires a
      // native `change` on this element in Chromium, which would otherwise
      // bubble to whatever the host wired up its own `(change)` to.
      event.preventDefault();
      if (this.open() && this.highlightedIndex() >= 0) {
        this.selectOption(this.highlightedIndex());
        return;
      }
      if (this.freeSolo() && this.inputValue().trim()) {
        const solo = this.inputValue().trim();
        const option: SelectOption = { value: solo, label: solo };
        if (this.multiple()) {
          const next = [...normalizeMultipleValue(this.value()), solo];
          this.value.set(next);
          this.change.emit({ value: next, reason: "createOption", option });
          this.inputValue.set("");
        } else {
          this.value.set(solo);
          this.change.emit({ value: solo, reason: "createOption", option });
          this.setOpen(false);
        }
      }
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      if (this.open()) {
        this.setOpen(false);
        return;
      }
      if (this.clearOnEscape()) this.clearValue();
      return;
    }
    if (key === "Backspace" && this.multiple() && !this.inputValue()) {
      const current = normalizeMultipleValue(this.value());
      if (current.length > 0) this.removeTag(current.length - 1);
    }
  }

  protected optionRowClass(index: number, option: SelectOption): string {
    return [
      "okkly-autocomplete__option",
      this.highlightedIndex() === index && "okkly-autocomplete__option--highlighted",
      this.isSelected(option) && "okkly-autocomplete__option--selected",
      option.disabled && "okkly-autocomplete__option--disabled",
    ]
      .filter(Boolean)
      .join(" ");
  }

  protected onOptionMouseEnter(index: number, option: SelectOption): void {
    if (!option.disabled) this.highlightedIndex.set(index);
  }

  protected onOptionClick(index: number, option: SelectOption): void {
    if (option.disabled) return;
    this.selectOption(index);
  }

  protected selectOption(index: number): void {
    const option = this.filteredOptions()[index];
    if (!option || option.disabled) return;

    if (this.multiple()) {
      const current = normalizeMultipleValue(this.value());
      const exists = current.includes(option.value);
      const next = exists ? current.filter((v) => v !== option.value) : [...current, option.value];
      this.value.set(next);
      this.change.emit({ value: next, reason: exists ? "removeOption" : "selectOption", option });
      this.inputValue.set("");
      if (!this.keepOpenOnSelect()) this.setOpen(false);
    } else {
      this.value.set(option.value);
      this.change.emit({ value: option.value, reason: "selectOption", option });
      this.inputValue.set(option.label);
      if (!this.keepOpenOnSelect()) this.setOpen(false);
    }

    if (this.blurOnSelect()) this.inputElement()?.nativeElement.blur();
    else this.inputElement()?.nativeElement.focus();
  }

  protected removeTag(index: number): void {
    const current = normalizeMultipleValue(this.value());
    const option = this.resolveOption(current[index]);
    const next = current.filter((_, i) => i !== index);
    this.value.set(next);
    this.change.emit({ value: next, reason: "removeOption", option });
  }

  protected clearValue(): void {
    if (this.disableClearable() || this.disabled()) return;
    if (this.multiple()) {
      this.value.set([]);
      this.change.emit({ value: [], reason: "clear" });
    } else {
      this.value.set(null);
      this.change.emit({ value: null, reason: "clear" });
    }
    this.inputValue.set("");
    this.inputElement()?.nativeElement.focus();
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.clearValue();
  }

  protected onToggleClick(): void {
    this.setOpen(!this.open());
  }
}
