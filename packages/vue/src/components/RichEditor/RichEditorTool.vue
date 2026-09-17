<!--
  Internal sub-part of RichEditor — not exported from the package. One
  toolbar button: an icon, optional trailing text, and active/disabled
  styling. Extracted because the toolbar repeats this shape ~10 times.
-->
<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    active?: boolean;
    disabled?: boolean;
    icon?: string;
    text?: string;
  }>(),
  {
    active: false,
    disabled: false,
    icon: undefined,
    text: undefined,
  },
);

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    :class="['okkly-rich-editor__tool', active && 'okkly-rich-editor__tool--active']"
    :title="label"
    :aria-label="label"
    :aria-pressed="active"
    :disabled="disabled"
    @click="emit('click')"
  >
    <span v-if="icon" aria-hidden="true" :title="label" v-html="icon" />
    <span v-if="text">{{ text }}</span>
  </button>
</template>
