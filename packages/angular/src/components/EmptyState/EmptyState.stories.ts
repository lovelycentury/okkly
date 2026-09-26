import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { iconSearch, iconUpload } from "@okkly/icons";
import { OkklyButton } from "../Button/Button";
import { OkklyIcon } from "../Icon/Icon";
import type { SeverityIconSeverity } from "../SeverityIcon/SeverityIcon";
import { OkklyEmptyState, OkklyEmptyStateAction, OkklyEmptyStateIcon } from "./EmptyState";
import type { EmptyStateColor, EmptyStateSize } from "./EmptyState";

/** Every input the Playground binds. */
type EmptyStateArgs = {
  title: string;
  description?: string;
  severity?: SeverityIconSeverity;
  color: EmptyStateColor;
  size: EmptyStateSize;
};

const surface =
  "width: 480px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";

/**
 * The panel that stands in for a list with nothing in it. Say *why* it's empty
 * and give the user the one thing to do next — "No results" alone leaves them
 * stuck, "No results for *rain* — try a shorter query" doesn't.
 *
 * There are three distinct empties and they want different copy: nothing created
 * yet (offer the create action), nothing matching a filter (offer to clear it),
 * and nothing loaded because something broke (offer a retry, with
 * `color="danger"`).
 */
const meta: Meta<EmptyStateArgs> = {
  title: "Feedback/EmptyState",
  component: OkklyEmptyState,
  decorators: [
    moduleMetadata({
      imports: [
        OkklyEmptyState,
        OkklyEmptyStateIcon,
        OkklyEmptyStateAction,
        OkklyButton,
        OkklyIcon,
      ],
    }),
  ],
  args: {
    title: "No projects yet",
    description: "Projects you create or get invited to will show up here.",
    color: "primary",
    size: "medium",
  },
  argTypes: {
    color: { control: "inline-radio", options: ["primary", "dante", "indigo", "danger"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    severity: {
      control: "select",
      options: ["success", "info", "warning", "danger", "primary", "neutral"],
    },
  },
  parameters: { controls: { exclude: ["hasCustomIcon", "hasAction", "iconSeverity", "iconSize"] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-empty-state [title]="title" [description]="description" [severity]="severity" [color]="color" [size]="size">
          <button okklyButton okklyEmptyStateAction size="small">New project</button>
        </okkly-empty-state>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<EmptyStateArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * Nothing created yet. The action is the whole point of the panel, so it is a
 * primary button and it says exactly what it will make.
 */
export const FirstRun: Story = {
  name: "Nothing created yet",
  render: () => ({
    props: { icon: iconUpload },
    template: `
      <div style="${surface}">
        <okkly-empty-state
          title="Create your first project"
          description="A project holds your tracks, artwork, and release dates in one place."
        >
          <okkly-icon okklyEmptyStateIcon [icon]="icon" fontSize="inherit" />
          <button okklyButton okklyEmptyStateAction size="small">New project</button>
          <button okklyButton okklyEmptyStateAction size="small" variant="ghost">Import from Drive</button>
        </okkly-empty-state>
      </div>`,
  }),
};

/**
 * Nothing matched the filter. The query is echoed back so the user can see what
 * was actually searched for, and the action clears it rather than repeating it.
 */
export const NoResults: Story = {
  name: "No results",
  render: () => ({
    props: { icon: iconSearch },
    template: `
      <div style="${surface}">
        <okkly-empty-state
          color="indigo"
          title="No tracks match “rain”"
          description="Try a shorter query, or clear the genre filter to search everything."
        >
          <okkly-icon okklyEmptyStateIcon [icon]="icon" fontSize="inherit" />
          <button okklyButton okklyEmptyStateAction size="small" variant="soft">Clear filters</button>
        </okkly-empty-state>
      </div>`,
  }),
};

/**
 * The load failed. `color="danger"` and a `danger` severity mark it as a fault
 * rather than an absence — the data may well exist.
 */
export const LoadFailed: Story = {
  name: "Load failed",
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-empty-state
          color="danger"
          severity="danger"
          title="Couldn't load your projects"
          description="The request timed out after 30 seconds. Your work is safe."
        >
          <button okklyButton okklyEmptyStateAction size="small" variant="soft">Try again</button>
        </okkly-empty-state>
      </div>`,
  }),
};

/**
 * `size` scales the padding, the title, and the halo together. `small` fits
 * inside a sidebar or a card; `large` owns a full page.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: grid; gap: 18px; ${surface}">
        @for (size of sizes; track size) {
          <okkly-empty-state
            [size]="size"
            [title]="'No projects yet (' + size + ')'"
            description="Projects you create or get invited to will show up here."
          >
            <button okklyButton okklyEmptyStateAction size="small">New project</button>
          </okkly-empty-state>
        }
      </div>`,
  }),
};

/**
 * `color` tints the halo and the default icon. Pick it to match what the empty
 * means, not to decorate: mint for a fresh start, indigo for a filtered view,
 * danger for a failure.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "danger"] },
    template: `
      <div style="display: grid; gap: 18px; ${surface}">
        @for (color of colors; track color) {
          <okkly-empty-state
            [color]="color"
            size="small"
            [title]="color"
            [description]="'Halo and icon in the ' + color + ' tone.'"
          />
        }
      </div>`,
  }),
};

/**
 * Without an `action` the panel is purely informational — right for a read-only
 * view where the user has nothing to do about the emptiness.
 */
export const WithoutAction: Story = {
  name: "Without an action",
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-empty-state
          title="No activity this week"
          description="Plays, saves, and comments from the last seven days appear here."
        />
      </div>`,
  }),
};

/**
 * `severity` picks the glyph and `color` picks the tone — they are separate
 * knobs, so a cross in mint is a legal (if odd) combination. Match them unless
 * you mean not to.
 */
export const GlyphAndTone: Story = {
  name: "Glyph and tone",
  render: () => ({
    template: `
      <div style="display: grid; gap: 18px; ${surface}">
        <okkly-empty-state size="small" severity="warning" color="dante" title="warning glyph, dante tone" />
        <okkly-empty-state size="small" severity="danger" color="danger" title="danger glyph, danger tone" />
      </div>`,
  }),
};
