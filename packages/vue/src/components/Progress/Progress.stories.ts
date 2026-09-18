import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onUnmounted, ref } from "vue";
import Button from "../Button/Button.vue";
import Progress from "./Progress.vue";
import type { ProgressColor, ProgressProps } from "./Progress.types";

/**
 * Reports how far along a task is. Use `determinate` whenever you can compute a
 * percentage — a bar that fills is far more reassuring than one that loops — and
 * fall back to `indeterminate` only while the total is unknown.
 *
 * `type="linear"` fills its container, so it belongs at the top of the region it
 * describes; `type="circular"` keeps a fixed diameter and sits inline next to a
 * label. The element carries `role="progressbar"`, but no name of its own — pass
 * `aria-label` (or point `aria-labelledby` at your heading) so it announces what
 * it is measuring.
 */
const meta: Meta<ProgressProps> = {
  title: "Feedback/Progress",
  component: Progress,
  args: {
    value: 64,
    variant: "determinate",
    type: "linear",
    color: "primary",
    size: "medium",
    showLabel: false,
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    variant: { control: "inline-radio", options: ["determinate", "indeterminate"] },
    type: { control: "inline-radio", options: ["linear", "circular"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
  },
  render: (args) => ({
    components: { Progress },
    setup: () => ({ args, surface }),
    template: `<div :style="surface"><Progress v-bind="args" aria-label="Upload progress" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<ProgressProps>;

const surface = {
  display: "grid",
  gap: "16px",
  width: "420px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const captionStyle = "font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)";

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A file upload with a real percentage: the bar, the label, and the announced
 * value all come from the same number.
 */
export const FileUpload: Story = {
  name: "File upload",
  render: () => ({
    components: { Progress, Button },
    setup() {
      const value = ref(0);
      const running = ref(true);
      let timer: ReturnType<typeof setInterval> | undefined;

      function tick() {
        clearInterval(timer);
        timer = setInterval(() => {
          if (value.value >= 100) {
            running.value = false;
            clearInterval(timer);
            return;
          }
          value.value += 4;
        }, 180);
      }

      function restart() {
        value.value = 0;
        running.value = true;
        tick();
      }

      function toggle() {
        running.value = !running.value;
        if (running.value) tick();
        else clearInterval(timer);
      }

      tick();
      onUnmounted(() => clearInterval(timer));

      return { surface, captionStyle, value, running, restart, toggle };
    },
    template: `
      <div :style="surface">
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span :style="captionStyle">night-drive-master.wav</span>
          <span :style="captionStyle">{{ value }}%</span>
        </div>
        <Progress :value="value" :color="value === 100 ? 'success' : 'primary'" aria-label="Uploading night-drive-master.wav" />
        <div style="display: flex; gap: 8px">
          <Button size="small" variant="soft" @click="restart">Restart</Button>
          <Button size="small" variant="ghost" @click="toggle">{{ running ? "Pause" : "Resume" }}</Button>
        </div>
      </div>`,
  }),
};

/**
 * When the total is unknown, the bar loops instead of filling. It reports no
 * value to assistive tech — that is deliberate, since there is nothing truthful
 * to report.
 */
export const Indeterminate: Story = {
  render: () => ({
    components: { Progress },
    setup: () => ({ surface, captionStyle }),
    template: `
      <div :style="surface">
        <span :style="captionStyle">Searching the index…</span>
        <Progress variant="indeterminate" aria-label="Searching" />
        <span :style="captionStyle">Circular, for a tighter spot</span>
        <Progress variant="indeterminate" type="circular" aria-label="Searching" />
      </div>`,
  }),
};

/**
 * The circular ring with `showLabel` — a compact way to show quota or storage in
 * a dashboard tile. The label is suppressed while indeterminate, since there is
 * no percentage to print.
 */
export const CircularWithLabel: Story = {
  name: "Circular with label",
  render: () => ({
    components: { Progress },
    setup: () => ({
      surface,
      captionStyle,
      items: [
        { value: 28, color: "primary" as ProgressColor, label: "Storage" },
        { value: 74, color: "warning" as ProgressColor, label: "Build minutes" },
        { value: 96, color: "danger" as ProgressColor, label: "Bandwidth" },
      ],
    }),
    template: `
      <div :style="{ ...surface, gridAutoFlow: 'column', justifyContent: 'start', gap: '36px', width: 'auto' }">
        <div v-for="item in items" :key="item.label" style="display: grid; justify-items: center; gap: 10px">
          <Progress type="circular" :value="item.value" :color="item.color" show-label :aria-label="\`\${item.label} used\`" />
          <span :style="captionStyle">{{ item.label }}</span>
        </div>
      </div>`,
  }),
};

/**
 * `size` changes the bar height and the ring diameter together, so a linear and a
 * circular progress at the same size read as the same weight.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Progress },
    setup: () => ({ surface, captionStyle, sizes: ["small", "medium", "large"] }),
    template: `
      <div :style="surface">
        <div v-for="size in sizes" :key="size" style="display: grid; gap: 8px">
          <span :style="captionStyle">{{ size }}</span>
          <Progress :value="62" :size="size" :aria-label="\`Example, \${size}\`" />
        </div>
        <div style="display: flex; align-items: center; gap: 24px">
          <Progress v-for="size in sizes" :key="size" type="circular" :value="62" :size="size" show-label :aria-label="\`Example, \${size}\`" />
        </div>
      </div>`,
  }),
};

/**
 * Every tone. The feedback tones are the useful ones here — swap to `warning`
 * and `danger` as a quota fills, as in the dashboard story above.
 */
export const Colors: Story = {
  render: () => ({
    components: { Progress },
    setup: () => ({
      surface,
      captionStyle,
      colors: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ] as ProgressColor[],
    }),
    template: `
      <div :style="surface">
        <div v-for="color in colors" :key="color" style="display: grid; gap: 6px">
          <span :style="captionStyle">{{ color }}</span>
          <Progress :value="70" :color="color" :aria-label="color" />
        </div>
      </div>`,
  }),
};
