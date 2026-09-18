<script setup lang="ts">
import { computed, useAttrs, useId, useTemplateRef, watch } from "vue";
import "@okkly/design-system/components/TextArea/TextArea.scss";
import type { TextAreaProps } from "./TextArea.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TextAreaProps>(), {
  hideLabel: false,
  size: "medium",
  color: "primary",
  error: false,
  fullWidth: false,
  disabled: false,
  rows: 3,
  maxRows: undefined,
  autosize: false,
  maxLength: undefined,
  resize: "vertical",
  required: false,
  id: undefined,
});

const slots = defineSlots<{
  /** Field label. */
  label?: () => unknown;
  /** Text below the field (footer row, left). */
  "helper-text"?: () => unknown;
}>();

const model = defineModel<string>();

const attrs = useAttrs();
const textareaAttrs = computed(() => {
  const { class: _class, "aria-describedby": _describedBy, ...rest } = attrs;
  return rest;
});

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const helperId = computed(() => (slots["helper-text"] ? `${inputId.value}-helper` : undefined));
const counterId = computed(() =>
  props.maxLength != null ? `${inputId.value}-counter` : undefined,
);
const describedBy = computed(
  () =>
    [helperId.value, counterId.value, attrs["aria-describedby"] as string | undefined]
      .filter(Boolean)
      .join(" ") || undefined,
);
const showFooter = computed(() => !!slots["helper-text"] || props.maxLength != null);
const charCount = computed(() => model.value?.length ?? 0);

const textareaRef = useTemplateRef<HTMLTextAreaElement>("textarea");

function syncHeight() {
  const el = textareaRef.value;
  if (!el || !props.autosize) {
    return;
  }

  el.style.height = "auto";

  const styles = getComputedStyle(el);
  const lineHeight = Number.parseFloat(styles.lineHeight);
  const paddingBlock =
    Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
  const borderBlock =
    Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);

  const minHeight = props.rows * lineHeight + paddingBlock + borderBlock;
  let nextHeight = Math.max(el.scrollHeight, minHeight);

  if (props.maxRows != null) {
    const maxHeight = props.maxRows * lineHeight + paddingBlock + borderBlock;
    nextHeight = Math.min(nextHeight, maxHeight);
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  } else {
    el.style.overflowY = "hidden";
  }

  el.style.height = `${nextHeight}px`;
}

watch([model, () => props.rows, () => props.maxRows, () => props.autosize], () => syncHeight(), {
  flush: "post",
  immediate: true,
});

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-text-area",
    props.color !== "primary" && `okkly-text-area--color-${props.color}`,
    props.size !== "medium" && `okkly-text-area--${props.size}`,
    props.error && "okkly-text-area--error",
    props.fullWidth && "okkly-text-area--full-width",
    props.autosize && "okkly-text-area--autosize",
    props.resize !== "vertical" && `okkly-text-area--resize-${props.resize}`,
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div :class="[classes, attrs.class]">
    <label
      v-if="slots.label"
      :for="inputId"
      :class="['okkly-text-area__label', hideLabel && 'okkly-text-area__label--hidden']"
    >
      <slot name="label" />
      <span v-if="required" class="okkly-text-area__required" aria-hidden="true">*</span>
    </label>
    <div class="okkly-text-area__control">
      <textarea
        :id="inputId"
        ref="textarea"
        v-model="model"
        v-bind="textareaAttrs"
        class="okkly-text-area__textarea"
        :rows="rows"
        :disabled="disabled"
        :required="required"
        :maxlength="maxLength"
        :aria-invalid="error || undefined"
        :aria-describedby="describedBy"
      />
    </div>
    <div v-if="showFooter" class="okkly-text-area__footer">
      <span v-if="slots['helper-text']" :id="helperId" class="okkly-text-area__helper">
        <slot name="helper-text" />
      </span>
      <span v-if="maxLength != null" :id="counterId" class="okkly-text-area__counter">
        {{ charCount }} / {{ maxLength }}
      </span>
    </div>
  </div>
</template>
