# Solution for Issue #138

## 🛠️ Proposed Solution (by Aditya Waghamare)

### Analysis
Porting the `Only` component helper from `@okkly/react` to `@okkly/vue` following the `@okkly/vue` architecture standards: dual `<script>` block setup (type export + `<script setup>`), `useBreakpoint` reactive composable backing, `v-if` conditional rendering, proper Storybook and Vitest spec setup, and changesets entry.

### Fix
Implemented `Only.vue`, `useBreakpoint.ts`, `Only.stories.ts`, `Only.spec.ts`, updated `src/index.ts`, `README.md`, and added the changeset.

### Implementation
```vue
<!-- packages/vue/src/components/Only/Only.vue -->
<script lang="ts">
export type OnlyBreakpoint = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface OnlyProps {
  from?: OnlyBreakpoint;
  to?: OnlyBreakpoint;
}
</script>

<script setup lang="ts">
import { useBreakpoint } from '../../composables/useBreakpoint';

const props = withDefaults(defineProps<OnlyProps>(), {
  from: undefined,
  to: undefined,
});

const isVisible = useBreakpoint({
  from: props.from,
  to: props.to,
});
</script>

<template>
  <template v-if="isVisible">
    <slot />
  </template>
</template>
```

```ts
// packages/vue/src/composables/useBreakpoint.ts
import { ref, onMounted, onUnmounted } from 'vue';
import type { OnlyBreakpoint } from '../components/Only/Only.vue';

const BREAKPOINTS: Record<string, number> = {
  '2xs': 0,
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

function resolveBreakpoint(bp?: OnlyBreakpoint): number | undefined {
  if (bp === undefined) return undefined;
  if (typeof bp === 'number') return bp;
  return BREAKPOINTS[bp] ?? 0;
}

export interface UseBreakpointOptions {
  from?: OnlyBreakpoint;
  to?: OnlyBreakpoint;
}

export function useBreakpoint(options: UseBreakpointOptions) {
  const isVisible = ref(true);

  const check = () => {
    const width = window.innerWidth;
    const fromPx = resolveBreakpoint(options.from);
    const toPx = resolveBreakpoint(options.to);

    let matches = true;
    if (fromPx !== undefined && width < fromPx) {
      matches = false;
    }
    if (toPx !== undefined && width >= toPx) {
      matches = false;
    }
    isVisible.value = matches;
  };

  onMounted(() => {
    check();
    window.addEventListener('resize', check);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', check);
  });

  return isVisible;
}
```

```ts
// packages/vue/src/components/Only/Only.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { Only } from './Only';

const meta: Meta<typeof Only> = {
  title: 'Helpers/Only',
  component: Only,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Only>;

export const Default: Story = {
  render: () => ({
    components: { Only },
    template: `
      <div>
        <Only from="md">
          <p>Visible on md and above</p>
        </Only>
        <Only to="md">
          <p>Visible below md</p>
        </Only>
      </div>
    `,
  }),
};
```

```ts
// packages/vue/src/components/Only/Only.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { Only } from './Only';

describe('Only', () => {
  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1024);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should render children when within range', () => {
    const wrapper = mount(Only, {
      props: { from: 'sm', to: 'xl' },
      slots: { default: '<span>Content</span>' },
    });
    expect(wrapper.text()).toContain('Content');
  });

  it('should not render children when outside range', () => {
    vi.stubGlobal('innerWidth', 400);
    const wrapper = mount(Only, {
      props: { from: 'md' },
      slots: { default: '<span>Content</span>' },
    });
    expect(wrapper.text()).not.toContain('Content');
  });
});
```

```ts
// packages/vue/src/index.ts
export { default as Only, type OnlyProps, type OnlyBreakpoint } from './components/Only/Only.vue';
export { useBreakpoint } from './composables/useBreakpoint';
```

```markdown
<!-- packages/vue/README.md additions -->
## Only

Mounts its children only while the viewport falls within `[from, to)` — `from` inclusive, `to` exclusive, both optional.

```vue
<template>
  <Only from="md" to="xl">
    <p>Only visible on tablet/desktop ranges</p>
  </Only>
</template>
```
```

```yaml
---
"@okkly/vue": minor
---

Add `Only` component and `useBreakpoint` composable.
```

### Testing
Run tests with `pnpm --filter @okkly/vue test` and verify stories in Storybook.

Signed-off-by: Aditya Waghamare <adityawaghamare7620@gmail.com>


---
*Submitted by Aditya Waghamare*
💰 **Payout Address (Base L2 / EVM):** `0xb61dBcdBc3407F71EaCb64D4CBFAcf9FFfe2415C`