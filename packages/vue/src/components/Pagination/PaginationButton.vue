<!-- Internal, not exported: the nav/page button shared by every slot in
     Pagination.vue. -->
<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    disabled?: boolean;
    active?: boolean;
  }>(),
  { disabled: false, active: false },
);

const emit = defineEmits<{ trigger: [event: MouseEvent] }>();
</script>

<template>
  <button
    type="button"
    :class="
      ['okkly-pagination__button', active && 'okkly-pagination__button--active']
        .filter(Boolean)
        .join(' ')
    "
    :aria-label="label"
    :aria-current="active ? 'page' : undefined"
    :disabled="disabled"
    @click="emit('trigger', $event)"
  >
    <slot />
  </button>
</template>
