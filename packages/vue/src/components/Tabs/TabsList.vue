<!-- Internal, not exported: the `<ul role="tablist">` shared by the plain and
     `.okkly-tabs__scroller`-wrapped layouts in Tabs.vue. -->
<script setup lang="ts">
import type { TabItem, TabsOrientation } from "./Tabs.types";

defineProps<{
  items: TabItem[];
  currentValue: string;
  orientation: TabsOrientation;
  setTabRef: (value: string, el: Element | null) => void;
}>();

const emit = defineEmits<{
  select: [value: string, event: MouseEvent];
  navigate: [event: KeyboardEvent];
}>();
</script>

<template>
  <ul class="okkly-tabs__list" role="tablist" :aria-orientation="orientation">
    <li v-for="item in items" :key="item.value" role="presentation">
      <button
        type="button"
        role="tab"
        :ref="(el) => setTabRef(item.value, el as Element | null)"
        :id="`okkly-tab-${item.value}`"
        :aria-selected="currentValue === item.value"
        :aria-controls="currentValue === item.value ? `okkly-tabpanel-${item.value}` : undefined"
        :tabindex="currentValue === item.value ? 0 : -1"
        :disabled="item.disabled"
        :class="['okkly-tabs__tab', currentValue === item.value && 'okkly-tabs__tab--active']"
        @click="emit('select', item.value, $event)"
        @keydown="emit('navigate', $event)"
      >
        <span v-if="item.icon" class="okkly-tabs__icon" aria-hidden="true" v-html="item.icon" />
        {{ item.label }}
      </button>
    </li>
  </ul>
</template>
