import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  InjectionToken,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from "@angular/core";
import { iconCheck } from "@okkly/icons";
import { OkklyIcon } from "../Icon/Icon";

/**
 * BEM block the option primitives below namespace themselves under —
 * `"okkly-select"` or `"okkly-autocomplete"`. Set by `OkklyOptionScope`
 * (the counterpart of React's `OptionScope` context provider) on the listbox
 * these primitives render inside; `null` outside one, in which case a
 * primitive renders as a plain element with only the caller's own `class`.
 */
export const OKKLY_OPTION_BLOCK = new InjectionToken<string | null>("OKKLY_OPTION_BLOCK", {
  factory: () => null,
});

function optionElementClass(block: string | null, part: string): string {
  return block ? `${block}__${part}` : "";
}

/**
 * Names the BEM block for every option primitive rendered inside it — the
 * counterpart of React's `<OptionScope block="okkly-select">`. `OkklySelect`
 * and `OkklyAutocomplete` put this on their own listbox; apps only need it
 * when rendering option primitives somewhere else entirely.
 */
@Directive({
  selector: "[okklyOptionScope]",
  providers: [
    { provide: OKKLY_OPTION_BLOCK, useFactory: () => inject(OkklyOptionScope).okklyOptionScope() },
  ],
})
export class OkklyOptionScope {
  /** BEM block, e.g. `"okkly-select"`. */
  readonly okklyOptionScope = input.required<string>();
}

/**
 * The `<li>` an option row lives in. Mirrors React's `OptionRow`: put option
 * role/state attributes on it directly (this package has no `renderOption`
 * render-prop equivalent to spread them through).
 */
@Component({
  selector: "li[okklyOptionRow]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./OptionRow.html",
})
export class OkklyOptionRow {}

/** The row's primary text: takes the free space and truncates with an ellipsis. */
@Component({
  selector: "span[okklyOptionLabel]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { "[class]": "hostClass()" },
  templateUrl: "./OptionLabel.html",
})
export class OkklyOptionLabel {
  private readonly block = inject(OKKLY_OPTION_BLOCK);
  protected readonly hostClass = computed(() => optionElementClass(this.block, "option-label"));
}

/** Muted secondary text — a country code, a count, a hint. */
@Component({
  selector: "span[okklyOptionDescription]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { "[class]": "hostClass()" },
  templateUrl: "./OptionDescription.html",
})
export class OkklyOptionDescription {
  private readonly block = inject(OKKLY_OPTION_BLOCK);
  protected readonly hostClass = computed(() => optionElementClass(this.block, "option-meta"));
}

/**
 * Stacks a label and its description vertically for two-line rows. Without it
 * the row is a single centred flex line and the description sits beside the
 * label instead of under it.
 */
@Component({
  selector: "span[okklyOptionBody]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { "[class]": "hostClass()" },
  templateUrl: "./OptionBody.html",
})
export class OkklyOptionBody {
  private readonly block = inject(OKKLY_OPTION_BLOCK);
  protected readonly hostClass = computed(() => optionElementClass(this.block, "option-body"));
}

/** The selected tick, in the accent colour the default rows use. */
@Component({
  selector: "span[okklyOptionCheck]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [OkklyIcon],
  host: { "[class]": "hostClass()" },
  templateUrl: "./OptionCheck.html",
})
export class OkklyOptionCheck {
  /**
   * Whether the tick is drawn. `false` still reserves nothing — the element is
   * simply not rendered — so pass the row's `selected` state straight through.
   *
   * @default true
   */
  readonly checked = input(true);

  protected readonly iconCheck = iconCheck;
  private readonly block = inject(OKKLY_OPTION_BLOCK);
  protected readonly hostClass = computed(() => optionElementClass(this.block, "option-check"));
}

/**
 * Emphasises the first case-insensitive occurrence of `query` inside `text`.
 * Only the first: a second run would compete with the row's own highlight
 * state for the reader's eye. Styled with weight rather than a background, so
 * it stays legible over a highlighted or selected row underneath.
 */
@Component({
  selector: "okkly-highlight-match",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./HighlightMatch.html",
})
export class OkklyHighlightMatch {
  /** The full option text. */
  readonly text = input.required<string>();
  /** What the user typed — usually the field's current `inputValue`. */
  readonly query = input<string>();

  private readonly block = inject(OKKLY_OPTION_BLOCK);
  protected readonly markClass = computed(() => optionElementClass(this.block, "option-mark"));

  protected readonly match = computed(() => {
    const text = this.text();
    const needle = (this.query() ?? "").trim();
    const at = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
    if (at === -1) return { before: text, marked: "", after: "" };
    return {
      before: text.slice(0, at),
      marked: text.slice(at, at + needle.length),
      after: text.slice(at + needle.length),
    };
  });
}
