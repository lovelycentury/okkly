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
  viewChild,
} from "@angular/core";
import { iconChevronDown, iconX } from "@okkly/icons";
import { OkklyCheckbox } from "../Checkbox/Checkbox";
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
} from "./selection";

export type SelectSize = FieldSize;
export type SelectColor = FieldColor;
export type { SelectOption, SelectionChangeEvent, SelectionChangeReason } from "./selection";

let nextId = 0;

const POPPER_MODIFIERS = [{ name: "offset", options: { offset: [0, 4] } }];

/**
 * Props follow MUI's Select API (https://mui.com/material-ui/api/select/) as
 * closely as this design allows: `options`/`multiple`/`disabled`/`label`/
 * `error`/`helperText`/`fullWidth`/`size`/`required`/`name`/`groupBy`/
 * `limitTags`/`disableCloseOnSelect`/`disableClearable`/`noOptionsText`/
 * `loadingText` all match name-for-name, and `open`/`value` become
 * two-way-bindable `model()`s (`[(open)]`, `[(value)]`).
 *
 * Deliberate gaps: no generic option type — `SelectOption` is fixed to
 * `{ value: string; label: string; disabled?: boolean }`, since Angular
 * components in this package do not take a type parameter (see
 * `OkklySegmentedToggle`'s `items`). No `renderValue`/`renderOption`/
 * `renderInput`/`renderGroup`/`renderNoOptions`/`renderLoading` and no
 * `isOptionEqualToValue` — Angular has no `ReactNode`/render-prop
 * equivalent, so a row is always the built-in label (+ checkbox in
 * `multiple` mode, + tick when selected) built from the `OkklyOption*`
 * primitives, and values compare with `===`. No `className`/`class`
 * forwarding onto the field's own root, matching `OkklyTextField`. A
 * controlled `value`/`onChange` pair becomes `[(value)]`, with the reason
 * for a change (`selectOption`/`removeOption`/`clear`) reported separately
 * through `(change)`.
 */
@Component({
  selector: "okkly-select",
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
    OkklyCheckbox,
    OkklyChip,
    OkklySpinner,
    OkklyIcon,
    OkklyOptionScope,
    OkklyOptionRow,
    OkklyOptionLabel,
    OkklyOptionCheck,
  ],
  templateUrl: "./Select.html",
})
export class OkklySelect {
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
   * Multiple.
   *
   * @default false
   */
  readonly multiple = input(false, { transform: booleanAttribute });
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
   * Whether the listbox is open. Two-way bindable as `[(open)]`.
   *
   * @default false
   */
  readonly open = model(false);
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
   * @default "Select…"
   */
  readonly placeholder = input("Select…");
  /**
   * Size.
   *
   * @default "medium"
   */
  readonly size = input<SelectSize>("medium");
  /**
   * Color.
   *
   * @default "primary"
   */
  readonly color = input<SelectColor>("primary");
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
   * Groups options under sticky headers; also reorders them so groups are contiguous.
   *
   * @default undefined
   */
  readonly groupBy = input<(option: SelectOption) => string>();
  /**
   * Chips shown before collapsing to "+N". `-1` shows all. Multi-select only.
   *
   * @default 2
   */
  readonly limitTags = input(2);
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
   * No options text.
   *
   * @default "No options"
   */
  readonly noOptionsText = input("No options");
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
   * Width of the dropdown panel. It is never narrower than the field; this is
   * for the case where the options need more room than the trigger has.
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

  protected readonly iconChevronDown = iconChevronDown;
  protected readonly iconX = iconX;
  protected readonly popperModifiers = POPPER_MODIFIERS;

  private readonly generatedId = `okkly-select-${nextId++}`;
  protected readonly fieldId = computed(() => this.id() ?? this.generatedId);
  protected readonly labelId = computed(
    () => getFieldIds(this.fieldId(), !!this.label(), !!this.helperText()).labelId,
  );
  protected readonly helperId = computed(
    () => getFieldIds(this.fieldId(), !!this.label(), !!this.helperText()).helperId,
  );
  protected readonly listboxId = computed(() => `${this.fieldId()}-listbox`);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fieldRef = viewChild<OkklyField>("field");
  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");
  private readonly triggerElement = viewChild<ElementRef<HTMLElement>>("trigger");
  /** The field's control box, anchoring the popup — the counterpart of React's `controlRef`. */
  protected readonly controlElement = computed(() => this.fieldRef()?.controlElement() ?? null);

  protected readonly highlightedIndex = signal(-1);
  private readonly typeahead = { query: "", at: 0 };

  private readonly keepOpenOnSelect = computed(
    () => this.disableCloseOnSelect() ?? this.multiple(),
  );

  private readonly grouped = computed(() => {
    const groupBy = this.groupBy();
    return groupBy ? groupOptions(this.options(), groupBy) : null;
  });

  /** Options in render order — reordered when `groupBy` is set. */
  protected readonly flatOptions = computed<readonly SelectOption[]>(
    () => this.grouped()?.flat ?? this.options(),
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

  protected readonly selectedOptions = computed(() =>
    this.flatOptions().filter((option) => this.isSelected(option)),
  );
  protected readonly hasValue = computed(() => this.selectedOptions().length > 0);

  protected readonly shownChips = computed(() => {
    const limit = this.limitTags();
    const selected = this.selectedOptions();
    return limit < 0 ? selected : selected.slice(0, limit);
  });
  protected readonly chipOverflow = computed(
    () => this.selectedOptions().length - this.shownChips().length,
  );

  /** Options rendered as hidden `<input>`s so `name` reaches a plain form submit. */
  protected readonly hiddenInputs = computed(() => {
    const selected = this.selectedOptions();
    return this.multiple() ? selected : selected.slice(0, 1);
  });

  protected readonly triggerActivedescendant = computed(() => {
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
      ? "okkly-select-popover"
      : `okkly-select-popover okkly-select-popover--${size}`;
  });

  constructor() {
    // Highlight follows the current value each time the popup opens, then
    // clears once it closes — mirrors `useSelect`'s isOpen/flatOptions effect.
    effect(() => {
      if (!this.open()) {
        this.highlightedIndex.set(-1);
        return;
      }
      const flat = this.flatOptions();
      const firstSelected = flat.findIndex((option) => this.isSelected(option));
      this.highlightedIndex.set(
        firstSelected >= 0 ? firstSelected : findNextEnabledIndex(flat, -1, 1),
      );
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

  protected setOpen(open: boolean): void {
    if (this.disabled()) return;
    this.open.set(open);
  }

  /**
   * The chevron and the field's own padding live outside the trigger (Field
   * adornments), so without this they would be dead space. Clicks that
   * started on the trigger or a button (clear, a chip's ×) are left to their
   * own handlers — otherwise every one of them would toggle twice.
   */
  protected onControlClick(event: MouseEvent): void {
    if (this.disabled()) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, [role="combobox"]')) return;
    this.setOpen(!this.open());
    this.triggerElement()?.nativeElement.focus();
  }

  protected onTriggerClick(): void {
    if (this.disabled()) return;
    this.setOpen(!this.open());
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const { key } = event;

    if (key === "ArrowDown") {
      event.preventDefault();
      if (!this.open()) this.setOpen(true);
      else
        this.highlightedIndex.set(
          findNextEnabledIndex(this.flatOptions(), this.highlightedIndex(), 1),
        );
      return;
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      if (!this.open()) this.setOpen(true);
      else
        this.highlightedIndex.set(
          findNextEnabledIndex(this.flatOptions(), this.highlightedIndex(), -1),
        );
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (!this.open()) {
        this.setOpen(true);
        return;
      }
      if (this.highlightedIndex() >= 0) this.selectOption(this.highlightedIndex());
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      this.setOpen(false);
      return;
    }
    if (key === "Home") {
      event.preventDefault();
      this.highlightedIndex.set(findNextEnabledIndex(this.flatOptions(), -1, 1));
      return;
    }
    if (key === "End") {
      event.preventDefault();
      this.highlightedIndex.set(findNextEnabledIndex(this.flatOptions(), 0, -1));
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      const typeahead = this.typeahead;
      const query = now - typeahead.at < 500 ? typeahead.query + key : key;
      this.typeahead.query = query;
      this.typeahead.at = now;

      if (!this.open()) this.setOpen(true);

      const needle = query.toLowerCase();
      const flat = this.flatOptions();
      const isMatch = (option: SelectOption) =>
        !option.disabled && option.label.toLowerCase().startsWith(needle);
      const after = flat.findIndex(
        (option, index) => index > this.highlightedIndex() && isMatch(option),
      );
      const nextIndex = after >= 0 ? after : flat.findIndex(isMatch);
      if (nextIndex >= 0) this.highlightedIndex.set(nextIndex);
    }
  }

  protected optionRowClass(index: number, option: SelectOption): string {
    return [
      "okkly-select__option",
      this.highlightedIndex() === index && "okkly-select__option--highlighted",
      this.isSelected(option) && "okkly-select__option--selected",
      option.disabled && "okkly-select__option--disabled",
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
    const option = this.flatOptions()[index];
    if (!option || option.disabled) return;

    if (this.multiple()) {
      const current = normalizeMultipleValue(this.value());
      const exists = current.includes(option.value);
      const next = exists ? current.filter((v) => v !== option.value) : [...current, option.value];
      this.value.set(next);
      this.change.emit({ value: next, reason: exists ? "removeOption" : "selectOption", option });
      if (!this.keepOpenOnSelect()) this.setOpen(false);
      return;
    }

    this.value.set(option.value);
    this.change.emit({ value: option.value, reason: "selectOption", option });
    if (!this.keepOpenOnSelect()) {
      this.setOpen(false);
      this.triggerElement()?.nativeElement.focus();
    }
  }

  protected removeValue(option: SelectOption): void {
    if (!this.multiple()) {
      this.value.set(null);
      this.change.emit({ value: null, reason: "removeOption", option });
      return;
    }
    const next = normalizeMultipleValue(this.value()).filter((v) => v !== option.value);
    this.value.set(next);
    this.change.emit({ value: next, reason: "removeOption", option });
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disableClearable() || this.disabled()) return;
    if (this.multiple()) {
      this.value.set([]);
      this.change.emit({ value: [], reason: "clear" });
    } else {
      this.value.set(null);
      this.change.emit({ value: null, reason: "clear" });
    }
  }
}
