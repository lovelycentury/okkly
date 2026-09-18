<script lang="ts">
import * as okklyIcons from "@okkly/icons";
import type { IconName, IconSource } from "./Icon.types";

const ICONS = okklyIcons as Record<IconName, IconSource>;

/** Sorted list of every available icon name — handy for pickers and stories. */
export const ICON_NAMES = Object.keys(ICONS).toSorted() as IconName[];
</script>

<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Icon/Icon.scss";
import type { IconProps } from "./Icon.types";

const props = withDefaults(defineProps<IconProps>(), {
  name: undefined,
  icon: undefined,
  color: "inherit",
  fontSize: "medium",
  titleAccess: undefined,
});

// The markup is first-party: it comes from @okkly/icons at build time, or
// from an `icon` prop the caller imported the same way. It is never user input.
const markup = computed(() => props.icon ?? (props.name ? ICONS[props.name] : undefined) ?? "");

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-icon",
    props.fontSize !== "medium" && `okkly-icon--${props.fontSize}`,
    props.color !== "inherit" && `okkly-icon--color-${props.color}`,
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <span
    :class="classes"
    :role="titleAccess ? 'img' : undefined"
    :aria-label="titleAccess"
    :aria-hidden="titleAccess ? undefined : true"
    v-html="markup"
  />
</template>
