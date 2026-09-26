# @okkly/angular

## 0.4.0

### Minor Changes

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`3124f75`](https://github.com/lovelycentury/okkly/commit/3124f7580b8b26b52a9b6836d109530830cf21f5) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyAlert` (`okkly-alert`), an inline `role="alert"` banner mirroring `@okkly/react`'s `<Alert>`: five severities, three variants, a title, a severity icon that can be swapped (`okklyAlertIcon`) or hidden, an `okklyAlertAction` slot, and a `closable` dismiss button that emits `close`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`00b7137`](https://github.com/lovelycentury/okkly/commit/00b7137d66111b94167b0d36774ab3382bd1659c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyAvatarGroup` (`okkly-avatar-group`) with the `*okklyAvatarGroupItem` member marker, mirroring `@okkly/react`'s `<AvatarGroup>`: a stack of avatars that collapses past `max` into a "+N" chip, with `total`, `size`, `spacing`, `ring` and cycled `hues`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`2f1bcd3`](https://github.com/lovelycentury/okkly/commit/2f1bcd350b9dd45499f8bc207772a69ccbdc697b) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyAvatar` (`okkly-avatar`), a person's image or initials mirroring `@okkly/react`'s `<Avatar>`: falls back to the initials when the image fails, with a presence dot, two shapes, three sizes and three tones.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`73320ac`](https://github.com/lovelycentury/okkly/commit/73320ac37688d5da1dedbd35f1c7ce02330a5bd5) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyBadge` (`okkly-badge`), a count or status dot pinned to projected content, or a standalone pill without it, mirroring `@okkly/react`'s `<Badge>`: nine tones, dot variant, `max` overflow, `invisible`, `overlap` and `anchorOrigin`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`02cecac`](https://github.com/lovelycentury/okkly/commit/02cecacbb40a61096e361e3fdd634b081c86ad23) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyBreadcrumbs` (`okkly-breadcrumbs`), the trail of parent pages ending at the current one, collapsing behind a "…" past `maxItems`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`3c61cfb`](https://github.com/lovelycentury/okkly/commit/3c61cfb77ab50e454410382f0cf658b82311004d) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyButtonGroup` (`okkly-button-group`), a split button mirroring `@okkly/react`'s `<ButtonGroup>`, composed from `button[okklyButtonGroupAction]` (with an optional `okklyButtonGroupIcon`) and `button[okklyButtonGroupMenuItem]` entries: two variants, six tones and a `disabled` state. The chevron's menu opens in an `OkklyPopover` with its Grow transition and full keyboard support.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`75bf27e`](https://github.com/lovelycentury/okkly/commit/75bf27e3a7da2f42865bdebb6b7a84d509e535bc) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyCard` (`okkly-card`) and its slots — `okkly-card-header` (with `okklyCardAvatar`/`okklyCardAction`), `okkly-card-content`, `okkly-card-actions` and `img[okklyCardMedia]` — mirroring `@okkly/react`'s `<Card>` family: five surfaces, four padding presets, an aura tone and an interactive hover lift.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`2727529`](https://github.com/lovelycentury/okkly/commit/27275294af2c8c4d74bf7f5a4e62b067273af527) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyCheckboxGroup` (`okkly-checkbox-group`), mirroring `@okkly/react`'s `<CheckboxGroup>`: nested `okkly-checkbox` options share a name and the group's `[(value)]` array, and inherit its `disabled`, `size` and `color` unless they set their own.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`c1d075c`](https://github.com/lovelycentury/okkly/commit/c1d075cd415f40eea3ae8cea13e8298ac272209f) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyCheckbox` (`okkly-checkbox`), a binary or indeterminate choice mirroring `@okkly/react`'s `<Checkbox>`: `[(checked)]` and `[(indeterminate)]`, a built-in label, three sizes and nine tones.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`f1f5566`](https://github.com/lovelycentury/okkly/commit/f1f556697e1c536931f1cff75c2baceafb9b2dbe) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyChipGroup` (`okkly-chip-group`) with the `okklyChipGroupOption` chip marker, mirroring `@okkly/react`'s `<ChipGroup>`: single (`exclusive`) or multiple selection bound with `[(value)]`, six tones for selected chips, and a `disabled` state.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`2a5afc1`](https://github.com/lovelycentury/okkly/commit/2a5afc186ad227c61a36af82f50e377eecc80044) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyChip` (`okkly-chip`), a filter, tag or choice token mirroring `@okkly/react`'s `<Chip>`: five variants, three sizes, a leading dot or `okklyChipIcon`, a `clickable` toggle with keyboard support, and a removable × that emits `removed`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`0e0c97f`](https://github.com/lovelycentury/okkly/commit/0e0c97f072b245591fd2d01a427cda819ecf5829) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyDivider` (`okkly-divider`), a hairline separator for lists, stacks and toolbars, mirroring `@okkly/react`'s `<Divider>`: horizontal or vertical, `inset`/`middle` variants, `flexItem`, and an optional label tagged `okklyDividerLabel` aligned left, center or right.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`0387c82`](https://github.com/lovelycentury/okkly/commit/0387c82b17591d34f07267ab0eb75e1631a13ae0) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyEmptyState` (`okkly-empty-state`), the panel that stands in for an empty list, with a severity icon or a projected `okklyEmptyStateIcon` glyph and an `okklyEmptyStateAction` row.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`be17eaa`](https://github.com/lovelycentury/okkly/commit/be17eaa1be10d4d8195b406a372a002873eb08ec) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyFab` (`button[okklyFab]`, `a[okklyFab]`), the floating action button, round with a projected glyph or an extended pill with a `label`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`0cb1fa9`](https://github.com/lovelycentury/okkly/commit/0cb1fa9d474aaf6f49846dc7ac246174889599be) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyIconButton` (`button[okklyIconButton]`, `a[okklyIconButton]`), an icon-only control mirroring `@okkly/react`'s `<IconButton>`: ghost, glass or solid, six tones, three sizes, the press ripple, and a disabled state that also covers links.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`0e62d70`](https://github.com/lovelycentury/okkly/commit/0e62d705684abffe4f7c909d15ef193e02331ba4) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyIcon` (`okkly-icon`), a glyph from `@okkly/icons` mirroring `@okkly/react`'s `<Icon>`: pick it by `name` or pass imported markup via `icon`, with `color`, `fontSize` and `titleAccess` inputs. `@okkly/icons` is now a dependency and `@angular/platform-browser` a peer dependency.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`b9905fa`](https://github.com/lovelycentury/okkly/commit/b9905fa56d9f7a833e80ff9ede63afef146f36b0) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyInlineAction` (`okkly-inline-action`), a text field with an inline action button and a feedback caption, with loading, success, error and read-only states.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`0dd10cf`](https://github.com/lovelycentury/okkly/commit/0dd10cf856a34a08433f17c77273e9ab1c8434e0) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyLinkCard` (`a[okklyLinkCard]`, `div[okklyLinkCard]`), the "links page" row with a title, subtitle, trailing tag and arrow, featured on glass or as an `interactive` button row.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`1839659`](https://github.com/lovelycentury/okkly/commit/183965990dc1a725e0c3ec8e62a9e457527f9a6f) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyList` (`ul[okklyList]`) and `OkklyListItem` (`li[okklyListItem]`) with `okkly-list-item-text`, `okkly-list-item-icon` and the `okklyListItemStart`/`okklyListItemEnd` slots; a `button` row renders a real `<button>`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`3e0c773`](https://github.com/lovelycentury/okkly/commit/3e0c773d7181551c4a15755495dece123cd116fd) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyLogo` (`okkly-logo`), the brand lockup: the disc mark filled, outlined or bare, in the brand gradient or a flat tone, with an optional wordmark.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`22829ee`](https://github.com/lovelycentury/okkly/commit/22829ee7532513ed356f2d1da50bdadb27da0ef9) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyNumberInput` (`okkly-number-input`), a numeric field with a two-way `number | null` value, stepper or chevron controls, arrow-key stepping and clamping to `min`/`max`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`4088057`](https://github.com/lovelycentury/okkly/commit/40880578afc989b4254e77b1a6302222bb7412bb) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyOnly` (`*okklyOnly="{ from, to }"`), a structural directive that creates its element only while the viewport is within a breakpoint range, and the `mediaQuery` helper behind it.

- [#271](https://github.com/lovelycentury/okkly/pull/271) [`a26b9fc`](https://github.com/lovelycentury/okkly/commit/a26b9fce38413b625aef0d02e58055894e45a576) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add the overlay family, mirroring `@okkly/react`'s: `OkklyPopper` (`okkly-popper`), Popper.js positioning with portals, flipping and anchor-width matching; `OkklyPopover` (`okkly-popover`), an anchored paper surface with Escape, click-outside and a Grow transition; `OkklyTooltip` (`[okklyTooltip]`), a trigger directive in the shape of Angular Material's `matTooltip` that names or describes its trigger as the trigger needs; and `OkklyModal` (`okkly-modal`), the portal, backdrop, focus trap and scroll lock the modal overlays are built from.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`954e21a`](https://github.com/lovelycentury/okkly/commit/954e21a762090caba4ae9ab0edee35a91bc39594) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyPhoto` (`okkly-photo`), a framed portrait or hero cutout mirroring `@okkly/react`'s `<Photo>`: five treatments, a caption with its own scrim, three sizes, five corner radii, an optional loading skeleton, and a silhouette placeholder that an `okklyPhotoFallback` can replace.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`715aa37`](https://github.com/lovelycentury/okkly/commit/715aa3721f64c1dde3e362ba7f96bb991a5a009c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyProgress` (`okkly-progress`), a linear or circular progress indicator mirroring `@okkly/react`'s `<Progress>`: determinate or indeterminate, three sizes, nine tones, and an optional percentage label on the ring.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`e6cc6fa`](https://github.com/lovelycentury/okkly/commit/e6cc6fa3ad94a7860aed967dd16525b6d97dd527) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyProjectCard` (`a[okklyProjectCard]`, `div[okklyProjectCard]`), the portfolio case-study tile with artwork, tags, an optional device mockup and an `okklyProjectCardLogo` slot.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`f4b36f2`](https://github.com/lovelycentury/okkly/commit/f4b36f28ff02ea52dfccd7617c9a793f56b41a98) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyRadioGroup` (`okkly-radio-group`), mirroring `@okkly/react`'s `<RadioGroup>`: nested `okkly-radio` options share a name and the group's `[(value)]`, and inherit its `disabled`, `size` and `color` unless they set their own.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`7419b5d`](https://github.com/lovelycentury/okkly/commit/7419b5d193fc29bd8d916db7d3ae05968c85b36c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyRadio` (`okkly-radio`), one option of a single choice mirroring `@okkly/react`'s `<Radio>`: `[(checked)]`, a built-in label, three sizes and six tones, with name, value, id and aria-label on the native input.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`bc0d369`](https://github.com/lovelycentury/okkly/commit/bc0d369861b14ba4ef80f471533ed34df8668984) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyRating` (`okkly-rating`), a star or heart rating with half steps, hover preview, arrow-key stepping, a read-only display and an `okklyRatingIcon` template for custom glyphs.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`c889608`](https://github.com/lovelycentury/okkly/commit/c8896088c9beace733f7cdd2cf44c3178c7bf287) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklySegmentedToggle` (`okkly-segmented-toggle`), connected segments for a single choice or, with `exclusive` off, a multi-select toggle group.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`4affe82`](https://github.com/lovelycentury/okkly/commit/4affe82b633ce1d307e63de86bca4ed47199137a) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklySeverityIcon` (`okkly-severity-icon`), a tinted status chip mirroring `@okkly/react`'s `<SeverityIcon>`: six tones with a default glyph each, three sizes, two shapes, an optional `label`, and an `okklySeverityIconGlyph` slot to swap the glyph.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`f5b3bda`](https://github.com/lovelycentury/okkly/commit/f5b3bdaf3acdcd4519da601197f7e9f5932df6cb) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklySkeleton` (`okkly-skeleton`), a loading placeholder mirroring `@okkly/react`'s `<Skeleton>`: four shapes, pixel or CSS-length sizing, and pulse, wave or no animation.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`478fe03`](https://github.com/lovelycentury/okkly/commit/478fe0342255ddd3b81d39f91fae74d7fa367afa) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklySlider` (`okkly-slider`), a single or range slider with marks, discrete snapping, value labels, vertical layout, pointer dragging and full keyboard support.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`5ed8cfc`](https://github.com/lovelycentury/okkly/commit/5ed8cfcaec816b3666e0c220a29e73065aee924b) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklySpinner` (`okkly-spinner`), an indeterminate loading ring mirroring `@okkly/react`'s `<Spinner>`: three size presets, nine tones, and a `thickness` override.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`6fff846`](https://github.com/lovelycentury/okkly/commit/6fff846657622b2a54d23681627734b84ed45c74) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyStatCard` (`okkly-stat-card`), the dashboard tile with a headline value, a label, a spoken trend badge and an `okklyStatCardIcon` chip.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`807140c`](https://github.com/lovelycentury/okkly/commit/807140c4e1838018a0f4011562fc7f9cc95a6d8d) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklySwitch` (`okkly-switch`), an immediate on/off toggle mirroring `@okkly/react`'s `<Switch>`: a native checkbox with `role="switch"`, `[(checked)]`, a built-in label, three sizes and six tones.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`decff72`](https://github.com/lovelycentury/okkly/commit/decff72e691702034ef2296237b033b9ec81206e) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyTextArea` (`okkly-text-area`), a multi-line text field with a two-way `value`, a character counter for `maxLength` and `autosize` between `rows` and `maxRows`.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`77c1d38`](https://github.com/lovelycentury/okkly/commit/77c1d38c8da788556468bb412548d4c843b49b6e) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add the MUI-style transitions of `@okkly/react`: `OkklyFade`, `OkklyGrow`, `OkklyZoom` and `OkklySlide` as structural directives on the element they animate (`*okklyFade="open; timeout: 300; unmountOnExit: true"`), and `OkklyCollapse` (`okkly-collapse`) as a component with an `okklyCollapseContent` template for lazy content. All share `appear`, `timeout`, `easing`, `mountOnEnter`, `unmountOnExit` and the six lifecycle phases as outputs.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`92a4c8f`](https://github.com/lovelycentury/okkly/commit/92a4c8f978bf99fb49be41b0957336b83fa3b1a9) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyTypography` (`[okklyTypography]`), the editorial type scale as a directive: `variant`, `color`, `align`, `gutterBottom` and `noWrap` mirror `@okkly/react`'s `<Typography>` name-for-name, applied to whatever element the markup calls for.

### Patch Changes

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`cf7023e`](https://github.com/lovelycentury/okkly/commit/cf7023ef05a5aa5087a556204dd2f9720847d74e) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Fix a disabled or loading `<a okklyButton>` still firing the consumer's `(click)` handler: the click is now swallowed before it reaches listeners on the element.

- [#272](https://github.com/lovelycentury/okkly/pull/272) [`44f650b`](https://github.com/lovelycentury/okkly/commit/44f650b551077474f0ccecf94885ca0556aff31a) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Fix the `ButtonGroup` menu being invisible when open: the group's `overflow: hidden` clipped the absolutely positioned dropdown. The end segments now round their own outer corners instead, so hover fills and focus rings still stay inside the pill.

- Updated dependencies [[`44f650b`](https://github.com/lovelycentury/okkly/commit/44f650b551077474f0ccecf94885ca0556aff31a)]:
  - @okkly/design-system@0.4.1

## 0.3.0

### Minor Changes

- [#264](https://github.com/lovelycentury/okkly/pull/264) [`141c5cd`](https://github.com/lovelycentury/okkly/commit/141c5cd851329d961bce84fa6747b3890cf7484c) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyBox` (`[okklyBox]`), a layout directive with MUI-style system props — spacing, flex layout, sizing, token colors and border, each responsive per viewport breakpoint or, through `@`-keys, per container breakpoint — mirroring `@okkly/react`'s `Box` on whatever element it decorates.

### Patch Changes

- Updated dependencies [[`9704758`](https://github.com/lovelycentury/okkly/commit/97047588018e70159e385d443a9066c1e02ac5ae), [`cbed6f0`](https://github.com/lovelycentury/okkly/commit/cbed6f0b765ee06086798509a3e597227a51a076), [`1d72f7d`](https://github.com/lovelycentury/okkly/commit/1d72f7d3da20c163a399d2f2c17d4bf68619456b), [`fbff64d`](https://github.com/lovelycentury/okkly/commit/fbff64d93ea4a2554892852e03156885a38e1376)]:
  - @okkly/design-system@0.4.0
  - @okkly/shared@0.1.0

## 0.2.0

### Minor Changes

- [#232](https://github.com/lovelycentury/okkly/pull/232) [`a19a09f`](https://github.com/lovelycentury/okkly/commit/a19a09f9bd574423aaf4b9686d868add4f895a8f) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `OkklyTextField` (`okkly-text-field`), a single-line text input with label, helper, and error — the foundation for most form fields. Built on a new internal `Field` shell shared with future field-based controls (Select, Autocomplete). `color` supports every design-system accent token (`primary`, `secondary`, `dante`, `violet`, `ember`, `ice`, `contrast`).

## 0.1.2

### Patch Changes

- Updated dependencies [[`13dcdcf`](https://github.com/lovelycentury/okkly/commit/13dcdcfc2950bcb3538d7a57f63a8ea9ddb4a04c), [`5afd452`](https://github.com/lovelycentury/okkly/commit/5afd45246ae3f7a0da5d81f97366bae97f135af1)]:
  - @okkly/design-system@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`6e1c97a`](https://github.com/lovelycentury/okkly/commit/6e1c97aa57f2ab66c4d063032f9d941b67b44f51)]:
  - @okkly/design-system@0.2.0

## 0.1.0

### Minor Changes

- [#14](https://github.com/lovelycentury/okkly/pull/14) [`b2ccbd4`](https://github.com/lovelycentury/okkly/commit/b2ccbd4d0bbb89f0e554724a5925c572407553cb) Thanks [@lovelycentury](https://github.com/lovelycentury)! - Add `@okkly/angular`, the Angular build of the design system, with `OkklyButton` (attribute component on native `<button>`/`<a>`, with variant/color/shape/size/loading/ripple parity with `@okkly/react`) and the `OkklyRipple` host directive.
