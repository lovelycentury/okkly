<!--
  Test fixture for FileUpload: binds `:model-value`/`@update:model-value`
  together on the same tag in a real template, the way a genuine consumer
  would. Playwright's root `mount()` wires props/listeners onto the component
  under test differently from a real Vue template — `defineModel`'s
  controlled-detection (both the prop key and its `onUpdate:x` listener have
  to be present on the very same vnode) doesn't reliably see that pairing
  when FileUpload is mounted directly, so a "controlled but never fed back"
  case (a fixed prop plus a listener that only records what it's told, same
  as `@okkly/react`'s own test for this) needs FileUpload mounted one level
  down from Playwright's own root instead — same class of harness limitation
  as CalendarFixture/TimePickerFixture.
-->
<script setup lang="ts">
import FileUpload from "../../components/FileUpload/FileUpload.vue";
import type {
  FileUploadProps,
  FileUploadValue,
} from "../../components/FileUpload/FileUpload.types";

const props = withDefaults(defineProps<FileUploadProps & { modelValue?: FileUploadValue }>(), {
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
  modelValue: null,
});

const emit = defineEmits<{
  change: [value: FileUploadValue];
}>();
</script>

<template>
  <FileUpload
    :model-value="modelValue"
    :default-value="defaultValue"
    :multiple="multiple"
    :accept="accept"
    :max-size="maxSize"
    :max-total-size="maxTotalSize"
    :max-count="maxCount"
    :replace="replace"
    :size="size"
    :list-type="listType"
    :required="required"
    :error="error"
    :show-error="showError"
    :name="name"
    :disabled="disabled"
    :labels="labels"
    :locale="locale"
    :get-file-status="getFileStatus"
    :full-width="fullWidth"
    :id="id"
    @update:model-value="emit('change', $event!)"
  />
</template>
