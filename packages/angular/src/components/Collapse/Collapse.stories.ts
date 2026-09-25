import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../Button/Button";
import { OkklyCollapse, OkklyCollapseContent } from "./Collapse";
import type { CollapseOrientation } from "./Collapse";

/**
 * The Playground's controls, named apart from the component's own members:
 * `in` is an operator in templates, so it is `open`.
 */
type CollapseArgs = {
  open: boolean;
  appear: boolean;
  orientation: CollapseOrientation;
  timeout: number;
  collapsedSize: string;
};

const surface =
  "display: flex; flex-direction: column; gap: 12px; width: 460px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const panel =
  "padding: 18px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 12px; background: var(--okkly-bg-surface); color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm); line-height: var(--okkly-font-line-height-sm)";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";
const row =
  "display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 12px; background: var(--okkly-bg-surface); font-size: var(--okkly-font-size-sm)";
const long =
  'Six or seven lines of copy, which is enough for the difference to show. With timeout "auto" this panel takes longer than the short one and the two still read as the same control. With a fixed 300ms it covers several times the distance in the same time, which looks like it was dropped rather than opened. The rule of thumb: fix the timeout when you control the content, derive it when the content comes from data.';

/**
 * The only transition in the family that changes layout: it animates its content's
 * height (or width) between zero and its natural size, so everything after it moves
 * out of the way as it opens. That is the point — an accordion panel that faded in
 * would land on top of the section below it.
 *
 * It is also the only one that is a component rather than a directive, because
 * measuring the content requires a box the animation does not touch: the
 * `okkly-collapse` root animates, a wrapper and an inner measure, and your content
 * goes inside the last one.
 *
 * `timeout="auto"` derives the duration from the measured size, which is what you
 * want whenever the content comes from data — a short panel and a long one then
 * feel like the same gesture instead of the same clock.
 */
const meta: Meta<CollapseArgs> = {
  title: "Helpers/Transitions/Collapse",
  component: OkklyCollapse,
  decorators: [moduleMetadata({ imports: [OkklyCollapse, OkklyCollapseContent, OkklyButton] })],
  args: {
    open: true,
    appear: true,
    orientation: "vertical",
    timeout: 400,
    collapsedSize: "0px",
  },
  argTypes: {
    open: { control: "boolean", description: "The `in` input — MUI's `in`." },
    appear: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    timeout: { control: "number" },
    collapsedSize: { control: "text" },
  },
  parameters: {
    controls: { exclude: ["status", "in", "easing", "mountOnEnter", "unmountOnExit"] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-collapse [in]="open" [appear]="appear" [orientation]="orientation" [timeout]="timeout" [collapsedSize]="collapsedSize">
          <div style="${panel}">
            Toggle \`open\` from the controls panel. The caption below moves with it — that is the
            difference between this and \`Fade\`.
          </div>
        </okkly-collapse>
        <p style="${caption}">Something after the panel.</p>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<CollapseArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * What it is for. Three questions, one open at a time, and the rows below each one
 * moving as it opens. Note `timeout="auto"`: the answers are different lengths and
 * all three still feel like the same control.
 */
export const AnAccordion: Story = {
  name: "An accordion",
  render: () => ({
    props: {
      open: "tokens",
      items: [
        {
          id: "tokens",
          q: "What is a token?",
          a: "A named value — a colour, a size, a duration — that the components read instead of hard-coding it.",
        },
        {
          id: "themes",
          q: "How do themes work?",
          a: "Every token is a CSS variable declared on the root. A theme is a different set of values for the same names, which is why nothing has to re-render for the page to change appearance. Swap the variables and the whole library follows.",
        },
        {
          id: "frameworks",
          q: "Which frameworks?",
          a: "React, Vue, Svelte and Angular, from one stylesheet.",
        },
      ],
    },
    template: `
      <div style="${surface}">
        @for (item of items; track item.id) {
          <div>
            <button
              type="button"
              (click)="open = open === item.id ? null : item.id"
              style="${row}; width: 100%; cursor: pointer; color: var(--okkly-text-primary); font-family: inherit"
            >
              {{ item.q }}
              <span aria-hidden="true" style="color: var(--okkly-text-muted)">{{ open === item.id ? "−" : "+" }}</span>
            </button>
            <okkly-collapse [in]="open === item.id" timeout="auto">
              <div style="${panel}; margin-top: 8px">{{ item.a }}</div>
            </okkly-collapse>
          </div>
        }
      </div>`,
  }),
};

/**
 * `collapsedSize` leaves a strip of the content visible instead of closing to
 * nothing. It is the "show more" pattern: the reader can see there is more before
 * deciding to ask for it, which a fully closed panel never tells them.
 */
export const CollapsedSize: Story = {
  name: "Collapsed size",
  render: () => ({
    props: { open: false },
    template: `
      <div style="${surface}">
        <div style="position: relative">
          <okkly-collapse [in]="open" [collapsedSize]="72" timeout="auto">
            <div style="${panel}">
              Okryshto started as a token pipeline and grew a component library around it. The
              pipeline is still the part that matters: every colour, radius and duration in this
              page is a variable emitted from one source, and the framework packages are
              renderers over the same values. That is why a fix to a shadow lands everywhere at
              once, and why the theme can change without a single component re-rendering.
            </div>
          </okkly-collapse>
          @if (!open) {
            <div aria-hidden="true" style="position: absolute; inset-inline: 0; bottom: 0; height: 40px; border-radius: 0 0 12px 12px; background: linear-gradient(transparent, var(--okkly-bg-base))"></div>
          }
        </div>
        <button okklyButton size="small" variant="ghost" (click)="open = !open">{{ open ? "Show less" : "Show more" }}</button>
      </div>`,
  }),
};

/**
 * `orientation="horizontal"` animates width instead of height — a sidebar folding
 * away, a filter rail giving its space back to the table.
 *
 * The content needs a fixed width and `white-space: nowrap`, or it will reflow to
 * narrower and narrower lines as the box closes.
 */
export const Horizontal: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <div style="${surface}; width: 560px">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">
          {{ open ? "Collapse" : "Expand" }} the sidebar
        </button>
        <div style="display: flex; gap: 12px; align-items: stretch">
          <okkly-collapse [in]="open" orientation="horizontal" [timeout]="400">
            <div style="${panel}; width: 180px; white-space: nowrap">
              <div style="margin-bottom: 8px">Library</div>
              <div style="margin-bottom: 8px">Releases</div>
              <div>Settings</div>
            </div>
          </okkly-collapse>
          <div style="${panel}; flex: 1">The content takes the space back as the rail closes.</div>
        </div>
      </div>`,
  }),
};

/**
 * `"auto"` scales the duration with the measured size; a fixed number does not. The
 * difference is invisible on one panel and obvious on two of different lengths —
 * with a fixed timeout the long one appears to accelerate to keep up.
 */
export const AutoDuration: Story = {
  name: "Auto duration",
  render: () => ({
    props: { open: true, long },
    template: `
      <div style="${surface}; width: 600px">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Replay both columns</button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start">
          <div style="display: grid; gap: 8px">
            <p style="${caption}">timeout="auto"</p>
            <okkly-collapse [in]="open" timeout="auto"><div style="${panel}">One line.</div></okkly-collapse>
            <okkly-collapse [in]="open" timeout="auto"><div style="${panel}">{{ long }}</div></okkly-collapse>
          </div>
          <div style="display: grid; gap: 8px">
            <p style="${caption}">[timeout]="300"</p>
            <okkly-collapse [in]="open" [timeout]="300"><div style="${panel}">One line.</div></okkly-collapse>
            <okkly-collapse [in]="open" [timeout]="300"><div style="${panel}">{{ long }}</div></okkly-collapse>
          </div>
        </div>
      </div>`,
  }),
};

/**
 * A closed panel is still in the DOM at zero height, which means its links are still
 * in the tab order and its content is still read by a screen reader. `unmountOnExit`
 * is the fix, on content in an `ng-template okklyCollapseContent` — projected
 * content is created with its parent and cannot be unmounted.
 */
export const Unmounting: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <div style="${surface}">
        <button okklyButton size="small" variant="secondary" (click)="open = !open">Toggle both panels</button>
        <okkly-collapse [in]="open" [timeout]="300">
          <div style="${panel}">
            Kept mounted — <a href="#kept" style="color: var(--okkly-accent-primary)">this link</a>
            is in the DOM even when the panel is closed.
          </div>
        </okkly-collapse>
        <okkly-collapse [in]="open" [timeout]="300" mountOnEnter unmountOnExit>
          <ng-template okklyCollapseContent>
            <div style="${panel}">
              Unmounted on exit — <a href="#removed" style="color: var(--okkly-accent-primary)">this link</a>
              does not exist while closed.
            </div>
          </ng-template>
        </okkly-collapse>
        <p style="${caption}">Close both, then inspect the DOM: only one link is there.</p>
      </div>`,
  }),
};
