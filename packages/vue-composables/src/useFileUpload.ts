import { computed, ref, type ComputedRef, type Ref } from "vue";
import { useControllableState } from "./useControllableState";
import {
  getFileExtension,
  matchesFileType,
  parseFileSize,
  type BinaryPrefixedSize,
  type FileType,
  type FileUploadIssue,
} from "./useFileUpload.utils";

export type { BinaryPrefixedSize, FileType, FileUploadIssue } from "./useFileUpload.utils";
export { formatFileSize, matchesFileType, parseFileSize } from "./useFileUpload.utils";

export interface UseFileUploadOptions {
  /** Currently selected files (controlled). */
  value?: File[];
  /** Initially selected files (uncontrolled). */
  defaultValue?: File[];
  /** Called whenever the selection changes. */
  onChange?: (files: File[]) => void;
  /** File types to allow. Empty/undefined allows everything. */
  accept?: FileType[];
  /** Whether more than one file can be selected. */
  multiple?: boolean;
  /** Whether a new selection replaces the current one instead of appending to it. */
  replace?: boolean;
  /** Max. allowed size per file, in bytes or as a binary prefixed size (e.g. `"42MiB"`). */
  maxSize?: number | BinaryPrefixedSize;
  /** Max. allowed size of all files combined, in bytes or as a binary prefixed size. */
  maxTotalSize?: number | BinaryPrefixedSize;
  /** Max. number of files that can be selected when `multiple` is enabled. */
  maxCount?: number;
  /** Whether selecting files is disabled. */
  disabled?: boolean;
}

export interface UseFileUploadReturn {
  /** Currently selected files. */
  files: ComputedRef<File[]>;
  /** Issue per selected file, aligned by index. `undefined` means the file is fine. */
  issues: ComputedRef<(FileUploadIssue | undefined)[]>;
  /** Whether at least one selected file has an issue. */
  hasIssues: ComputedRef<boolean>;
  /** Whether files are currently being dragged over the drop zone. */
  isDragging: Ref<boolean>;
  /** Bind with `ref="…"` on the `<input type="file">` the consumer renders. */
  inputRef: Ref<HTMLInputElement | null>;
  /** Opens the native file picker. */
  open: () => void;
  /** Adds files, honoring `multiple`/`replace`. */
  add: (files: File[]) => void;
  /** Removes a file, either by reference or by index. */
  remove: (file: File | number) => void;
  /** Clears the selection. */
  clear: () => void;
  /** `v-bind`-able attrs for the drop zone element. */
  rootAttrs: ComputedRef<Record<string, unknown>>;
  /** `v-on`-able listeners, keyed by bare native event name, for the drop zone element. */
  rootEvents: Record<string, (event: Event) => void>;
  /** `v-bind`-able attrs for the `<input type="file">`. */
  inputAttrs: ComputedRef<Record<string, unknown>>;
  /** `v-on`-able listeners, keyed by bare native event name, for the `<input type="file">`. */
  inputEvents: Record<string, (event: Event) => void>;
}

const EMPTY_FILES: File[] = [];

/**
 * Headless file upload — drag & drop, selection management and per-file validation.
 * The Vue port of `@okkly/react-hooks`'s `useFileUpload`, and what `FileUpload` from
 * `@okkly/vue` is built on.
 *
 * `options` is a getter, called fresh whenever the composable needs it, since a
 * `setup()` body — unlike a React hook's — runs only once rather than every render.
 *
 * Unlike React's `getRootProps()`/`getInputProps()` (JSX-spread ergonomics templates
 * don't need), this returns attrs — `v-bind`-able — separately from event listeners —
 * `v-on`-able, keyed by bare native event name — mirroring `useAutocomplete`'s split.
 *
 * Validation never drops a file: every selected file is kept and, when it violates a
 * constraint, reported through `issues` so the UI can mark it and let the user remove it.
 */
export function useFileUpload(
  options: () => UseFileUploadOptions = () => ({}),
): UseFileUploadReturn {
  const inputRef = ref<HTMLInputElement | null>(null);
  let dragDepth = 0;
  const isDragging = ref(false);

  const { value: files, setValue: setFiles } = useControllableState<File[]>(() => ({
    value: options().value,
    defaultValue: options().defaultValue ?? EMPTY_FILES,
    onChange: options().onChange,
  }));

  const issues = computed<(FileUploadIssue | undefined)[]>(() => {
    const opts = options();
    const maxSizeBytes = opts.maxSize == null ? undefined : parseFileSize(opts.maxSize);
    const maxTotalSizeBytes =
      opts.maxTotalSize == null ? undefined : parseFileSize(opts.maxTotalSize);
    let runningTotal = 0;

    return files.value.map((file, index) => {
      runningTotal += file.size;

      if (!matchesFileType(file, opts.accept)) {
        return { type: "fileType", file, extension: getFileExtension(file.name) };
      }
      if (maxSizeBytes != null && file.size > maxSizeBytes) {
        return { type: "maxSize", file, maxSize: maxSizeBytes };
      }
      if (maxTotalSizeBytes != null && runningTotal > maxTotalSizeBytes) {
        return { type: "maxTotalSize", file, maxTotalSize: maxTotalSizeBytes };
      }
      if (opts.multiple && opts.maxCount != null && index >= opts.maxCount) {
        return { type: "maxCount", file, maxCount: opts.maxCount };
      }
      return undefined;
    });
  });

  const hasIssues = computed(() => issues.value.some(Boolean));

  function add(incoming: File[]) {
    const opts = options();
    if (opts.disabled || incoming.length === 0) return;

    if (!opts.multiple) setFiles(incoming.slice(0, 1));
    else if (opts.replace) setFiles([...incoming]);
    else setFiles([...files.value, ...incoming]);
  }

  function remove(file: File | number) {
    const next =
      typeof file === "number"
        ? files.value.filter((_, index) => index !== file)
        : files.value.filter((current) => current !== file);
    setFiles(next);
  }

  function clear() {
    setFiles([]);
  }

  function open() {
    if (options().disabled) return;
    inputRef.value?.click();
  }

  const rootAttrs = computed(() => ({
    "data-drag-active": isDragging.value || undefined,
  }));

  const rootEvents: Record<string, (event: Event) => void> = {
    click: () => {
      if (options().disabled) return;
      open();
    },
    dragenter: (event) => {
      if (options().disabled) return;
      event.preventDefault();
      dragDepth += 1;
      isDragging.value = true;
    },
    dragleave: (event) => {
      if (options().disabled) return;
      event.preventDefault();
      dragDepth -= 1;
      if (dragDepth <= 0) {
        dragDepth = 0;
        isDragging.value = false;
      }
    },
    dragover: (event) => {
      if (options().disabled) return;
      event.preventDefault();
    },
    drop: (event) => {
      if (options().disabled) return;
      event.preventDefault();
      dragDepth = 0;
      isDragging.value = false;
      add(Array.from((event as DragEvent).dataTransfer?.files ?? []));
    },
  };

  const inputAttrs = computed(() => {
    const opts = options();
    return {
      type: "file" as const,
      accept: opts.accept?.length ? opts.accept.join(",") : undefined,
      multiple: opts.multiple ?? false,
      disabled: opts.disabled ?? false,
    };
  });

  const inputEvents: Record<string, (event: Event) => void> = {
    change: (event) => {
      if (options().disabled) return;
      add(Array.from((event.target as HTMLInputElement).files ?? []));
    },
  };

  return {
    files,
    issues,
    hasIssues,
    isDragging,
    inputRef,
    open,
    add,
    remove,
    clear,
    rootAttrs,
    rootEvents,
    inputAttrs,
    inputEvents,
  };
}
