<script lang="ts">
/** MUI-style page range with boundaries + sibling window + ellipses. */
function getPaginationItems(
  page: number,
  count: number,
  siblingCount = 1,
  boundaryCount = 1,
): Array<number | "ellipsis"> {
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, index) => start + index);
  };

  const totalNumbers = siblingCount * 2 + boundaryCount * 2 + 3;

  if (count <= totalNumbers) {
    return range(1, count);
  }

  const leftSiblingIndex = Math.max(page - siblingCount, boundaryCount + 2);
  const rightSiblingIndex = Math.min(page + siblingCount, count - boundaryCount - 1);

  const items: Array<number | "ellipsis"> = [];

  items.push(...range(1, boundaryCount));

  if (leftSiblingIndex > boundaryCount + 2) {
    items.push("ellipsis");
  } else {
    items.push(...range(boundaryCount + 1, leftSiblingIndex - 1));
  }

  items.push(...range(leftSiblingIndex, rightSiblingIndex));

  if (rightSiblingIndex < count - boundaryCount - 1) {
    items.push("ellipsis");
  } else {
    items.push(...range(rightSiblingIndex + 1, count - boundaryCount));
  }

  items.push(...range(count - boundaryCount + 1, count));

  return items;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { iconChevronLeft, iconChevronRight } from "@okkly/icons";
import "@okkly/design-system/components/Pagination/Pagination.scss";
import PaginationButton from "./PaginationButton.vue";
import type { PaginationProps } from "./Pagination.types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PaginationProps>(), {
  siblingCount: 1,
  boundaryCount: 1,
  showFirstButton: false,
  showLastButton: false,
  size: "medium",
  color: "primary",
  disabled: false,
  shape: "rounded",
});

const model = defineModel<number>({ default: 1 });

const safeCount = computed(() => Math.max(1, props.count));
const safePage = computed(() => Math.min(Math.max(1, model.value), safeCount.value));

const items = computed(() =>
  getPaginationItems(safePage.value, safeCount.value, props.siblingCount, props.boundaryCount),
);

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-pagination",
    props.color !== "primary" && `okkly-pagination--color-${props.color}`,
    props.size !== "medium" && `okkly-pagination--size-${props.size}`,
    props.shape === "circular" && "okkly-pagination--shape-circular",
    props.disabled && "okkly-pagination--disabled",
  ]
    .filter(Boolean)
    .join(" "),
);

function goToPage(nextPage: number) {
  if (props.disabled || nextPage === safePage.value) return;
  model.value = nextPage;
}

const prevDisabled = computed(() => props.disabled || safePage.value <= 1);
const nextDisabled = computed(() => props.disabled || safePage.value >= safeCount.value);
</script>

<template>
  <nav aria-label="pagination" :class="classes" v-bind="$attrs">
    <ul class="okkly-pagination__list">
      <li v-if="showFirstButton" class="okkly-pagination__item">
        <PaginationButton label="Go to first page" :disabled="prevDisabled" @trigger="goToPage(1)">
          <span class="okkly-pagination__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m11 6-6 6 6 6" />
              <path d="M18 6v12" />
            </svg>
          </span>
        </PaginationButton>
      </li>
      <li class="okkly-pagination__item">
        <PaginationButton
          label="Go to previous page"
          :disabled="prevDisabled"
          @trigger="goToPage(safePage - 1)"
        >
          <span class="okkly-pagination__icon" aria-hidden="true" v-html="iconChevronLeft" />
        </PaginationButton>
      </li>
      <li v-for="(item, index) in items" :key="`${item}-${index}`" class="okkly-pagination__item">
        <span v-if="item === 'ellipsis'" class="okkly-pagination__ellipsis" aria-hidden="true"
          >…</span
        >
        <PaginationButton
          v-else
          :label="`Go to page ${item}`"
          :active="item === safePage"
          :disabled="disabled"
          @trigger="goToPage(item)"
        >
          {{ item }}
        </PaginationButton>
      </li>
      <li class="okkly-pagination__item">
        <PaginationButton
          label="Go to next page"
          :disabled="nextDisabled"
          @trigger="goToPage(safePage + 1)"
        >
          <span class="okkly-pagination__icon" aria-hidden="true" v-html="iconChevronRight" />
        </PaginationButton>
      </li>
      <li v-if="showLastButton" class="okkly-pagination__item">
        <PaginationButton
          label="Go to last page"
          :disabled="nextDisabled"
          @trigger="goToPage(safeCount)"
        >
          <span class="okkly-pagination__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m6 6 6 6-6 6" />
              <path d="M18 6v12" />
            </svg>
          </span>
        </PaginationButton>
      </li>
    </ul>
  </nav>
</template>
