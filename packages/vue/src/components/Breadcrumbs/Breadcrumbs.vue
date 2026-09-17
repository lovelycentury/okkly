<script setup lang="ts">
import { computed, ref } from "vue";
import { iconChevronRight } from "@okkly/icons";
import "@okkly/design-system/components/Breadcrumbs/Breadcrumbs.scss";
import BreadcrumbCrumb from "./BreadcrumbCrumb.vue";
import type { BreadcrumbsProps } from "./Breadcrumbs.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<BreadcrumbsProps>(), {
  maxItems: 8,
  itemsBeforeCollapse: 1,
  itemsAfterCollapse: 1,
  expandAriaLabel: "Show all crumbs",
});

defineSlots<{
  /** Rendered between crumbs. Leave empty for the default chevron. */
  separator?: () => unknown;
}>();

const expanded = ref(false);

const canCollapse = computed(
  () =>
    !expanded.value &&
    props.items.length > props.maxItems &&
    props.itemsBeforeCollapse + props.itemsAfterCollapse < props.items.length,
);

const beforeItems = computed(() => props.items.slice(0, props.itemsBeforeCollapse));
const afterItems = computed(() => props.items.slice(props.items.length - props.itemsAfterCollapse));
</script>

<template>
  <nav aria-label="breadcrumb" class="okkly-component okkly-breadcrumbs" v-bind="$attrs">
    <ol class="okkly-breadcrumbs__list">
      <template v-if="canCollapse">
        <template v-for="(item, index) in beforeItems" :key="`before-${index}`">
          <li class="okkly-breadcrumbs__item">
            <BreadcrumbCrumb :item="item" :is-last="false" />
          </li>
          <li class="okkly-breadcrumbs__separator" aria-hidden="true">
            <slot name="separator"><span v-html="iconChevronRight" /></slot>
          </li>
        </template>
        <li>
          <button
            type="button"
            class="okkly-breadcrumbs__ellipsis"
            :aria-label="expandAriaLabel"
            @click="expanded = true"
          >
            …
          </button>
        </li>
        <li class="okkly-breadcrumbs__separator" aria-hidden="true">
          <slot name="separator"><span v-html="iconChevronRight" /></slot>
        </li>
        <template v-for="(item, index) in afterItems" :key="`after-${index}`">
          <li class="okkly-breadcrumbs__item">
            <BreadcrumbCrumb :item="item" :is-last="index === afterItems.length - 1" />
          </li>
          <li
            v-if="index !== afterItems.length - 1"
            class="okkly-breadcrumbs__separator"
            aria-hidden="true"
          >
            <slot name="separator"><span v-html="iconChevronRight" /></slot>
          </li>
        </template>
      </template>
      <template v-else>
        <template v-for="(item, index) in items" :key="index">
          <li class="okkly-breadcrumbs__item">
            <BreadcrumbCrumb :item="item" :is-last="index === items.length - 1" />
          </li>
          <li
            v-if="index !== items.length - 1"
            class="okkly-breadcrumbs__separator"
            aria-hidden="true"
          >
            <slot name="separator"><span v-html="iconChevronRight" /></slot>
          </li>
        </template>
      </template>
    </ol>
  </nav>
</template>
