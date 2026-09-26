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

export type CardVariant = "solid" | "raised" | "glass" | "outline" | "aura";
export type CardColor = "primary" | "dante" | "indigo";
export type CardPadding = "none" | "sm" | "md" | "lg";

/** A numeric attribute (`height="180"`) reads as the pixels a binding (`[height]="180"`) passes. */
function numeric(value: number | string): number | string {
  return typeof value === "string" && /^\d*\.?\d+$/.test(value) ? Number(value) : value;
}

/** Marks the projected element that renders in the header's leading avatar slot. */
@Directive({ selector: "[okklyCardAvatar]" })
export class OkklyCardAvatar {}

/** Marks the projected element that renders in the header's trailing action slot. */
@Directive({ selector: "[okklyCardAction]" })
export class OkklyCardAction {}

/**
 * A surface that groups one thing. Inputs mirror `@okkly/react`'s `<Card>`
 * name-for-name — `raised`, `padding`, `variant`, `color`, `interactive` —
 * and the slots follow Angular Material's card: `okkly-card-header`,
 * `okkly-card-content`, `okkly-card-actions` and `img[okklyCardMedia]` go
 * inside, in the order you need them.
 *
 * Deliberate gaps: the slots are their own elements (custom tags, or the
 * `<img>` itself) rather than `<div>`s, and are flex items of the card, so
 * they lay out as blocks. `interactive` only styles the card — wrap it in, or
 * put inside it, a real link or button.
 */
@Component({
  selector: "okkly-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-card",
    "[class]": "modifiers()",
  },
  templateUrl: "./Card.html",
})
export class OkklyCard {
  /**
   * Elevated surface with shadow. Shorthand for `variant="raised"`.
   *
   * @default false
   */
  readonly raised = input(false, { transform: booleanAttribute });
  /**
   * Inner padding preset shared by the header, content and actions.
   *
   * @default "md"
   */
  readonly padding = input<CardPadding>("md");
  /**
   * Surface treatment.
   *
   * @default "solid"
   */
  readonly variant = input<CardVariant>("solid");
  /**
   * Accent tone of the `aura` glow. Ignored by every other variant.
   *
   * @default "primary"
   */
  readonly color = input<CardColor>("primary");
  /**
   * Hover lift, for cards whose whole surface is the target.
   *
   * @default false
   */
  readonly interactive = input(false, { transform: booleanAttribute });

  protected readonly effectiveVariant = computed(() =>
    this.raised() && this.variant() === "solid" ? "raised" : this.variant(),
  );

  protected readonly modifiers = computed(() =>
    [
      this.effectiveVariant() !== "solid" && `okkly-card--${this.effectiveVariant()}`,
      this.padding() !== "md" && `okkly-card--padding-${this.padding()}`,
      this.color() !== "primary" &&
        this.effectiveVariant() === "aura" &&
        `okkly-card--color-${this.color()}`,
      this.interactive() && "okkly-card--interactive",
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/**
 * The card's header row: an optional `okklyCardAvatar`, the `title` and
 * `subheader` (plus any projected content under them), and an optional
 * `okklyCardAction` pinned to the trailing edge. Mirrors `@okkly/react`'s
 * `<CardHeader>`; the avatar and action are projected content rather than
 * `ReactNode` props.
 *
 * `title` is an input here, not the native attribute: a static `title="…"`
 * on the host would otherwise also show the browser's tooltip, so the host
 * clears it.
 */
@Component({
  selector: "okkly-card-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-card__header",
    "[attr.title]": "null",
  },
  templateUrl: "./CardHeader.html",
})
export class OkklyCardHeader {
  /**
   * Title, rendered as an `<h3>`.
   *
   * @default undefined
   */
  readonly title = input<string>();
  /**
   * Secondary line under the title.
   *
   * @default undefined
   */
  readonly subheader = input<string>();

  private readonly avatar = contentChild(OkklyCardAvatar);
  private readonly action = contentChild(OkklyCardAction);

  protected readonly hasAvatar = computed(() => !!this.avatar());
  protected readonly hasAction = computed(() => !!this.action());
}

/** The card's body text. Mirrors `@okkly/react`'s `<CardContent>`. */
@Component({
  selector: "okkly-card-content",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: "okkly-card__content" },
  templateUrl: "./CardContent.html",
})
export class OkklyCardContent {}

/** The card's action row, divided from the content by a hairline. Mirrors `@okkly/react`'s `<CardActions>`. */
@Component({
  selector: "okkly-card-actions",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: "okkly-card__actions" },
  templateUrl: "./CardActions.html",
})
export class OkklyCardActions {}

/**
 * An image that bleeds to the card's edges and crops to `cover`. Mirrors
 * `@okkly/react`'s `<CardMedia>`, applied to the `<img>` itself as Angular
 * Material's `img[mat-card-image]` is. `alt` defaults to empty — the image is
 * usually decoration next to the title; set a real one when it is not.
 */
@Directive({
  selector: "img[okklyCardMedia]",
  host: {
    class: "okkly-card__media",
    alt: "",
    "[style.height]": "cssHeight()",
  },
})
export class OkklyCardMedia {
  /**
   * Image height — a number is pixels, a string any CSS length.
   *
   * @default 150
   */
  readonly height = input<number | string, number | string>(150, { transform: numeric });

  protected readonly cssHeight = computed(() => {
    const height = this.height();
    return typeof height === "number" ? `${height / 16}rem` : height;
  });
}
