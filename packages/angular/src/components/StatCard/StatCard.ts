import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
} from "@angular/core";

export type StatCardSize = "sm" | "md" | "lg";
export type StatCardColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";

/** A delta badge: what the number moved by, and which way. */
export interface StatCardTrend {
  /** The delta as shown — "12.5%", "+3 this week". */
  value: string;
  /** Picks the arrow, the colour and the spoken direction. */
  up: boolean;
}

/** Marks the projected glyph shown in the card's header chip. */
@Directive({ selector: "[okklyStatCardIcon]" })
export class OkklyStatCardIcon {}

/**
 * A dashboard tile: one number, one label, and how that number moved. Inputs
 * mirror `@okkly/react`'s `<StatCard>` name-for-name — `label`, `value`,
 * `trend`, `color`, `accent`, `description`, `size`. Neither MUI nor Angular
 * Material has one.
 *
 * Deliberate gaps: React's `value` takes any node. Here `value` is text, and
 * richer markup — a unit, a currency — is the default projected content,
 * rendered after it inside the value. The `icon` node is projected content
 * tagged `okklyStatCardIcon`.
 */
@Component({
  selector: "okkly-stat-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-stat-card",
    "[class]": "modifiers()",
  },
  templateUrl: "./StatCard.html",
})
export class OkklyStatCard {
  /**
   * What the metric measures.
   *
   * @default undefined
   */
  readonly label = input.required<string>();
  /**
   * The headline number or string. Projected content follows it inside the value.
   *
   * @default undefined
   */
  readonly value = input<string>();
  /**
   * Optional delta badge — green up, red down.
   *
   * @default undefined
   */
  readonly trend = input<StatCardTrend>();
  /**
   * Accent tone for the icon chip, the glow and an accented value.
   *
   * @default "primary"
   */
  readonly color = input<StatCardColor>("primary");
  /**
   * Recolours the value in the card's tone and adds a glow.
   *
   * @default false
   */
  readonly accent = input(false, { transform: booleanAttribute });
  /**
   * Supporting copy below the label.
   *
   * @default undefined
   */
  readonly description = input<string>();
  /**
   * Card density.
   *
   * @default "md"
   */
  readonly size = input<StatCardSize>("md");

  private readonly icon = contentChild(OkklyStatCardIcon);
  protected readonly hasIcon = computed(() => !!this.icon());

  protected readonly modifiers = computed(() =>
    [
      this.size() !== "md" && `okkly-stat-card--${this.size()}`,
      this.accent() && "okkly-stat-card--accent",
      this.color() !== "primary" && `okkly-stat-card--color-${this.color()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
