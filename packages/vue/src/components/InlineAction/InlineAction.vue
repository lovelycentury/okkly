<script setup lang="ts">
import { computed, useAttrs, useId, useTemplateRef } from "vue";
import "@okkly/design-system/components/InlineAction/InlineAction.scss";
import type { InlineActionProps, InlineActionState } from "./InlineAction.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InlineActionProps>(), {
  placeholder: undefined,
  action: "Copy",
  size: "medium",
  color: undefined,
  fill: "filled",
  message: undefined,
  state: "default",
  readonly: false,
  loading: false,
  disabled: false,
  id: undefined,
});

const slots = defineSlots<{
  /** Button trailing icon (overridden automatically for loading/success/error/readonly). */
  "action-icon"?: () => unknown;
}>();

const emit = defineEmits<{
  /** Inline button click. */
  action: [];
}>();

const model = defineModel<string>();

const attrs = useAttrs();
const inputAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const messageId = computed(() => (props.message ? `${inputId.value}-message` : undefined));

const effectiveState = computed<InlineActionState>(() =>
  props.disabled
    ? "disabled"
    : props.loading
      ? "loading"
      : props.readonly
        ? "readonly"
        : props.state,
);
const isReadOnly = computed(() => effectiveState.value === "readonly");
const isLocked = computed(() => props.disabled || isReadOnly.value);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-inline-action",
    props.color && `okkly-inline-action--color-${props.color}`,
    props.fill !== "filled" && `okkly-inline-action--fill-${props.fill}`,
    props.size !== "medium" && `okkly-inline-action--${props.size}`,
    (effectiveState.value === "hover" ||
      effectiveState.value === "focus" ||
      effectiveState.value === "success" ||
      effectiveState.value === "error" ||
      effectiveState.value === "readonly") &&
      `okkly-inline-action--state-${effectiveState.value}`,
  ]
    .filter(Boolean)
    .join(" "),
);

const messageClasses = computed(() =>
  [
    "okkly-inline-action__message",
    effectiveState.value === "success" && "okkly-inline-action__message--success",
    effectiveState.value === "error" && "okkly-inline-action__message--error",
  ]
    .filter(Boolean)
    .join(" "),
);

const inputRef = useTemplateRef<HTMLInputElement>("input");
defineExpose({ inputRef });

function handleAction() {
  if (isReadOnly.value) return;
  emit("action");
}
</script>

<template>
  <div :class="[classes, attrs.class]">
    <div class="okkly-inline-action__control">
      <input
        ref="input"
        :id="inputId"
        v-bind="inputAttrs"
        v-model="model"
        class="okkly-inline-action__input"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="isReadOnly"
        :aria-describedby="messageId"
      />
      <button
        type="button"
        class="okkly-inline-action__action"
        :disabled="isLocked"
        :aria-label="isReadOnly ? `${action} (locked)` : undefined"
        @click="handleAction"
      >
        <span>{{ action }}</span>
        <span
          v-if="effectiveState === 'loading'"
          class="okkly-inline-action__spinner"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="42 100"
            />
          </svg>
        </span>
        <span v-else class="okkly-inline-action__icon" aria-hidden="true">
          <svg
            v-if="isReadOnly"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <svg
            v-else-if="effectiveState === 'success'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <svg
            v-else-if="effectiveState === 'error'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          <slot v-else-if="slots['action-icon']" name="action-icon" />
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
    <span v-if="message" :id="messageId" :class="messageClasses">
      <span
        v-if="
          effectiveState === 'loading' || effectiveState === 'success' || effectiveState === 'error'
        "
        class="okkly-inline-action__message-icon"
        aria-hidden="true"
      >
        <svg
          v-if="effectiveState === 'loading'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <svg
          v-else-if="effectiveState === 'success'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </span>
      {{ message }}
    </span>
  </div>
</template>
