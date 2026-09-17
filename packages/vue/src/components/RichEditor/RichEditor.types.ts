import type { JSONContent } from "@tiptap/vue-3";

export type { JSONContent } from "@tiptap/vue-3";
export type RichEditorColor = "primary" | "dante";
export type RichEditorFormat = "html" | "json";
export type RichEditorToolbar = "full" | "compact" | "none";
export type RichEditorValue = string | JSONContent;

export type SaveStatus = "saved" | "dirty";

export type SlashItem = {
  id: string;
  label: string;
  kbd: string;
  icon: string;
  keywords: string[];
  run: () => void;
};

/**
 * TipTap-based rich text editor. No MUI equivalent — closest is a custom
 * composition of MUI TextField + a third-party editor; this design's toolbar,
 * slash menu, word counter, and autosave status have no direct API to mirror.
 * Mirrors `@okkly/react`'s `<RichEditor>` name-for-name, built on
 * `@tiptap/vue-3` instead of `@tiptap/react` — the same framework-agnostic
 * `@tiptap/core`/`@tiptap/pm`/`@tiptap/starter-kit`/extension packages
 * underneath.
 *
 * Deliberate gaps vs catalog: no `markdown` format, no `bubble` toolbar,
 * no `blocks`/`marks` allow-lists (all StarterKit + Underline + Link marks
 * are always available).
 *
 * Vue-forced differences: the controlled `value` + `onChange` pair becomes
 * an unnamed `defineModel<RichEditorValue>()`, so consumers can `v-model`
 * it — `defaultValue` still seeds it once on mount when nothing is bound.
 * `label`/`helperText` (both `ReactNode` in React) become the `label`/
 * `helper-text` slots. `className`/`id` are dropped from this list — Vue's
 * own fallthrough (`class`) and `useId()` (`id`) handle them.
 */
export interface RichEditorProps {
  /**
   * Uncontrolled initial document.
   *
   * @default undefined
   */
  defaultValue?: RichEditorValue;
  /**
   * Serialization of `value`/`v-model`.
   *
   * @default "html"
   */
  format?: RichEditorFormat;
  /**
   * Which formatting bar is shown. Hidden when `readonly`.
   *
   * @default "full"
   */
  toolbar?: RichEditorToolbar;
  /**
   * Empty-document hint.
   *
   * @default "Write something…"
   */
  placeholder?: string;
  /**
   * Soft character limit — shows error styling when exceeded.
   *
   * @default undefined
   */
  maxLength?: number;
  /**
   * Idle ms before status flips to "Saved". While dirty shows "Not saved". Pass `false` to hide the save status.
   *
   * @default 5000
   */
  autosave?: number | false;
  /**
   * "/" opens the block picker in an empty paragraph.
   *
   * @default true
   */
  slashMenu?: boolean;
  /**
   * Renders the document only — no toolbar, no editing.
   *
   * @default false
   */
  readonly?: boolean;
  /**
   * Non-interactive; dims to 40%.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Marks invalid + red border.
   *
   * @default false
   */
  error?: boolean;
  /**
   * Stretch to container width (default true).
   *
   * @default true
   */
  fullWidth?: boolean;
  /**
   * Tints the focus ring/glow. `dante` is a rare accent moment.
   *
   * @default "primary"
   */
  color?: RichEditorColor;
  /**
   * Id of the rendered editor surface; also what the label's `for` and the
   * helper text's `aria-describedby` derive from. Auto-generated with
   * `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
}
