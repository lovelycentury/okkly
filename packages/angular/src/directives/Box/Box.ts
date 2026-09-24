import { Directive, booleanAttribute, computed, input } from "@angular/core";
import { resolveBoxSystemProps } from "@okkly/shared";
import type {
  BoxAlign,
  BoxColor,
  BoxDisplay,
  BoxFlexDirection,
  BoxFlexWrap,
  BoxJustify,
  BoxResponsive,
  BoxSize,
  BoxSpacing,
  BoxSystemPropName,
  BoxSystemProps,
} from "@okkly/shared";

// The system props and the values they take are the contract every
// framework's Box shares, so they live in @okkly/shared.
export type {
  BoxAlign,
  BoxColor,
  BoxColorToken,
  BoxDisplay,
  BoxFlexDirection,
  BoxFlexWrap,
  BoxJustify,
  BoxResponsive,
  BoxSize,
  BoxSpacing,
  BoxSystemProps,
} from "@okkly/shared";

/**
 * A numeric attribute (`p="4"`) reads as the number a binding (`[p]="4"`)
 * passes, so a step on the 4px scale can be written either way. Every other
 * value — CSS strings, responsive objects — passes through.
 */
function numeric<T>(value: T): T {
  return (typeof value === "string" && /^-?\d*\.?\d+$/.test(value) ? Number(value) : value) as T;
}

/**
 * The layout primitive, as a directive: MUI-style system props for spacing,
 * flex layout, sizing, color and border on whatever element it decorates, each
 * responsive per viewport breakpoint or, through `@`-keys, per container
 * breakpoint. Inputs mirror `@okkly/react`'s `<Box>` name-for-name — the system
 * props themselves come from `@okkly/shared`, resolved into the same classes
 * and CSS variables — and through it MUI's Box and system properties.
 *
 * Angular-specific: there is no `as` — put `okklyBox` on the element you want
 * (`<section okklyBox>`), as Angular Material does with its attribute
 * directives; a numeric attribute (`p="4"`) reads as a number; and, as with any
 * Angular input, a static attribute also stays on the element, while a
 * binding (`[p]="4"`) leaves no trace in the DOM. The element's own `class`
 * and `style` merge with the directive's.
 */
@Directive({
  selector: "[okklyBox]",
  host: {
    class: "okkly-component okkly-box",
    "[class]": "system().className",
    "[style]": "system().style",
  },
})
export class OkklyBox {
  /**
   * Makes the Box a query container: its descendants' `@`-keys (`"@md"`)
   * answer to its width. Only its inline size is measured, so its width stops
   * following its content — avoid it on `inline-flex`/`inline-block` Boxes.
   *
   * @default false
   */
  readonly container = input(false, { transform: booleanAttribute });

  /**
   * Margin on every side. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   */
  readonly m = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Margin on the inline axis — left and right, mirrored in RTL.
   *
   * @default undefined
   */
  readonly mx = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Margin on the block axis — top and bottom.
   *
   * @default undefined
   */
  readonly my = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Top margin.
   *
   * @default undefined
   */
  readonly mt = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Margin at the inline end — right in LTR.
   *
   * @default undefined
   */
  readonly mr = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Bottom margin.
   *
   * @default undefined
   */
  readonly mb = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Margin at the inline start — left in LTR.
   *
   * @default undefined
   */
  readonly ml = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Padding on every side. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   */
  readonly p = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Padding on the inline axis — left and right, mirrored in RTL.
   *
   * @default undefined
   */
  readonly px = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Padding on the block axis — top and bottom.
   *
   * @default undefined
   */
  readonly py = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Top padding.
   *
   * @default undefined
   */
  readonly pt = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Padding at the inline end — right in LTR.
   *
   * @default undefined
   */
  readonly pr = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Bottom padding.
   *
   * @default undefined
   */
  readonly pb = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Padding at the inline start — left in LTR.
   *
   * @default undefined
   */
  readonly pl = input<BoxResponsive<BoxSpacing> | undefined, BoxResponsive<BoxSpacing> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Gap between flex or grid children, on both axes.
   *
   * @default undefined
   */
  readonly gap = input<
    BoxResponsive<BoxSpacing> | undefined,
    BoxResponsive<BoxSpacing> | undefined
  >(undefined, { transform: numeric });
  /**
   * Gap between rows.
   *
   * @default undefined
   */
  readonly rowGap = input<
    BoxResponsive<BoxSpacing> | undefined,
    BoxResponsive<BoxSpacing> | undefined
  >(undefined, { transform: numeric });
  /**
   * Gap between columns.
   *
   * @default undefined
   */
  readonly columnGap = input<
    BoxResponsive<BoxSpacing> | undefined,
    BoxResponsive<BoxSpacing> | undefined
  >(undefined, { transform: numeric });
  /**
   * CSS `display`.
   *
   * @default undefined
   */
  readonly display = input<BoxResponsive<BoxDisplay> | undefined>(undefined);
  /**
   * CSS `flex-direction`.
   *
   * @default undefined
   */
  readonly flexDirection = input<BoxResponsive<BoxFlexDirection> | undefined>(undefined);
  /**
   * CSS `flex-wrap`.
   *
   * @default undefined
   */
  readonly flexWrap = input<BoxResponsive<BoxFlexWrap> | undefined>(undefined);
  /**
   * CSS `align-items`.
   *
   * @default undefined
   */
  readonly alignItems = input<BoxResponsive<BoxAlign> | undefined>(undefined);
  /**
   * CSS `justify-content`.
   *
   * @default undefined
   */
  readonly justifyContent = input<BoxResponsive<BoxJustify> | undefined>(undefined);
  /**
   * CSS `align-self`.
   *
   * @default undefined
   */
  readonly alignSelf = input<BoxResponsive<BoxAlign> | undefined>(undefined);
  /**
   * CSS `flex-grow`.
   *
   * @default undefined
   */
  readonly flexGrow = input<
    BoxResponsive<number | string> | undefined,
    BoxResponsive<number | string> | undefined
  >(undefined, { transform: numeric });
  /**
   * CSS `flex-shrink`.
   *
   * @default undefined
   */
  readonly flexShrink = input<
    BoxResponsive<number | string> | undefined,
    BoxResponsive<number | string> | undefined
  >(undefined, { transform: numeric });
  /**
   * CSS `flex-basis`. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   */
  readonly flexBasis = input<
    BoxResponsive<BoxSize> | undefined,
    BoxResponsive<BoxSize> | undefined
  >(undefined, { transform: numeric });
  /**
   * Width. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   */
  readonly width = input<BoxResponsive<BoxSize> | undefined, BoxResponsive<BoxSize> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Height. A fraction up to `1` is a percentage, a larger number is pixels.
   *
   * @default undefined
   */
  readonly height = input<BoxResponsive<BoxSize> | undefined, BoxResponsive<BoxSize> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Minimum width.
   *
   * @default undefined
   */
  readonly minWidth = input<BoxResponsive<BoxSize> | undefined, BoxResponsive<BoxSize> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Maximum width.
   *
   * @default undefined
   */
  readonly maxWidth = input<BoxResponsive<BoxSize> | undefined, BoxResponsive<BoxSize> | undefined>(
    undefined,
    { transform: numeric },
  );
  /**
   * Minimum height.
   *
   * @default undefined
   */
  readonly minHeight = input<
    BoxResponsive<BoxSize> | undefined,
    BoxResponsive<BoxSize> | undefined
  >(undefined, { transform: numeric });
  /**
   * Maximum height.
   *
   * @default undefined
   */
  readonly maxHeight = input<
    BoxResponsive<BoxSize> | undefined,
    BoxResponsive<BoxSize> | undefined
  >(undefined, { transform: numeric });
  /**
   * Background color — a token path (`"bg.surface-raised"`) or any CSS color.
   *
   * @default undefined
   */
  readonly bgcolor = input<BoxResponsive<BoxColor> | undefined>(undefined);
  /**
   * Text color — a token path (`"text.secondary"`) or any CSS color.
   *
   * @default undefined
   */
  readonly color = input<BoxResponsive<BoxColor> | undefined>(undefined);
  /**
   * Border on every side. A number is its width in pixels, drawn solid in the
   * default border color; a string is the CSS `border` shorthand.
   *
   * @default undefined
   */
  readonly border = input<
    BoxResponsive<number | string> | undefined,
    BoxResponsive<number | string> | undefined
  >(undefined, { transform: numeric });
  /**
   * Border color — a token path (`"border.strong"`) or any CSS color.
   *
   * @default undefined
   */
  readonly borderColor = input<BoxResponsive<BoxColor> | undefined>(undefined);
  /**
   * Corner radius. A number steps on the 4px scale; a string is CSS.
   *
   * @default undefined
   */
  readonly borderRadius = input<
    BoxResponsive<BoxSpacing> | undefined,
    BoxResponsive<BoxSpacing> | undefined
  >(undefined, { transform: numeric });

  /** Every system prop, for @okkly/shared to resolve — a missing one is a type error. */
  private readonly systemProps = computed(
    (): { [K in BoxSystemPropName]-?: BoxSystemProps[K] } => ({
      m: this.m(),
      mx: this.mx(),
      my: this.my(),
      mt: this.mt(),
      mr: this.mr(),
      mb: this.mb(),
      ml: this.ml(),
      p: this.p(),
      px: this.px(),
      py: this.py(),
      pt: this.pt(),
      pr: this.pr(),
      pb: this.pb(),
      pl: this.pl(),
      gap: this.gap(),
      rowGap: this.rowGap(),
      columnGap: this.columnGap(),
      display: this.display(),
      flexDirection: this.flexDirection(),
      flexWrap: this.flexWrap(),
      alignItems: this.alignItems(),
      justifyContent: this.justifyContent(),
      alignSelf: this.alignSelf(),
      flexGrow: this.flexGrow(),
      flexShrink: this.flexShrink(),
      flexBasis: this.flexBasis(),
      width: this.width(),
      height: this.height(),
      minWidth: this.minWidth(),
      maxWidth: this.maxWidth(),
      minHeight: this.minHeight(),
      maxHeight: this.maxHeight(),
      bgcolor: this.bgcolor(),
      color: this.color(),
      border: this.border(),
      borderColor: this.borderColor(),
      borderRadius: this.borderRadius(),
    }),
  );

  /** The classes and CSS variables the host binds — the same resolution @okkly/react's Box runs. */
  protected readonly system = computed(() =>
    resolveBoxSystemProps({ ...this.systemProps(), container: this.container() }),
  );
}
