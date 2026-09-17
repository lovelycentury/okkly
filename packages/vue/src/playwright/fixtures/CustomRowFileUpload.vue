<!--
  Test fixture for FileUpload: renders each selected file through a custom
  `file` slot row. Lives under `src/playwright/` and is excluded from the
  published build, same as its React counterpart in
  `packages/react/src/playwright/fixtures/FileUploadFixtures.tsx`.
-->
<script setup lang="ts">
import FileUpload from "../../components/FileUpload/FileUpload.vue";
import type { FileUploadListType } from "../../components/FileUpload/FileUpload.types";

withDefaults(defineProps<{ listType?: FileUploadListType }>(), {
  listType: undefined,
});
</script>

<template>
  <FileUpload multiple :list-type="listType">
    <template #file="{ file }">
      <span>custom {{ file.name }}</span>
    </template>
  </FileUpload>
</template>
