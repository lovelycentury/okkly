<!--
  Test fixture for FileUpload: reports an external upload status, with a
  progress bar, for every file via `getFileStatus`. Lives under
  `src/playwright/` and is excluded from the published build, same as its
  React counterpart in
  `packages/react/src/playwright/fixtures/FileUploadFixtures.tsx`.
-->
<script setup lang="ts">
import FileUpload from "../../components/FileUpload/FileUpload.vue";

const props = withDefaults(defineProps<{ text?: string; progress?: number }>(), {
  text: "Uploading…",
  progress: 40,
});

function getFileStatus() {
  return { text: props.text, color: "primary" as const, progress: props.progress };
}
</script>

<template>
  <FileUpload multiple :get-file-status="getFileStatus" />
</template>
