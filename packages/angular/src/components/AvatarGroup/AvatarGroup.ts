import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  numberAttribute,
} from "@angular/core";
import {
  AVATAR_GROUP_MEMBER,
  type AvatarColor,
  type AvatarGroupMember,
  type AvatarSize,
} from "../Avatar/Avatar";

export type AvatarGroupSize = AvatarSize;
export type AvatarGroupSpacing = "dense" | "default" | "loose";

/**
 * Marks one member of an `OkklyAvatarGroup`. Written as a structural
 * directive — `<okkly-avatar *okklyAvatarGroupItem initials="OK" />` — so the
 * group can decide which members to render, wrap each one, and hand it the
 * group's size and tone.
 */
@Directive({ selector: "[okklyAvatarGroupItem]" })
export class OkklyAvatarGroupItem {
  readonly template = inject(TemplateRef);
}

/**
 * A stack of overlapping avatars. Inputs mirror `@okkly/react`'s
 * `<AvatarGroup>` name-for-name — `max`, `total`, `size`, `spacing`, `ring`,
 * `hues` — which follows MUI's AvatarGroup API for `max`/`total`. Angular
 * Material has no avatar group.
 *
 * Deliberate gaps: React clones its `<Avatar>` children to override their
 * size and colour; Angular cannot reach into projected components that way,
 * so each member is an `okkly-avatar` marked `*okklyAvatarGroupItem`. The
 * group renders the members it keeps, each in its own wrapper, and the
 * avatar picks its size and tone up from the group.
 */
@Component({
  selector: "okkly-avatar-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  host: {
    class: "okkly-component okkly-avatar-group",
    "[class]": "modifiers()",
  },
  templateUrl: "./AvatarGroup.html",
})
export class OkklyAvatarGroup {
  /**
   * Avatars visible before the "+N" chip. At or over it, one slot goes to the chip.
   *
   * @default 5
   */
  readonly max = input(5, { transform: (value: unknown) => numberAttribute(value, 5) });
  /**
   * Real member count behind the "+N" chip, when higher than the members passed in.
   *
   * @default undefined
   */
  readonly total = input<number | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)),
  });
  /**
   * Diameter applied to every member.
   *
   * @default "sm"
   */
  readonly size = input<AvatarGroupSize>("sm");
  /**
   * Overlap amount.
   *
   * @default "default"
   */
  readonly spacing = input<AvatarGroupSpacing>("default");
  /**
   * Canvas-coloured separator ring around each member.
   *
   * @default true
   */
  readonly ring = input(true, { transform: booleanAttribute });
  /**
   * Gradient tones cycled across the members, in order.
   *
   * @default ["mint"]
   */
  readonly hues = input<AvatarColor[]>(["mint"]);

  private readonly injector = inject(Injector);
  private readonly items = contentChildren(OkklyAvatarGroupItem);
  /** One injector per position, reused so a member's view survives list changes. */
  private readonly memberInjectors: Injector[] = [];

  protected readonly renderedCount = computed(() => {
    const count = this.items().length;
    return count > this.max() ? Math.max(this.max() - 1, 0) : count;
  });

  protected readonly overflowCount = computed(
    () => (this.total() ?? this.items().length) - this.renderedCount(),
  );

  protected readonly members = computed(() =>
    this.items()
      .slice(0, this.renderedCount())
      .map((item, index) => ({ item, injector: this.memberInjector(index) })),
  );

  protected readonly modifiers = computed(() =>
    [
      this.size() !== "sm" && `okkly-avatar-group--${this.size()}`,
      this.spacing() !== "default" && `okkly-avatar-group--${this.spacing()}`,
      !this.ring() && "okkly-avatar-group--no-ring",
    ]
      .filter(Boolean)
      .join(" "),
  );

  private memberInjector(index: number): Injector {
    this.memberInjectors[index] ??= Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: AVATAR_GROUP_MEMBER,
          useValue: {
            size: this.size,
            color: computed(() => {
              const hues = this.hues();
              return hues[index % hues.length] ?? "mint";
            }),
          } satisfies AvatarGroupMember,
        },
      ],
    });
    return this.memberInjectors[index];
  }
}
