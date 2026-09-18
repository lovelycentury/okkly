<script setup lang="ts">
import { computed, normalizeClass, useAttrs } from "vue";
import { iconX } from "@okkly/icons";
import "@okkly/design-system/components/Alert/Alert.scss";
import SeverityIcon from "../SeverityIcon/SeverityIcon.vue";
import type { SeverityIconSeverity } from "../SeverityIcon/SeverityIcon.types";
import type { AlertProps, AlertSeverity } from "./Alert.types";

defineOptions({ inheritAttrs: false });

// An explicit `icon: undefined` default is required here: Vue's compiler
// infers a `Boolean`-typed prop from the literal `false` type, and it
// resolves an absent `Boolean` prop with no declared default to `false`
// rather than `undefined` — which would make the `!== false` check below
// always report the icon as hidden. See `Accordion.vue`'s `defineModel` for
// the same Vue quirk.
const props = withDefaults(defineProps<AlertProps>(), {
  severity: "info",
  variant: "standard",
  icon: undefined,
});

const slots = defineSlots<{
  /** Bold headline above the message. */
  title?: () => unknown;
  /** Body message. */
  default?: () => unknown;
  /** Override the built-in severity icon. Ignored when `icon` is `false`. */
  icon?: () => unknown;
  /** Trailing action, e.g. an undo button. */
  action?: () => unknown;
}>();

const SEVERITY_ICON_MAP: Record<AlertSeverity, SeverityIconSeverity> = {
  success: "success",
  info: "primary",
  warning: "warning",
  danger: "danger",
  dante: "primary",
};

const attrs = useAttrs();
const restAttrs = computed(() => {
  const { class: _class, onClose: _onClose, ...rest } = attrs;
  return rest;
});
const closeListener = computed(() => attrs.onClose as (() => void) | undefined);

const showIcon = computed(() => props.icon !== false);
const iconSeverity = computed(() => SEVERITY_ICON_MAP[props.severity]);

const classes = computed(() =>
  normalizeClass([
    "okkly-component",
    "okkly-alert",
    props.severity !== "info" && `okkly-alert--${props.severity}`,
    props.variant === "outlined" && "okkly-alert--outlined",
    props.variant === "filled" && "okkly-alert--filled",
    attrs.class,
  ]),
);

function handleClose() {
  closeListener.value?.();
}
</script>

<template>
  <div role="alert" :class="classes" v-bind="restAttrs">
    <span v-if="showIcon" class="okkly-alert__icon">
      <slot name="icon">
        <SeverityIcon :severity="iconSeverity" size="small" shape="rounded" />
      </slot>
    </span>
    <div class="okkly-alert__content">
      <p v-if="slots.title" class="okkly-alert__title"><slot name="title" /></p>
      <p v-if="slots.default" class="okkly-alert__message"><slot /></p>
    </div>
    <span v-if="slots.action" class="okkly-alert__action"><slot name="action" /></span>
    <button
      v-if="closeListener"
      type="button"
      class="okkly-alert__close"
      aria-label="Close"
      @click="handleClose"
    >
      <span v-html="iconX" />
    </button>
  </div>
</template>
