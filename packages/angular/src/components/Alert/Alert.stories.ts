import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../Button/Button";
import { OkklyAlert, OkklyAlertAction, OkklyAlertIcon } from "./Alert";
import type { AlertSeverity, AlertVariant } from "./Alert";

/** Every input the Playground binds, plus `message` for the projected content. */
type AlertArgs = {
  message: string;
  severity: AlertSeverity;
  variant: AlertVariant;
  title: string;
  icon: boolean;
  closable: boolean;
};

// Alerts stretch to their container, so the wrapper only caps the line length.
const surface =
  "display: grid; gap: 12px; width: 460px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";

/**
 * An inline banner that reports the outcome of something the user just did, or a
 * condition they need to know about before they act. It renders as a live region,
 * so screen readers announce it as soon as it appears — add it in response to an
 * event rather than leaving it on the page as decoration.
 *
 * Keep the `title` to a few words and the message to one sentence. When the user
 * can do something about it, project the control tagged `okklyAlertAction`; when
 * the message is transient, make it `closable` and remove it on `(close)`. For a
 * message that floats over the page instead of sitting in the layout, use `Snackbar`.
 */
const meta: Meta<AlertArgs> = {
  title: "Feedback/Alert",
  component: OkklyAlert,
  decorators: [
    moduleMetadata({ imports: [OkklyAlert, OkklyAlertIcon, OkklyAlertAction, OkklyButton] }),
  ],
  args: {
    message: "A new version of the design system is available.",
    severity: "info",
    variant: "standard",
    title: "Heads up",
    icon: true,
    closable: false,
  },
  argTypes: {
    message: { control: "text", description: "Projected content — the alert's message." },
    severity: { control: "select", options: ["success", "info", "warning", "danger", "dante"] },
    variant: { control: "inline-radio", options: ["standard", "outlined", "filled"] },
    icon: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    closable: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-alert [severity]="severity" [variant]="variant" [title]="title" [icon]="icon" [closable]="closable">
          {{ message }}
        </okkly-alert>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<AlertArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The five tones, each with the message it is meant to carry. `dante` is the
 * brand announcement tone — it reports news, not status.
 */
export const Severities: Story = {
  render: () => ({
    props: {
      items: [
        {
          severity: "info",
          title: "Heads up",
          text: "Version 2.4 is available — the upgrade takes a single command.",
        },
        { severity: "success", title: "Published", text: "Your changes are live on production." },
        {
          severity: "warning",
          title: "Approaching your quota",
          text: "You have used 940 of 1,000 monthly builds.",
        },
        {
          severity: "danger",
          title: "Deploy failed",
          text: "Two type errors in packages/react blocked the build.",
        },
        {
          severity: "dante",
          title: "New drop",
          text: "Night drive vol. 2 just landed in the token library.",
        },
      ],
    },
    template: `
      <div style="${surface}">
        @for (item of items; track item.severity) {
          <okkly-alert [severity]="item.severity" [title]="item.title">{{ item.text }}</okkly-alert>
        }
      </div>`,
  }),
};

/**
 * A form banner: the alert reports why the save failed and offers the way out.
 * The action sits before the close button, so the recovery is the first control
 * the user reaches.
 */
export const WithAction: Story = {
  name: "With an action",
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-alert severity="danger" title="Couldn't save the draft">
          Your connection dropped while uploading. Nothing was lost.
          <button okklyButton okklyAlertAction variant="ghost" size="small">Retry</button>
        </okkly-alert>
        <okkly-alert severity="success" title="Moved to archive">
          3 projects were archived.
          <button okklyButton okklyAlertAction variant="ghost" size="small">Undo</button>
        </okkly-alert>
      </div>`,
  }),
};

/**
 * `closable` renders the dismiss button. The alert is yours to remove — the
 * component only tells you, through `(close)`, that the user asked for it to go.
 */
export const Dismissible: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <div style="${surface}">
        @if (open) {
          <okkly-alert severity="info" title="Storage is filling up" closable (close)="open = false">
            You are using 82% of your plan's storage.
          </okkly-alert>
        } @else {
          <button okklyButton variant="soft" size="small" (click)="open = true">Show the alert again</button>
        }
      </div>`,
  }),
};

/**
 * `standard` sits on a tinted surface, `outlined` reduces to a border for dense
 * pages, and `filled` carries the tone at full strength for the one message that
 * must not be missed.
 */
export const Variants: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-alert severity="warning" variant="standard" title="Standard">
          Default treatment — a tinted surface that reads at a glance.
        </okkly-alert>
        <okkly-alert severity="warning" variant="outlined" title="Outlined">
          Quieter; use it when several alerts share a page.
        </okkly-alert>
        <okkly-alert severity="warning" variant="filled" title="Filled">
          Loudest; reserve it for a blocking condition.
        </okkly-alert>
      </div>`,
  }),
};

/**
 * The icon follows `severity` by default. Project your own tagged
 * `okklyAlertIcon`, or set `icon="false"` to drop it — useful for a title-less
 * one-liner.
 */
export const Icons: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-alert severity="success" title="Default icon">The glyph is chosen from the severity.</okkly-alert>
        <okkly-alert severity="success" title="Custom icon">
          <span okklyAlertIcon aria-hidden="true">🚀</span>
          Any node works — an emoji, an SVG, an avatar.
        </okkly-alert>
        <okkly-alert severity="success" icon="false">No icon and no title: a compact confirmation line.</okkly-alert>
      </div>`,
  }),
};

/**
 * A settings page with the alert in place, showing how it reads next to the
 * content it belongs to rather than on its own.
 */
export const InPage: Story = {
  name: "In a page",
  render: () => ({
    template: `
      <div style="${surface}; width: 520px; gap: 16px; padding: 20px; border-radius: 12px; background: var(--okkly-bg-surface); border: 1px solid var(--okkly-border-subtle)">
        <div>
          <h3 style="margin: 0; font-size: var(--okkly-font-size-lg)">Billing</h3>
          <p style="margin: 4px 0 0; color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm)">
            Manage your plan and payment method.
          </p>
        </div>
        <okkly-alert severity="warning" title="Your card expires this month">
          Visa •••• 4242 expires 08/26. Renewals will fail after that.
          <button okklyButton okklyAlertAction variant="ghost" size="small">Update</button>
        </okkly-alert>
        <div style="display: flex; gap: 8px">
          <button okklyButton size="small">Change plan</button>
          <button okklyButton variant="ghost" size="small">Download invoices</button>
        </div>
      </div>`,
  }),
};
