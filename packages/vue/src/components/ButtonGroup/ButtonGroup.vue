<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import "@okkly/design-system/components/ButtonGroup/ButtonGroup.scss";
import { useClickOutside } from "@okkly/vue-composables";
import type { ButtonGroupProps } from "./ButtonGroup.types";

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  variant: "primary",
  menu: () => [],
  color: "primary",
  disabled: false,
  menuAriaLabel: "Open menu",
});

const open = ref(false);
const root = useTemplateRef<HTMLDivElement>("root");
const chevron = useTemplateRef<HTMLButtonElement>("chevron");

useClickOutside(
  root,
  () => {
    open.value = false;
  },
  () => open.value,
);

function handleChevronKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    open.value = false;
  }
}

function closeAndFocusChevron() {
  open.value = false;
  chevron.value?.focus();
}

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-button-group",
    props.variant === "secondary" && "okkly-button-group--secondary",
    props.color !== "primary" && `okkly-button-group--color-${props.color}`,
    props.disabled && "okkly-button-group--disabled",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div ref="root" :class="classes">
    <button
      type="button"
      class="okkly-button-group__segment"
      :disabled="disabled || action.disabled"
      @click="action.onClick?.()"
    >
      <span
        v-if="action.icon"
        class="okkly-button-group__icon"
        aria-hidden="true"
        v-html="action.icon"
      />
      {{ action.label }}
    </button>
    <button
      v-if="menu.length > 0"
      ref="chevron"
      type="button"
      class="okkly-button-group__segment okkly-button-group__chevron"
      :disabled="disabled"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-label="menuAriaLabel"
      @click="open = !open"
      @keydown="handleChevronKeyDown"
    >
      <span class="okkly-button-group__chevron-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </button>
    <div v-if="open" class="okkly-button-group__menu" role="menu">
      <button
        v-for="(item, index) in menu"
        :key="index"
        type="button"
        role="menuitem"
        class="okkly-button-group__menu-item"
        :disabled="item.disabled"
        @click="
          item.onClick?.();
          closeAndFocusChevron();
        "
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
