<!-- Internal, not exported: the link-or-current-page rendering shared by the
     flat and collapsed layouts in Breadcrumbs.vue. -->
<script setup lang="ts">
import type { BreadcrumbItem } from "./Breadcrumbs.types";

defineProps<{
  item: BreadcrumbItem;
  isLast: boolean;
}>();
</script>

<template>
  <a v-if="!isLast && item.href" class="okkly-breadcrumbs__link" :href="item.href">
    <span v-if="item.icon" class="okkly-breadcrumbs__icon" aria-hidden="true" v-html="item.icon" />
    {{ item.label }}
  </a>
  <span v-else class="okkly-breadcrumbs__current" :aria-current="isLast ? 'page' : undefined">
    <span v-if="item.icon" class="okkly-breadcrumbs__icon" aria-hidden="true" v-html="item.icon" />
    {{ item.label }}
  </span>
</template>
