<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Tabs/Tabs.scss";
import TabsList from "./TabsList.vue";
import type { TabsProps } from "./Tabs.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TabsProps>(), {
  defaultValue: undefined,
  color: "primary",
  variant: "standard",
  orientation: "horizontal",
});

const emit = defineEmits<{ change: [event: Event, value: string] }>();

const model = defineModel<string>();
// `defaultValue` is read here rather than written into the model on mount —
// see Slider.vue. Falls back further to the first tab when neither is set.
const resolvedValue = computed<string>(() =>
  model.value !== undefined ? model.value : (props.defaultValue ?? props.items[0]?.value ?? ""),
);

// Plain object, not a ref: it only backs imperative `.focus()` calls after
// keyboard navigation, never drives a render on its own.
const tabRefs: Record<string, HTMLButtonElement | null> = {};
function setTabRef(value: string, el: Element | null) {
  tabRefs[value] = el as HTMLButtonElement | null;
}

function selectTab(value: string, event: Event) {
  model.value = value;
  emit("change", event, value);
}

// Only the selected tab is tabbable (roving tabindex), so the arrow keys are
// the only way in or out of the rest of the tablist — WAI-ARIA tabs pattern
// with automatic activation.
function handleKeyDown(event: KeyboardEvent) {
  const nextKey = props.orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const prevKey = props.orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  if (!["Home", "End", nextKey, prevKey].includes(event.key)) return;

  const enabled = props.items.filter((item) => !item.disabled);
  if (enabled.length === 0) return;

  const currentIndex = enabled.findIndex((item) => item.value === resolvedValue.value);
  let nextIndex: number;
  if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = enabled.length - 1;
  else {
    const step = event.key === nextKey ? 1 : -1;
    const from = currentIndex === -1 ? 0 : currentIndex;
    nextIndex = (from + step + enabled.length) % enabled.length;
  }

  const nextTab = enabled[nextIndex];
  if (!nextTab || nextTab.value === resolvedValue.value) return;

  event.preventDefault();
  selectTab(nextTab.value, event);
  tabRefs[nextTab.value]?.focus();
}

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-tabs",
    props.color !== "primary" && `okkly-tabs--color-${props.color}`,
    props.variant === "scrollable" && "okkly-tabs--scrollable",
    props.orientation === "vertical" && "okkly-tabs--vertical",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div :class="classes" v-bind="$attrs">
    <div v-if="variant === 'scrollable'" class="okkly-tabs__scroller">
      <TabsList
        :items="items"
        :current-value="resolvedValue"
        :orientation="orientation"
        :set-tab-ref="setTabRef"
        @select="selectTab"
        @navigate="handleKeyDown"
      />
    </div>
    <TabsList
      v-else
      :items="items"
      :current-value="resolvedValue"
      :orientation="orientation"
      :set-tab-ref="setTabRef"
      @select="selectTab"
      @navigate="handleKeyDown"
    />
  </div>
</template>
