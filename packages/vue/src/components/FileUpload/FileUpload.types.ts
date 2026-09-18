import type { BinaryPrefixedSize, FileType } from "@okkly/vue-composables";

export type { BinaryPrefixedSize, FileType } from "@okkly/vue-composables";
export type FileUploadSize = "large" | "medium" | "small";
export type FileUploadListType = "list" | "maxHeight" | "button" | "hidden";
export type FileUploadStatusColor =
  "primary" | "neutral" | "danger" | "warning" | "success" | "info";

/** Status line shown under a file name, optionally with a progress bar. */
export interface FileUploadStatus {
  /**
   * Status text shown next to the file size.
   *
   * @default undefined
   */
  text?: string;
  /**
   * Status color. Also tints the progress bar.
   *
   * @default "neutral"
   */
  color?: FileUploadStatusColor;
  /**
   * Upload progress in percent (0–100). Renders a progress bar at the bottom of the row.
   *
   * @default undefined
   */
  progress?: number;
}

/** Every user-facing string of the component, so it can be translated without an i18n layer. */
export interface FileUploadLabels {
  trigger: string;
  clickToUpload: string;
  orDragAndDrop: string;
  maxSizeHint: (size: string) => string;
  maxTotalSizeHint: (size: string, totalSize: string) => string;
  totalSizeHint: (totalSize: string) => string;
  maxCountHint: (count: number) => string;
  allowedTypesHint: (types: string) => string;
  requiredError: string;
  fileTypeError: (extension: string) => string;
  maxSizeError: (size: string) => string;
  maxTotalSizeError: (size: string) => string;
  maxCountError: (count: number) => string;
  removeFile: (filename: string) => string;
  showFiles: string;
  hideFiles: string;
}

/**
 * `File | null` when uncontrolled/single, `File[]` when `multiple` — same
 * shape as React's `FileUploadValue<TMultiple>`, but `v-model` is always
 * typed `File | File[] | null` regardless of `multiple`: React discriminates
 * `onChange`'s signature on a generic type param, which `defineProps` can't
 * express, so check `multiple` yourself if the branch matters.
 */
export type FileUploadValue = File | File[] | null;

/** What the `file` slot receives for each selected file. */
export interface FileUploadFileSlotScope {
  file: File;
  index: number;
  status?: FileUploadStatus;
  disabled: boolean;
  remove: () => void;
}

/**
 * Props follow sit-onyx's OnyxFileUpload API
 * (https://onyx.schwarz/development/components/file-upload.html) as closely as this
 * design allows, mirroring `@okkly/react`'s `<FileUpload>` name-for-name:
 * `multiple`/`accept`/`maxSize`/`maxTotalSize`/`maxCount`/`replace`/`size`/`listType`/
 * `required`/`name`/`disabled` match name-for-name, and onyx's `v-model` becomes this
 * component's own `v-model` too (React re-derives MUI-style `value`/`defaultValue`/
 * `onChange` from onyx's `v-model` instead). Deliberate gaps carried over from React:
 * no `density`/`skeleton` (neither exists in this library yet), and no `OnyxFileCard` —
 * the file row is rendered inline and customized via the `file` slot.
 *
 * Vue-forced differences: the controlled `value` + `onChange` pair becomes an unnamed
 * `defineModel<FileUploadValue>()`, so consumers can `v-model` it — `defaultValue` still
 * seeds it once on mount when nothing is bound. `label` becomes the `label` slot.
 * React's `renderFile` render prop becomes the `file` scoped slot, receiving
 * `FileUploadFileSlotScope`. `FileUploadStatus.text` narrows from `ReactNode` to
 * `string`, since it comes back from the plain `getFileStatus` callback prop rather
 * than something a slot can reach into. `onValidityChange` becomes the
 * `validity-change` emit. `inputRef` is dropped — use `defineExpose`'s own `inputRef`
 * (a template ref on the component instance) instead. `className` is dropped — a
 * consumer's `class` merges onto the root automatically. There is no `Tooltip` in
 * `@okkly/vue` yet, so the `size="small"` error surfaces via the native `title`
 * attribute instead of a floating tooltip.
 */
export interface FileUploadProps {
  /**
   * Initial file(s) for uncontrolled usage — an array when `multiple`, a single file otherwise.
   *
   * @default undefined
   */
  defaultValue?: FileUploadValue;
  /**
   * Whether multiple files can be selected. Also switches `v-model` to an array.
   *
   * @default false
   */
  multiple?: boolean;
  /**
   * File types to allow, e.g. `[".pdf", "image/*"]`. Empty allows every type.
   *
   * @default undefined
   */
  accept?: FileType[];
  /**
   * Max. allowed size per file — bytes or a binary prefixed size (e.g. `"42MiB"`).
   * Shown to the user in decimal notation (44.1 MB).
   *
   * @default undefined
   */
  maxSize?: number | BinaryPrefixedSize;
  /**
   * Max. allowed size of all files combined when `multiple` is enabled.
   *
   * @default undefined
   */
  maxTotalSize?: number | BinaryPrefixedSize;
  /**
   * Max. number of files that can be selected when `multiple` is enabled.
   *
   * @default undefined
   */
  maxCount?: number;
  /**
   * Whether a new selection replaces the current one instead of being appended.
   *
   * @default false
   */
  replace?: boolean;
  /**
   * Visual size of the drop zone. `large` is the illustrated drop zone, `medium` a
   * compact one, `small` a button-like trigger whose error is shown via `title`.
   *
   * @default "large"
   */
  size?: FileUploadSize;
  /**
   * How the selected files are listed. `maxHeight` scrolls after
   * `--okkly-file-upload-max-files` rows, `button` adds a show/hide toggle and
   * `hidden` renders no list at all (for a custom one).
   *
   * @default "list"
   */
  listType?: FileUploadListType;
  /**
   * Whether at least one file is required.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Forces the error state. When omitted, the error state follows the built-in
   * validation (required + per-file constraints).
   *
   * @default undefined
   */
  error?: boolean;
  /**
   * Whether validation messages are shown. When omitted they appear once the user has
   * interacted with the component.
   *
   * @default undefined
   */
  showError?: boolean;
  /**
   * Name of the underlying file input, for native form submission.
   *
   * @default undefined
   */
  name?: string;
  /**
   * Whether the upload is disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Overrides for the user-facing strings.
   *
   * @default defaultFileUploadLabels
   */
  labels?: Partial<FileUploadLabels>;
  /**
   * Locale used to format file sizes.
   *
   * @default undefined
   */
  locale?: string;
  /**
   * Status shown for a file — e.g. real upload progress. Overrides the built-in
   * validation status when it returns a value.
   *
   * @default undefined
   */
  getFileStatus?: (file: File, index: number) => FileUploadStatus | undefined;
  /**
   * If `true`, the component takes the full width of its container.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Id of the rendered drop zone; also what the label's `aria-labelledby` derives from.
   * Auto-generated with `useId()` when omitted.
   *
   * @default undefined
   */
  id?: string;
}
