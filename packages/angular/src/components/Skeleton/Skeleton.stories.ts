import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklySkeleton } from "./Skeleton";
import type { SkeletonAnimation, SkeletonVariant } from "./Skeleton";

/** Every input the Playground binds. */
type SkeletonArgs = {
  variant: SkeletonVariant;
  animation: SkeletonAnimation;
  width: string | undefined;
  height: string | undefined;
};

const surface =
  "display: grid; gap: 12px; width: 420px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const card =
  "width: 420px; padding: 18px; border-radius: 14px; border: 1px solid var(--okkly-border-subtle); background: var(--okkly-bg-surface); font-family: var(--okkly-font-family-sans)";
const caption = "font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)";

/**
 * A grey stand-in for content that hasn't arrived. Its job is to hold the exact
 * space the real thing will take, so nothing jumps when the data lands — build
 * the placeholder from the same layout as the loaded view rather than from a
 * generic stack of bars.
 *
 * Every skeleton is `aria-hidden`, because a screen reader has nothing to gain
 * from “loading rectangle”. Announce the wait once, on the container, with
 * `aria-busy="true"`.
 */
const meta: Meta<SkeletonArgs> = {
  title: "Feedback/Skeleton",
  component: OkklySkeleton,
  decorators: [moduleMetadata({ imports: [OkklySkeleton] })],
  args: {
    variant: "text",
    animation: "pulse",
    width: undefined,
    height: undefined,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["text", "circular", "rectangular", "rounded"] },
    animation: { control: "inline-radio", options: ["pulse", "wave", false] },
    width: { control: "text" },
    height: { control: "text" },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-skeleton [variant]="variant" [animation]="animation" [width]="width || undefined" [height]="height || undefined" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<SkeletonArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The four shapes. `text` takes the height of a line of body copy; the other
 * three carry their own defaults, which `width` and `height` override.
 */
export const Variants: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-skeleton variant="text" />
        <okkly-skeleton variant="circular" />
        <okkly-skeleton variant="rectangular" height="64" />
        <okkly-skeleton variant="rounded" height="64" />
      </div>`,
  }),
};

/**
 * A comment row, mid-load: avatar, name, two lines of body. The last line is
 * short on purpose — a paragraph placeholder made of equal bars reads as a table.
 */
export const ListItem: Story = {
  name: "List item",
  render: () => ({
    props: { rows: [0, 1, 2] },
    template: `
      <div style="${card}" aria-busy="true" aria-label="Loading comments">
        @for (row of rows; track row) {
          <div style="display: flex; gap: 14px; padding-block: 10px">
            <okkly-skeleton variant="circular" width="40" height="40" />
            <div style="flex: 1; display: grid; gap: 8px">
              <okkly-skeleton variant="text" width="35%" />
              <okkly-skeleton variant="text" />
              <okkly-skeleton variant="text" width="70%" />
            </div>
          </div>
        }
      </div>`,
  }),
};

/**
 * The same card in both states. Flip between them and nothing moves — that is
 * the test a placeholder has to pass.
 */
export const MatchingTheLoadedView: Story = {
  name: "Matching the loaded view",
  render: () => ({
    template: `
      <div style="display: flex; gap: 20px; flex-wrap: wrap">
        <div style="${card}" aria-busy="true" aria-label="Loading project">
          <okkly-skeleton variant="rounded" height="120" />
          <div style="display: grid; gap: 10px; margin-top: 14px">
            <okkly-skeleton variant="text" width="55%" />
            <okkly-skeleton variant="text" />
            <okkly-skeleton variant="text" width="80%" />
          </div>
        </div>
        <div style="${card}">
          <div style="height: 120px; border-radius: 14px; background: linear-gradient(135deg, var(--okkly-accent-primary), var(--okkly-accent-secondary))"></div>
          <div style="display: grid; gap: 6px; margin-top: 14px">
            <strong style="font-size: var(--okkly-font-size-md)">Night drive vol. 2</strong>
            <p style="margin: 0; ${caption}">
              Twelve tracks recorded between Kyiv and Berlin, mixed over one very long winter.
            </p>
          </div>
        </div>
      </div>`,
  }),
};

/**
 * `pulse` fades the block, `wave` sweeps a highlight across it, and `false`
 * leaves it still. Under `prefers-reduced-motion` the pulse slows down and the
 * wave stops entirely.
 */
export const Animations: Story = {
  render: () => ({
    props: {
      animations: [
        { label: "pulse", animation: "pulse" },
        { label: "wave", animation: "wave" },
        { label: "none", animation: false },
      ],
    },
    template: `
      <div style="${surface}">
        @for (item of animations; track item.label) {
          <div style="display: grid; gap: 8px">
            <span style="${caption}">{{ item.label }}</span>
            <okkly-skeleton variant="rounded" height="56" [animation]="item.animation" />
          </div>
        }
      </div>`,
  }),
};

/**
 * `width` and `height` take a number (pixels) or any CSS length, so a placeholder
 * can track a fluid layout as easily as a fixed one.
 */
export const Sizing: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-skeleton variant="text" width="120" />
        <okkly-skeleton variant="text" width="60%" />
        <okkly-skeleton variant="rectangular" width="100%" height="4rem" />
        <div style="display: flex; gap: 10px">
          <okkly-skeleton variant="circular" width="28" height="28" />
          <okkly-skeleton variant="circular" width="40" height="40" />
          <okkly-skeleton variant="circular" width="56" height="56" />
        </div>
      </div>`,
  }),
};
