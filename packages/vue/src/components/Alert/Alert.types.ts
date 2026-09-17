export type AlertSeverity = "success" | "info" | "warning" | "danger" | "dante";
export type AlertVariant = "standard" | "outlined" | "filled";

/**
 * Props follow MUI's Alert API (https://mui.com/material-ui/api/alert/) as
 * closely as this design allows, mirroring `@okkly/react`'s `<Alert>`
 * name-for-name: `severity`/`variant`/`icon` match name-for-name. Deliberate
 * gaps carried over from React: no `sx`/`classes`, `variant` uses
 * `"standard"|"outlined"|"filled"` (soft surface / outline / tinted fill —
 * MUI's `"standard"` maps to our raised surface). Adds `"dante"` severity
 * for announcements.
 *
 * Vue-forced differences: `title` becomes the `#title` slot, `children`
 * (the body message) becomes the default slot, and `action` becomes the
 * `#action` slot, since Vue has no `ReactNode`. `icon` narrows from
 * `ReactNode | false` to just `false` — pass it to hide the built-in
 * severity icon — and overriding it is the `#icon` slot instead.
 * `onClose` drops the `on` prefix and becomes a native `close` listener you
 * attach with `@close`; like `Chip`'s `click`, this component reads it
 * itself (via `useAttrs()`) rather than declaring it through `defineEmits`,
 * since only that lets it decide whether to render the dismiss button from
 * whether a listener is present at all — the same thing React's
 * `onClose && <button>` gate does.
 */
export interface AlertProps {
  /**
   * Semantic tone — drives icon and accent colours.
   *
   * @default "info"
   */
  severity?: AlertSeverity;
  /**
   * Surface treatment.
   *
   * @default "standard"
   */
  variant?: AlertVariant;
  /**
   * Pass `false` to hide the icon entirely. Fill the `#icon` slot to
   * override the built-in severity glyph instead.
   *
   * @default undefined
   */
  icon?: false;
}
