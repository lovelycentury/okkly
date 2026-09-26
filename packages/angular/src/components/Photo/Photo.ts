import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  linkedSignal,
} from "@angular/core";
import { OkklySkeleton } from "../Skeleton/Skeleton";

export type PhotoVariant = "plain" | "framed" | "scrim" | "noir" | "cutout";
export type PhotoSize = "sm" | "md" | "lg";
export type PhotoRadius = "none" | "sm" | "md" | "lg" | "xl";

/** Marks the projected element that replaces the silhouette placeholder. */
@Directive({ selector: "[okklyPhotoFallback]" })
export class OkklyPhotoFallback {}

/**
 * A portrait or a hero cutout on a dark surface. Inputs mirror
 * `@okkly/react`'s `<Photo>` name-for-name — `image`, `alt`, `variant`,
 * `scrim`, `transparent`, `size`, `caption`, `radius`, `loading`. No MUI or
 * Angular Material equivalent.
 *
 * Deliberate gaps: React's `fallback` node becomes projected content tagged
 * `okklyPhotoFallback`. A new `image` gets a fresh load, clearing an earlier
 * failure. `alt` names the image, or the placeholder when there is none, so
 * the slot is never an unlabelled blank.
 */
@Component({
  selector: "okkly-photo",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [OkklySkeleton],
  host: {
    class: "okkly-component okkly-photo",
    "[class]": "modifiers()",
  },
  templateUrl: "./Photo.html",
})
export class OkklyPhoto {
  /**
   * Source image (a transparent PNG suits `cutout`). Falls back to a silhouette when omitted or broken.
   *
   * @default undefined
   */
  readonly image = input<string>();
  /**
   * Accessible name of the image, or of the placeholder when there is no image.
   */
  readonly alt = input.required<string>();
  /**
   * Frame and overlay treatment.
   *
   * @default "plain"
   */
  readonly variant = input<PhotoVariant>("plain");
  /**
   * Adds the bottom darkening gradient on top of any `variant`. Implied by
   * `scrim`/`noir` and by `caption`, which is unreadable without it.
   *
   * @default false
   */
  readonly scrim = input(false, { transform: booleanAttribute });
  /**
   * Alias for `variant="cutout"` — drops the frame and the corners.
   *
   * @default false
   */
  readonly transparent = input(false, { transform: booleanAttribute });
  /**
   * Portrait dimensions.
   *
   * @default "md"
   */
  readonly size = input<PhotoSize>("md");
  /**
   * Name or role over the scrim.
   *
   * @default undefined
   */
  readonly caption = input<string>();
  /**
   * Corners. Ignored on a cutout.
   *
   * @default "xl"
   */
  readonly radius = input<PhotoRadius>("xl");
  /**
   * Shows a skeleton until the image loads.
   *
   * @default false
   */
  readonly loading = input(false, { transform: booleanAttribute });

  private readonly fallback = contentChild(OkklyPhotoFallback);

  protected readonly loaded = linkedSignal({ source: this.image, computation: () => false });
  protected readonly failed = linkedSignal({ source: this.image, computation: () => false });

  protected readonly hasFallback = computed(() => !!this.fallback());
  protected readonly isCutout = computed(() => this.variant() === "cutout" || this.transparent());
  // A caption is white text on an unknown photo, so it brings its own scrim.
  protected readonly showScrim = computed(
    () =>
      (this.scrim() ||
        this.variant() === "scrim" ||
        this.variant() === "noir" ||
        !!this.caption()) &&
      !this.isCutout(),
  );
  protected readonly showNoir = computed(() => this.variant() === "noir" && !this.isCutout());
  protected readonly showSkeleton = computed(
    () => this.loading() && !!this.image() && !this.loaded() && !this.failed(),
  );
  protected readonly showImage = computed(() => !!this.image() && !this.failed());

  protected readonly modifiers = computed(() =>
    [
      `okkly-photo--${this.variant()}`,
      `okkly-photo--size-${this.size()}`,
      !this.isCutout() && this.radius() !== "xl" && `okkly-photo--radius-${this.radius()}`,
      this.isCutout() && "okkly-photo--transparent",
      this.showScrim() && "okkly-photo--scrim",
      // `okkly-photo--noir` already comes from the variant name above.
    ]
      .filter(Boolean)
      .join(" "),
  );
}
