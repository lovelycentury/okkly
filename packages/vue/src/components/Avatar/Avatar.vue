<script setup lang="ts">
import { computed, ref } from "vue";
import "@okkly/design-system/components/Avatar/Avatar.scss";
import type { AvatarProps } from "./Avatar.types";

const props = withDefaults(defineProps<AvatarProps>(), {
  src: undefined,
  alt: undefined,
  initials: undefined,
  status: undefined,
  shape: "circle",
  size: "md",
  color: "mint",
});

const imageFailed = ref(false);
const showImage = computed(() => !!props.src && !imageFailed.value);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-avatar",
    props.shape === "rounded" && "okkly-avatar--rounded",
    props.size !== "md" && `okkly-avatar--${props.size}`,
    !showImage.value && props.color !== "mint" && `okkly-avatar--color-${props.color}`,
  ]
    .filter(Boolean)
    .join(" "),
);

const statusClasses = computed(() =>
  ["okkly-avatar__status", props.status === "offline" && "okkly-avatar__status--offline"]
    .filter(Boolean)
    .join(" "),
);

function handleImageError() {
  imageFailed.value = true;
}
</script>

<template>
  <div :class="classes" :role="alt ? 'img' : undefined" :aria-label="alt">
    <img v-if="showImage" class="okkly-avatar__image" :src="src" alt="" @error="handleImageError" />
    <span v-else class="okkly-avatar__initials" aria-hidden="true">{{
      (initials ?? "").slice(0, 2)
    }}</span>
    <span v-if="status" :class="statusClasses" aria-hidden="true" />
  </div>
</template>
