<script lang="ts">
import type { SeverityIconSeverity } from "./SeverityIcon.types";

const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>`;
const INFO_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 10v6" /><path d="M12 7h.01" /></svg>`;
const WARNING_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>`;
const DANGER_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>`;

const DEFAULT_ICONS: Record<SeverityIconSeverity, string> = {
  success: CHECK_ICON,
  info: INFO_ICON,
  warning: WARNING_ICON,
  danger: DANGER_ICON,
  primary: INFO_ICON,
  neutral: INFO_ICON,
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/SeverityIcon/SeverityIcon.scss";
import type { SeverityIconProps } from "./SeverityIcon.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SeverityIconProps>(), {
  severity: "info",
  size: "medium",
  shape: "circle",
});

defineSlots<{
  /** Override the built-in severity glyph. */
  default?: () => unknown;
}>();

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-severity-icon",
    props.severity !== "info" && `okkly-severity-icon--${props.severity}`,
    props.size !== "medium" && `okkly-severity-icon--${props.size}`,
    props.shape === "rounded" && "okkly-severity-icon--rounded",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <span
    :class="classes"
    role="img"
    :aria-label="label"
    :aria-hidden="label ? undefined : true"
    v-bind="$attrs"
  >
    <span class="okkly-severity-icon__icon">
      <slot><span v-html="DEFAULT_ICONS[severity]" /></slot>
    </span>
  </span>
</template>
