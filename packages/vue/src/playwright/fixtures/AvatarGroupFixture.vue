<!--
  Test fixture for AvatarGroup: composes it with real Avatar children (rather
  than raw markup in a `.ct.ts` slot string, which cannot reference other
  components) so tests can drive `initials` as a plain serializable prop.
-->
<script setup lang="ts">
import Avatar from "../../components/Avatar/Avatar.vue";
import AvatarGroup from "../../components/AvatarGroup/AvatarGroup.vue";
import type { AvatarColor } from "../../components/Avatar/Avatar.types";
import type {
  AvatarGroupSize,
  AvatarGroupSpacing,
} from "../../components/AvatarGroup/AvatarGroup.types";

withDefaults(
  defineProps<{
    initials: string[];
    max?: number;
    total?: number;
    size?: AvatarGroupSize;
    spacing?: AvatarGroupSpacing;
    ring?: boolean;
    hues?: AvatarColor[];
  }>(),
  {
    max: undefined,
    total: undefined,
    size: "sm",
    spacing: "default",
    ring: true,
    hues: () => ["mint"],
  },
);
</script>

<template>
  <AvatarGroup :max="max" :total="total" :size="size" :spacing="spacing" :ring="ring" :hues="hues">
    <Avatar v-for="value in initials" :key="value" :initials="value" />
  </AvatarGroup>
</template>
