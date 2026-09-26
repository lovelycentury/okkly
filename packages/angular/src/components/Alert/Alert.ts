import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  output,
  viewChild,
  type ElementRef,
} from "@angular/core";
import { projectedContent } from "../../helpers/content";
import { OkklySeverityIcon, type SeverityIconSeverity } from "../SeverityIcon/SeverityIcon";

export type AlertSeverity = "success" | "info" | "warning" | "danger" | "dante";
export type AlertVariant = "standard" | "outlined" | "filled";

const SEVERITY_ICON_MAP: Record<AlertSeverity, SeverityIconSeverity> = {
  success: "success",
  info: "primary",
  warning: "warning",
  danger: "danger",
  dante: "primary",
};

/** Marks the projected element that replaces the built-in severity icon. */
@Directive({ selector: "[okklyAlertIcon]" })
export class OkklyAlertIcon {}

/** Marks the projected element that renders in the trailing action slot. */
@Directive({ selector: "[okklyAlertAction]" })
export class OkklyAlertAction {}

/**
 * An inline banner, rendered as a `role="alert"` live region. Inputs mirror
 * `@okkly/react`'s `<Alert>` name-for-name — `severity`, `variant`, `title`,
 * `icon` — which follows MUI's Alert API. Angular Material has no alert.
 *
 * Deliberate gaps: React renders the close button when `onClose` is set;
 * Angular cannot see whether a `(close)` listener exists, so `closable` turns
 * it on and `close` reports the click. The message is the default
 * `<ng-content />`; a custom icon and the action are projected content tagged
 * `okklyAlertIcon` and `okklyAlertAction`, and `icon` is a boolean that hides
 * the icon (React's `icon={false}`). `title` is an input, not the native
 * attribute — the host clears it so no browser tooltip appears.
 */
@Component({
  selector: "okkly-alert",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [OkklySeverityIcon],
  host: {
    class: "okkly-component okkly-alert",
    "[class]": "modifiers()",
    role: "alert",
    "[attr.title]": "null",
  },
  templateUrl: "./Alert.html",
})
export class OkklyAlert {
  /**
   * Semantic tone — drives the icon and accent colours.
   *
   * @default "info"
   */
  readonly severity = input<AlertSeverity>("info");
  /**
   * Surface treatment.
   *
   * @default "standard"
   */
  readonly variant = input<AlertVariant>("standard");
  /**
   * Bold headline above the message.
   *
   * @default undefined
   */
  readonly title = input<string>();
  /**
   * Whether to show the icon — the severity's own, or a projected `okklyAlertIcon`.
   *
   * @default true
   */
  readonly icon = input(true, { transform: booleanAttribute });
  /**
   * Renders a dismiss button that emits `close`. The alert is yours to remove.
   *
   * @default false
   */
  readonly closable = input(false, { transform: booleanAttribute });

  /** Emits when the dismiss button is clicked. */
  readonly close = output<void>();

  private readonly customIcon = contentChild(OkklyAlertIcon);
  private readonly action = contentChild(OkklyAlertAction);
  private readonly messageSlot = viewChild.required<ElementRef<HTMLElement>>("messageSlot");

  protected readonly hasCustomIcon = computed(() => !!this.customIcon());
  protected readonly hasAction = computed(() => !!this.action());
  protected readonly hasMessage = projectedContent(() => this.messageSlot().nativeElement);
  protected readonly iconSeverity = computed(() => SEVERITY_ICON_MAP[this.severity()]);

  protected readonly modifiers = computed(() =>
    [
      this.severity() !== "info" && `okkly-alert--${this.severity()}`,
      this.variant() !== "standard" && `okkly-alert--${this.variant()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
