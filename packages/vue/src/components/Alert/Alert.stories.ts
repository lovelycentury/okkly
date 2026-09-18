import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Alert from "./Alert.vue";
import type { AlertProps, AlertSeverity } from "./Alert.types";

/**
 * An inline banner that reports the outcome of something the user just did, or a
 * condition they need to know about before they act. It renders as a live region,
 * so screen readers announce it as soon as it appears — mount it in response to an
 * event rather than leaving it on the page as decoration.
 *
 * Keep the `#title` slot to a few words and the body to one sentence. When the
 * user can do something about it, put that in the `#action` slot; when the
 * message is transient, give it `@close`. For a message that floats over the
 * page instead of sitting in the layout, use `Snackbar`.
 */
type AlertArgs = AlertProps & { title?: string; message?: string };

const meta: Meta<AlertArgs> = {
  title: "Feedback/Alert",
  component: Alert,
  args: {
    severity: "info",
    variant: "standard",
    title: "Heads up",
    message: "A new version of the design system is available.",
  },
  argTypes: {
    severity: { control: "select", options: ["success", "info", "warning", "danger", "dante"] },
    variant: { control: "inline-radio", options: ["standard", "outlined", "filled"] },
  },
  render: (args) => ({
    components: { Alert },
    setup: () => ({ args, surface }),
    template: `
      <div :style="surface">
        <Alert :severity="args.severity" :variant="args.variant">
          <template #title>{{ args.title }}</template>
          {{ args.message }}
        </Alert>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<AlertArgs>;

// Alerts stretch to their container, so the wrapper only caps the line length.
const surface = {
  display: "grid",
  gap: "12px",
  width: "460px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

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
    components: { Alert },
    setup: () => ({
      surface,
      items: [
        {
          severity: "info" as AlertSeverity,
          title: "Heads up",
          text: "Version 2.4 is available — the upgrade takes a single command.",
        },
        {
          severity: "success" as AlertSeverity,
          title: "Published",
          text: "Your changes are live on production.",
        },
        {
          severity: "warning" as AlertSeverity,
          title: "Approaching your quota",
          text: "You have used 940 of 1,000 monthly builds.",
        },
        {
          severity: "danger" as AlertSeverity,
          title: "Deploy failed",
          text: "Two type errors in packages/react blocked the build.",
        },
        {
          severity: "dante" as AlertSeverity,
          title: "New drop",
          text: "Night drive vol. 2 just landed in the token library.",
        },
      ],
    }),
    template: `
      <div :style="surface">
        <Alert v-for="item in items" :key="item.severity" :severity="item.severity">
          <template #title>{{ item.title }}</template>
          {{ item.text }}
        </Alert>
      </div>`,
  }),
};

/**
 * A form banner: the alert reports why the save failed and offers the way out.
 * The `#action` slot sits before the close button, so the recovery is the first
 * control the user reaches.
 */
export const WithAction: Story = {
  name: "With an action",
  render: () => ({
    components: { Alert, Button },
    template: `
      <div :style="{ display: 'grid', gap: '12px', width: '460px', fontFamily: 'var(--okkly-font-family-sans)', color: 'var(--okkly-text-primary)' }">
        <Alert severity="danger">
          <template #title>Couldn't save the draft</template>
          Your connection dropped while uploading. Nothing was lost.
          <template #action><Button variant="ghost" size="small">Retry</Button></template>
        </Alert>
        <Alert severity="success">
          <template #title>Moved to archive</template>
          3 projects were archived.
          <template #action><Button variant="ghost" size="small">Undo</Button></template>
        </Alert>
      </div>`,
  }),
};

/**
 * Attaching `@close` renders the dismiss button. The alert is yours to unmount —
 * the component only tells you the user asked for it to go.
 */
export const Dismissible: Story = {
  render: () => ({
    components: { Alert, Button },
    setup() {
      const open = ref(true);
      return { surface, open };
    },
    template: `
      <div :style="surface">
        <Alert v-if="open" severity="info" @close="open = false">
          <template #title>Storage is filling up</template>
          You are using 82% of your plan's storage.
        </Alert>
        <Button v-else variant="soft" size="small" @click="open = true">Show the alert again</Button>
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
    components: { Alert },
    setup: () => ({ surface }),
    template: `
      <div :style="surface">
        <Alert severity="warning" variant="standard">
          <template #title>Standard</template>
          Default treatment — a tinted surface that reads at a glance.
        </Alert>
        <Alert severity="warning" variant="outlined">
          <template #title>Outlined</template>
          Quieter; use it when several alerts share a page.
        </Alert>
        <Alert severity="warning" variant="filled">
          <template #title>Filled</template>
          Loudest; reserve it for a blocking condition.
        </Alert>
      </div>`,
  }),
};

/**
 * The icon follows `severity` by default. Fill the `#icon` slot with your own
 * node, or pass `:icon="false"` to drop it — useful for a title-less one-liner.
 */
export const Icons: Story = {
  render: () => ({
    components: { Alert },
    setup: () => ({ surface }),
    template: `
      <div :style="surface">
        <Alert severity="success">
          <template #title>Default icon</template>
          The glyph is chosen from the severity.
        </Alert>
        <Alert severity="success">
          <template #title>Custom icon</template>
          Any node works — an emoji, an SVG, an avatar.
          <template #icon><span aria-hidden="true">🚀</span></template>
        </Alert>
        <Alert severity="success" :icon="false">No icon and no title: a compact confirmation line.</Alert>
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
    components: { Alert, Button },
    template: `
      <div style="display: grid; gap: 16px; width: 520px; padding: 20px; border-radius: 12px; background: var(--okkly-bg-surface); border: 1px solid var(--okkly-border-subtle); font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)">
        <div>
          <h3 style="margin: 0; font-size: var(--okkly-font-size-lg)">Billing</h3>
          <p style="margin: 4px 0 0; color: var(--okkly-text-secondary); font-size: var(--okkly-font-size-sm)">Manage your plan and payment method.</p>
        </div>
        <Alert severity="warning">
          <template #title>Your card expires this month</template>
          Visa •••• 4242 expires 08/26. Renewals will fail after that.
          <template #action><Button variant="ghost" size="small">Update</Button></template>
        </Alert>
        <div style="display: flex; gap: 8px">
          <Button size="small">Change plan</Button>
          <Button variant="ghost" size="small">Download invoices</Button>
        </div>
      </div>`,
  }),
};
