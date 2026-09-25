import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  ViewEncapsulation,
  computed,
  inject,
  input,
  linkedSignal,
  type Signal,
} from "@angular/core";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "rounded";
export type AvatarStatus = "online" | "offline";
export type AvatarColor = "mint" | "dante" | "indigo";

/**
 * What an `OkklyAvatarGroup` imposes on one member — the counterpart of React's
 * `cloneElement(child, { size, color })`. Provided per member by the group.
 */
export interface AvatarGroupMember {
  size: Signal<AvatarSize>;
  color: Signal<AvatarColor>;
}

export const AVATAR_GROUP_MEMBER = new InjectionToken<AvatarGroupMember>("AVATAR_GROUP_MEMBER");

/**
 * Inputs mirror `@okkly/react`'s `<Avatar>` name-for-name — `src`, `alt`,
 * `initials`, `status`, `shape`, `size`, `color` — which follows MUI's Avatar
 * API where the shapes line up. Angular Material has no avatar.
 *
 * Deliberate gaps: `initials` replaces MUI's children (this design always
 * renders letters, never an arbitrary node). A failed image falls back to the
 * initials, as in React; a new `src` gets a fresh attempt.
 */
@Component({
  selector: "okkly-avatar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-avatar",
    "[class]": "modifiers()",
    "[attr.role]": "alt() ? 'img' : null",
    "[attr.aria-label]": "alt() || null",
  },
  templateUrl: "./Avatar.html",
})
export class OkklyAvatar {
  /**
   * Image source; falls back to `initials` when unset or when it fails to load.
   *
   * @default undefined
   */
  readonly src = input<string>();
  /**
   * Accessible name. Also exposes the avatar as `role="img"` when set.
   *
   * @default undefined
   */
  readonly alt = input<string>();
  /**
   * Fallback letters, shown when there's no image. Only the first two characters are used.
   *
   * @default undefined
   */
  readonly initials = input<string>();
  /**
   * Presence dot. Omit for no status.
   *
   * @default undefined
   */
  readonly status = input<AvatarStatus>();
  /**
   * Avatar shape.
   *
   * @default "circle"
   */
  readonly shape = input<AvatarShape>("circle");
  /**
   * Avatar diameter.
   *
   * @default "md"
   */
  readonly size = input<AvatarSize>("md");
  /**
   * Gradient tone, used when no image is shown.
   *
   * @default "mint"
   */
  readonly color = input<AvatarColor>("mint");

  /** Set when this avatar is a member of an `OkklyAvatarGroup`, which then decides its size and tone. */
  private readonly member = inject(AVATAR_GROUP_MEMBER, { optional: true });

  private readonly effectiveSize = computed(() => this.member?.size() ?? this.size());
  private readonly effectiveColor = computed(() => this.member?.color() ?? this.color());

  protected readonly imageFailed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly showImage = computed(() => !!this.src() && !this.imageFailed());
  protected readonly shortInitials = computed(() => (this.initials() ?? "").slice(0, 2));

  protected readonly modifiers = computed(() =>
    [
      this.shape() === "rounded" && "okkly-avatar--rounded",
      this.effectiveSize() !== "md" && `okkly-avatar--${this.effectiveSize()}`,
      !this.showImage() &&
        this.effectiveColor() !== "mint" &&
        `okkly-avatar--color-${this.effectiveColor()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
