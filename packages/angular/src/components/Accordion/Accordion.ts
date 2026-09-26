import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from "@angular/core";
import { OkklyCollapse, OkklyCollapseContent } from "../Collapse/Collapse";

/** Marks the projected element that replaces the default chevron. */
@Directive({ selector: "[okklyAccordionExpandIcon]" })
export class OkklyAccordionExpandIcon {}

/**
 * Props follow MUI's Accordion API (https://mui.com/material-ui/api/accordion/)
 * closely, translated to Angular idiom: `expanded` is a `model()`, so it is
 * both the controlled value (bind `[expanded]`) and the uncontrolled one
 * (bind nothing and it manages itself), replacing React's separate
 * `expanded`/`defaultExpanded` pair — the same collapse `@okkly/react`'s
 * `onChange` makes into a plain `expandedChange` event. Deliberate gaps:
 * composition uses `okkly-accordion-summary` / `okkly-accordion-details`
 * projected as content (communicating through Angular DI the way Angular
 * Material's `MatExpansionPanel` reads its `MatAccordion`, rather than
 * React context), and there's no `AccordionActions` slot in v1.
 *
 * Unlike react, which re-derives `isExpanded` from the `expanded` prop on
 * every render, `expanded` here is real internal state that a bound
 * `[expanded]="…"` expression only overwrites when its *value* changes
 * between change-detection passes — a toggle can't be silently vetoed by
 * leaving the binding at the same literal. Bind a genuinely reactive
 * expression (a signal, or a value that differs between the states you
 * toggle between, as in an exclusive-group of accordions) for real control.
 */
@Component({
  selector: "okkly-accordion",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-accordion",
    "[class]": "modifiers()",
  },
  templateUrl: "./Accordion.html",
})
export class OkklyAccordion {
  /**
   * Expanded state. Two-way bindable as `[(expanded)]`; left unbound, the
   * accordion manages it itself starting from `false`.
   *
   * @default false
   */
  readonly expanded = model(false);
  /**
   * Disabled — the summary can't be toggled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Flips `expanded` unless disabled — called by the projected summary's click. */
  toggle(): void {
    if (this.disabled()) return;
    this.expanded.update((value) => !value);
  }

  protected readonly modifiers = computed(() =>
    [this.expanded() && "okkly-accordion--expanded", this.disabled() && "okkly-accordion--disabled"]
      .filter(Boolean)
      .join(" "),
  );
}

/**
 * The button that toggles the accordion. Mirrors `@okkly/react`'s
 * `<AccordionSummary>`; must be projected inside `<okkly-accordion>`, whose
 * state it reads through DI (Angular's equivalent of the React context
 * `AccordionSummary` throws without). The chevron is projected content
 * tagged `okklyAccordionExpandIcon`, defaulting to a chevron icon.
 */
@Component({
  selector: "button[okklyAccordionSummary]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-accordion__summary",
    "[attr.aria-expanded]": "expanded()",
    "[attr.disabled]": "disabled() ? '' : null",
    "(click)": "onClick()",
  },
  templateUrl: "./AccordionSummary.html",
})
export class OkklyAccordionSummary {
  private readonly accordion = inject(OkklyAccordion);

  protected readonly expanded = computed(() => this.accordion.expanded());
  protected readonly disabled = computed(() => this.accordion.disabled());

  protected onClick(): void {
    this.accordion.toggle();
  }
}

/**
 * The accordion's collapsible body. Mirrors `@okkly/react`'s
 * `<AccordionDetails>`, built on `OkklyCollapse` the same way React's builds
 * on `<Collapse in appear={false} timeout="auto" mountOnEnter unmountOnExit>`
 * — the panel animates both directions and leaves the DOM (unreachable for
 * search and assistive tech) while collapsed.
 */
@Component({
  selector: "okkly-accordion-details",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [OkklyCollapse, OkklyCollapseContent],
  templateUrl: "./AccordionDetails.html",
})
export class OkklyAccordionDetails {
  private readonly accordion = inject(OkklyAccordion);

  protected readonly expanded = computed(() => this.accordion.expanded());
}
