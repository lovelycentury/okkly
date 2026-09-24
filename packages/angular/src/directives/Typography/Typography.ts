import { Directive, booleanAttribute, computed, input } from "@angular/core";

export type TypographyVariant =
  | "display-2xl"
  | "display-xl"
  | "display-lg"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "label-md"
  | "label-sm"
  | "caption"
  | "overline"
  | "mono-sm";

export type TypographyColor =
  "inherit" | "primary" | "secondary" | "muted" | "accent" | "success" | "warning" | "danger";

export type TypographyAlign = "inherit" | "left" | "center" | "right" | "justify";

/**
 * Inputs mirror `@okkly/react`'s `<Typography>` name-for-name — `variant`,
 * `color`, `align`, `gutterBottom`, `noWrap` — which itself follows MUI's
 * Typography API (https://mui.com/material-ui/api/typography/).
 *
 * Angular-specific: there is no `as` — put `okklyTypography` on whichever
 * element the markup calls for (`<h1 okklyTypography variant="display-lg">`),
 * as `OkklyBox` does. React's `TYPOGRAPHY_VARIANTS` map, which picks a default
 * element per variant when `as` is omitted, has no Angular equivalent for the
 * same reason: the consumer already chose the element by writing it. There is
 * also no `variantMapping` prop, since that map does not exist here.
 */
@Directive({
  selector: "[okklyTypography]",
  host: {
    class: "okkly-component okkly-typography",
    "[class]": "modifiers()",
  },
})
export class OkklyTypography {
  /**
   * Step in the type scale. Sets size, line height, weight and tracking.
   *
   * @default "body-md"
   */
  readonly variant = input<TypographyVariant>("body-md");
  /**
   * Text color. `inherit` keeps whatever the surface already sets.
   *
   * @default "inherit"
   */
  readonly color = input<TypographyColor>("inherit");
  /**
   * Horizontal alignment.
   *
   * @default "inherit"
   */
  readonly align = input<TypographyAlign>("inherit");
  /**
   * Adds a bottom margin proportional to the step's own font size.
   *
   * @default false
   */
  readonly gutterBottom = input(false, { transform: booleanAttribute });
  /**
   * Clips overflowing text to one line with an ellipsis.
   *
   * @default false
   */
  readonly noWrap = input(false, { transform: booleanAttribute });

  protected readonly modifiers = computed(() =>
    [
      this.variant() !== "body-md" && `okkly-typography--${this.variant()}`,
      this.color() !== "inherit" && `okkly-typography--color-${this.color()}`,
      this.align() !== "inherit" && `okkly-typography--align-${this.align()}`,
      this.gutterBottom() && "okkly-typography--gutter-bottom",
      this.noWrap() && "okkly-typography--no-wrap",
    ]
      .filter(Boolean)
      .join(" "),
  );
}
