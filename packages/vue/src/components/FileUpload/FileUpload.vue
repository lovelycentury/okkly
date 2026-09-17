<script lang="ts">
import { iconArchive, iconCode, iconFile, iconFilm, iconImage, iconMusic } from "@okkly/icons";
import type { FileUploadLabels } from "./FileUpload.types";

export const defaultFileUploadLabels: FileUploadLabels = {
  trigger: "Select file",
  clickToUpload: "Click to upload",
  orDragAndDrop: "or drag and drop",
  maxSizeHint: (size) => `Max. file size: ${size}`,
  maxTotalSizeHint: (size, totalSize) => `Max. file size: ${size} (${totalSize} in total)`,
  totalSizeHint: (totalSize) => `Max. file size: ${totalSize} in total`,
  maxCountHint: (count) => `Max. ${count} files`,
  allowedTypesHint: (types) => `Allowed file types: ${types}`,
  requiredError: "Please select a file.",
  fileTypeError: (extension) => `.${extension} files are not allowed`,
  maxSizeError: (size) => `Exceeds the max. file size of ${size}`,
  maxTotalSizeError: (size) => `Exceeds the max. total size of ${size}`,
  maxCountError: (count) => `Exceeds the limit of ${count} files`,
  removeFile: (filename) => `Remove ${filename}`,
  showFiles: "Show files",
  hideFiles: "Hide files",
};

const ICONS_BY_TYPE: [test: RegExp, icon: string][] = [
  [/^image\//, iconImage],
  [/^video\//, iconFilm],
  [/^audio\//, iconMusic],
  [/(zip|tar|gzip|rar|7z)/, iconArchive],
  [/(json|javascript|typescript|xml|html|css)/, iconCode],
];

function getFileIcon(file: File): string {
  const type = file.type.toLowerCase();
  return ICONS_BY_TYPE.find(([test]) => test.test(type))?.[1] ?? iconFile;
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from "vue";
import { iconAlertTriangle, iconInfo, iconTrash, iconUpload } from "@okkly/icons";
import {
  formatFileSize,
  useFileUpload,
  type BinaryPrefixedSize,
  type FileUploadIssue,
} from "@okkly/vue-composables";
import "@okkly/design-system/components/FileUpload/FileUpload.scss";
import IconButton from "../IconButton/IconButton.vue";
import type {
  FileUploadFileSlotScope,
  FileUploadProps,
  FileUploadStatus,
  FileUploadValue,
} from "./FileUpload.types";

const props = withDefaults(defineProps<FileUploadProps>(), {
  defaultValue: null,
  multiple: false,
  accept: undefined,
  maxSize: undefined,
  maxTotalSize: undefined,
  maxCount: undefined,
  replace: false,
  size: "large",
  listType: "list",
  required: false,
  error: undefined,
  showError: undefined,
  name: undefined,
  disabled: false,
  labels: undefined,
  locale: undefined,
  getFileStatus: undefined,
  fullWidth: false,
  id: undefined,
});

const slots = defineSlots<{
  /** Label rendered above the drop zone. */
  label?: () => unknown;
  /** Renders a file row instead of the built-in one. */
  file?: (scope: FileUploadFileSlotScope) => unknown;
}>();

const emit = defineEmits<{
  /** Fires whenever the validity of the underlying input changes. */
  "validity-change": [validity: ValidityState];
}>();

const generatedId = useId();
const fieldId = computed(() => props.id ?? generatedId);

const touched = ref(false);
const filesHidden = ref(false);

const text = computed<FileUploadLabels>(() => ({ ...defaultFileUploadLabels, ...props.labels }));
function format(size: number | BinaryPrefixedSize): string {
  return formatFileSize(size, props.locale);
}

function toFiles(value: FileUploadValue | undefined): File[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

// Unlike React's manual `valueProp !== undefined ? valueProp : uncontrolledValue`
// split, `model.value` already resolves controlled vs. uncontrolled —
// `undefined` means genuinely unbound, so it's the only case that falls back
// to `defaultValue`. `defineModel`'s own `default` option can't express that
// fallback here since `defaultValue` is a separate prop, not a static value —
// same reasoning `Slider`'s `defaultValue` handling documents.
const model = defineModel<FileUploadValue>();

const upload = useFileUpload(() => ({
  value: toFiles(model.value),
  defaultValue: toFiles(props.defaultValue) ?? [],
  onChange: (files) => {
    touched.value = true;
    model.value = props.multiple ? files : (files[0] ?? null);
  },
  accept: props.accept,
  multiple: props.multiple,
  replace: props.replace,
  maxSize: props.maxSize,
  maxTotalSize: props.multiple ? props.maxTotalSize : undefined,
  maxCount: props.multiple ? props.maxCount : undefined,
  disabled: props.disabled,
}));

function issueMessage(issue: FileUploadIssue): string {
  switch (issue.type) {
    case "fileType":
      return text.value.fileTypeError(issue.extension);
    case "maxSize":
      return text.value.maxSizeError(format(issue.maxSize));
    case "maxTotalSize":
      return text.value.maxTotalSizeError(format(issue.maxTotalSize));
    case "maxCount":
      return text.value.maxCountError(issue.maxCount);
  }
}

const requiredMessage = computed(() =>
  props.required && upload.files.value.length === 0 ? text.value.requiredError : undefined,
);
const firstIssue = computed(() => upload.issues.value.find(Boolean));
const validationMessage = computed(
  () => requiredMessage.value ?? (firstIssue.value ? issueMessage(firstIssue.value) : undefined),
);

const errorVisible = computed(() => props.showError ?? touched.value);
// per-file issues are reported on their own row, so the drop zone only carries the
// required error — it would otherwise repeat every row's message
const errorMessage = computed(() => (errorVisible.value ? requiredMessage.value : undefined));
const hasError = computed(
  () => props.error ?? (errorVisible.value && Boolean(validationMessage.value)),
);

// Keeps the input's FileList in sync so `name` submits with the form and so the
// validation message is anchored to a real form control.
function syncInputFiles(files: File[]) {
  const input = upload.inputRef.value;
  if (!input || typeof DataTransfer === "undefined") return;
  try {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  } catch {
    // environments without full DataTransfer support (e.g. jsdom) keep the input empty
  }
}

function syncValidity(message: string | undefined) {
  const input = upload.inputRef.value;
  if (!input) return;
  input.setCustomValidity(message ?? "");
  emit("validity-change", input.validity);
}

// The very first sync has to run in `onMounted`, not an immediate `watch`:
// a `flush: "post"` watcher created during `setup()` is queued for the post-render
// phase *before* the template ref callback that populates `upload.inputRef` runs,
// so its immediate call would still see a `null` input. `onMounted` is guaranteed to
// run after refs attach; ordinary `watch` (no `immediate`) handles every change after
// that, mirroring React's `useEffect`.
onMounted(() => {
  syncInputFiles(upload.files.value);
  syncValidity(validationMessage.value);
});

watch(upload.files, syncInputFiles);
watch(validationMessage, syncValidity);

function handleDropzoneClick(event: MouseEvent) {
  touched.value = true;
  upload.rootEvents.click(event);
}

const dropzoneEvents = { ...upload.rootEvents, click: handleDropzoneClick };

const hasConstraints = computed(() =>
  Boolean(
    props.maxSize ||
    (props.multiple && (props.maxTotalSize || props.maxCount)) ||
    props.accept?.length,
  ),
);
const showDetails = computed(
  () => props.size === "large" || (props.size !== "small" && hasConstraints.value),
);
const showList = computed(
  () =>
    props.listType !== "hidden" &&
    upload.files.value.length > 0 &&
    !(props.listType === "button" && filesHidden.value),
);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-file-upload",
    props.size !== "large" && `okkly-file-upload--${props.size}`,
    upload.isDragging.value && "okkly-file-upload--dragging",
    hasError.value && "okkly-file-upload--error",
    props.fullWidth && "okkly-file-upload--full-width",
  ]
    .filter(Boolean)
    .join(" "),
);

const listClasses = computed(() =>
  [
    "okkly-file-upload__list",
    props.listType === "maxHeight" && "okkly-file-upload__list--max-height",
  ]
    .filter(Boolean)
    .join(" "),
);

interface FileRow {
  file: File;
  index: number;
  key: string;
  status?: FileUploadStatus;
  classes: string;
}

function fileStatus(file: File, index: number): FileUploadStatus | undefined {
  const issue = upload.issues.value[index];
  return (
    props.getFileStatus?.(file, index) ??
    (issue ? { text: issueMessage(issue), color: "danger" } : undefined)
  );
}

const fileRows = computed<FileRow[]>(() =>
  upload.files.value.map((file, index) => {
    const status = fileStatus(file, index);
    return {
      file,
      index,
      key: `${file.name}-${file.lastModified}-${index}`,
      status,
      classes: [
        "okkly-file-upload__file",
        status?.color === "danger" && "okkly-file-upload__file--error",
      ]
        .filter(Boolean)
        .join(" "),
    };
  }),
);

function removeFile(index: number) {
  touched.value = true;
  upload.remove(index);
}

defineExpose({ inputRef: upload.inputRef });
</script>

<template>
  <div :class="classes">
    <span v-if="slots.label" :id="`${fieldId}-label`" class="okkly-file-upload__label">
      <slot name="label" />
    </span>

    <button
      v-bind="upload.rootAttrs.value"
      v-on="dropzoneEvents"
      type="button"
      :id="fieldId"
      class="okkly-file-upload__dropzone"
      :disabled="disabled"
      :aria-labelledby="slots.label ? `${fieldId}-label` : undefined"
      :aria-describedby="errorMessage && size !== 'small' ? `${fieldId}-error` : undefined"
      :aria-required="required || undefined"
      :aria-invalid="hasError || undefined"
      :title="size === 'small' && errorMessage ? errorMessage : undefined"
    >
      <span
        v-if="size === 'large'"
        class="okkly-file-upload__illustration"
        aria-hidden="true"
        v-html="iconUpload"
      />
      <span v-else class="okkly-file-upload__trigger">
        <span aria-hidden="true" v-html="iconUpload" />
        {{ text.trigger }}
      </span>

      <span v-if="showDetails" class="okkly-file-upload__content">
        <span v-if="size === 'large'" class="okkly-file-upload__title">
          <u>{{ text.clickToUpload }}</u> {{ text.orDragAndDrop }}
        </span>

        <span v-if="maxSize != null" class="okkly-file-upload__hint">
          {{
            multiple && maxTotalSize != null
              ? text.maxTotalSizeHint(format(maxSize), format(maxTotalSize))
              : text.maxSizeHint(format(maxSize))
          }}
        </span>
        <span v-else-if="multiple && maxTotalSize != null" class="okkly-file-upload__hint">
          {{ text.totalSizeHint(format(maxTotalSize)) }}
        </span>
        <span v-if="multiple && maxCount != null" class="okkly-file-upload__hint">
          {{ text.maxCountHint(maxCount) }}
        </span>
        <span v-if="accept?.length" class="okkly-file-upload__hint">
          {{ text.allowedTypesHint(accept.join(", ")) }}
        </span>

        <span v-if="errorMessage" class="okkly-file-upload__error" :id="`${fieldId}-error`">
          {{ errorMessage }}
          <span aria-hidden="true" v-html="iconInfo" />
        </span>
      </span>
    </button>

    <input
      v-bind="upload.inputAttrs.value"
      v-on="upload.inputEvents"
      :ref="(node) => (upload.inputRef.value = node as HTMLInputElement | null)"
      class="okkly-file-upload__input"
      :name="name"
      tabindex="-1"
      aria-hidden="true"
    />

    <button
      v-if="listType === 'button' && upload.files.value.length > 0"
      type="button"
      class="okkly-file-upload__list-toggle"
      @click="filesHidden = !filesHidden"
    >
      {{ filesHidden ? text.showFiles : text.hideFiles }}
    </button>

    <ul v-if="showList" :class="listClasses">
      <template v-for="row in fileRows" :key="row.key">
        <li v-if="slots.file">
          <slot
            name="file"
            :file="row.file"
            :index="row.index"
            :status="row.status"
            :disabled="disabled"
            :remove="() => removeFile(row.index)"
          />
        </li>
        <li v-else :class="row.classes">
          <span class="okkly-file-upload__file-icon">
            <span
              aria-hidden="true"
              v-html="row.status?.color === 'danger' ? iconAlertTriangle : getFileIcon(row.file)"
            />
          </span>

          <span class="okkly-file-upload__file-body">
            <span class="okkly-file-upload__file-name">{{ row.file.name }}</span>
            <span class="okkly-file-upload__file-details">
              <span>{{ format(row.file.size) }}</span>
              <span
                v-if="row.status?.text != null"
                :class="`okkly-file-upload__file-status okkly-file-upload__file-status--${row.status.color ?? 'neutral'}`"
              >
                {{ row.status.text }}
              </span>
            </span>
          </span>

          <span class="okkly-file-upload__file-actions">
            <IconButton
              variant="ghost"
              size="small"
              :aria-label="text.removeFile(row.file.name)"
              :disabled="disabled"
              @click="removeFile(row.index)"
            >
              <span aria-hidden="true" v-html="iconTrash" />
            </IconButton>
          </span>

          <span v-if="row.status?.progress != null" class="okkly-file-upload__progress">
            <span
              :class="`okkly-file-upload__progress-bar okkly-file-upload__progress-bar--${row.status.color ?? 'primary'}`"
              :style="{ width: `${Math.min(Math.max(row.status.progress, 0), 100)}%` }"
            />
          </span>
        </li>
      </template>
    </ul>
  </div>
</template>
