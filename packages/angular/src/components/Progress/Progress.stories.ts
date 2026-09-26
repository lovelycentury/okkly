import { Component, DestroyRef, inject, signal } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../Button/Button";
import { OkklyProgress } from "./Progress";
import type { ProgressColor, ProgressSize, ProgressType, ProgressVariant } from "./Progress";

/** Every input the Playground binds. */
type ProgressArgs = {
  value: number;
  variant: ProgressVariant;
  type: ProgressType;
  color: ProgressColor;
  size: ProgressSize;
  showLabel: boolean;
};

const COLORS: ProgressColor[] = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
];

const surface =
  "display: grid; gap: 16px; width: 420px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const caption = "font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)";

/** Drives the `FileUpload` story: a percentage that ticks up until it fills. */
@Component({
  selector: "okkly-progress-file-upload-demo",
  imports: [OkklyProgress, OkklyButton],
  template: `
    <div style="${surface}">
      <div style="display: flex; justify-content: space-between; ${caption}">
        <span>night-drive-master.wav</span>
        <span>{{ value() }}%</span>
      </div>
      <okkly-progress
        [value]="value()"
        [color]="value() === 100 ? 'success' : 'primary'"
        aria-label="Uploading night-drive-master.wav"
      />
      <div style="display: flex; gap: 8px">
        <button okklyButton size="small" variant="soft" (click)="restart()">Restart</button>
        <button okklyButton size="small" variant="ghost" (click)="running.set(!running())">
          {{ running() ? "Pause" : "Resume" }}
        </button>
      </div>
    </div>
  `,
})
class FileUploadDemo {
  protected readonly value = signal(0);
  protected readonly running = signal(true);

  constructor() {
    const timer = setInterval(() => {
      if (!this.running()) return;
      if (this.value() >= 100) {
        this.running.set(false);
        return;
      }
      this.value.update((current) => Math.min(100, current + 4));
    }, 180);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected restart(): void {
    this.value.set(0);
    this.running.set(true);
  }
}

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
const meta: Meta<ProgressArgs> = {
  title: "Feedback/Progress",
  component: OkklyProgress,
  decorators: [moduleMetadata({ imports: [OkklyProgress, FileUploadDemo] })],
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
    color: { control: "select", options: COLORS },
    showLabel: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-progress
          [value]="value" [variant]="variant" [type]="type" [color]="color" [size]="size" [showLabel]="showLabel"
          aria-label="Upload progress"
        />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<ProgressArgs>;

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
  render: () => ({ template: `<okkly-progress-file-upload-demo />` }),
};

/**
 * When the total is unknown, the bar loops instead of filling. It reports no
 * value to assistive tech — that is deliberate, since there is nothing truthful
 * to report.
 */
export const Indeterminate: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <span style="${caption}">Searching the index…</span>
        <okkly-progress variant="indeterminate" aria-label="Searching" />
        <span style="${caption}">Circular, for a tighter spot</span>
        <okkly-progress variant="indeterminate" type="circular" aria-label="Searching" />
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
    props: {
      items: [
        { value: 28, color: "primary", label: "Storage" },
        { value: 74, color: "warning", label: "Build minutes" },
        { value: 96, color: "danger", label: "Bandwidth" },
      ],
    },
    template: `
      <div style="${surface}; grid-auto-flow: column; justify-content: start; gap: 36px; width: auto">
        @for (item of items; track item.label) {
          <div style="display: grid; justify-items: center; gap: 10px">
            <okkly-progress
              type="circular" [value]="item.value" [color]="item.color" showLabel
              [attr.aria-label]="item.label + ' used'"
            />
            <span style="${caption}">{{ item.label }}</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * `size` changes the bar height and the ring diameter together, so a linear and a
 * circular progress at the same size read as the same weight.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="${surface}">
        @for (size of sizes; track size) {
          <div style="display: grid; gap: 8px">
            <span style="${caption}">{{ size }}</span>
            <okkly-progress value="62" [size]="size" [attr.aria-label]="'Example, ' + size" />
          </div>
        }
        <div style="display: flex; align-items: center; gap: 24px">
          @for (size of sizes; track size) {
            <okkly-progress
              type="circular" value="62" [size]="size" showLabel
              [attr.aria-label]="'Example, ' + size"
            />
          }
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
    props: { colors: COLORS },
    template: `
      <div style="${surface}">
        @for (color of colors; track color) {
          <div style="display: grid; gap: 6px">
            <span style="${caption}">{{ color }}</span>
            <okkly-progress value="70" [color]="color" [attr.aria-label]="color" />
          </div>
        }
      </div>`,
  }),
};
