import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyBox } from "./Box";
import type {
  BoxAlign,
  BoxColor,
  BoxDisplay,
  BoxFlexDirection,
  BoxJustify,
  BoxResponsive,
  BoxSpacing,
} from "./Box";

/** Every input the Playground binds, plus `label` for the projected content. */
type BoxArgs = {
  label: string;
  p: BoxResponsive<BoxSpacing>;
  display: BoxDisplay;
  flexDirection: BoxFlexDirection;
  alignItems: BoxAlign;
  justifyContent: BoxJustify;
  bgcolor: BoxColor;
  color: BoxColor;
  border: number;
  borderColor: BoxColor;
  borderRadius: BoxSpacing;
  container: boolean;
};

const label = "font-family: var(--okkly-font-family-sans); font-size: var(--okkly-font-size-sm)";

/**
 * The layout primitive, as a directive: `okklyBox` puts MUI-style system props
 * on whatever element it sits on. Numeric spacing steps on the 4px scale
 * (`p="2"` is 8px), colors name design tokens (`bgcolor="bg.surface-raised"`),
 * and every prop accepts one value per breakpoint (`[flexDirection]="{ base:
 * 'column', md: 'row' }"`) — no stylesheet needed for one-off layout.
 */
const meta: Meta<BoxArgs> = {
  title: "Helpers/Box",
  component: OkklyBox,
  decorators: [moduleMetadata({ imports: [OkklyBox] })],
  args: {
    label: "A box with a 16px padding",
    p: 4,
    display: "block",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
    bgcolor: "bg.surface-raised",
    color: "text.primary",
    border: 1,
    borderColor: "border.subtle",
    borderRadius: 3,
    container: false,
  },
  // Descriptions and defaults come from the sources via Compodoc; only the
  // controls are declared here.
  argTypes: {
    label: { control: "text", description: "Projected content." },
    display: { control: "select", options: ["block", "flex", "inline-flex", "grid", "none"] },
    flexDirection: { control: "inline-radio", options: ["row", "column"] },
    alignItems: { control: "select", options: ["stretch", "flex-start", "center", "flex-end"] },
    justifyContent: {
      control: "select",
      options: ["flex-start", "center", "flex-end", "space-between"],
    },
    bgcolor: {
      control: "select",
      options: ["bg.canvas", "bg.inset", "bg.surface", "bg.surface-raised", "accent.primary"],
    },
    borderColor: {
      control: "select",
      options: ["border.subtle", "border.default", "border.strong"],
    },
    color: { control: "select", options: ["text.primary", "text.secondary", "text.muted"] },
    container: {
      control: "boolean",
      table: { defaultValue: { summary: "false" } },
    },
  },
  render: (args) => ({
    props: { ...args, label: args.label, labelStyle: label },
    template: `
      <div okklyBox
        [p]="p" [display]="display" [flexDirection]="flexDirection" [alignItems]="alignItems"
        [justifyContent]="justifyContent" [bgcolor]="bgcolor" [color]="color" [border]="border"
        [borderColor]="borderColor" [borderRadius]="borderRadius" [container]="container"
        [style]="labelStyle"
      >{{ label }}</div>`,
  }),
};

export default meta;
type Story = StoryObj<BoxArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The 4px scale: `p="1"` is 4px, `p="4"` 16px, `p="8"` 32px. Strings pass
 * through as CSS (`p="1.25rem"`).
 */
export const SpacingScale: Story = {
  render: () => ({
    props: { label, steps: [1, 2, 4, 6, 8] },
    template: `
      <div okklyBox display="flex" alignItems="flex-end" gap="4" color="text.secondary" [style]="label">
        @for (step of steps; track step) {
          <div okklyBox display="flex" flexDirection="column" alignItems="center" gap="2">
            <div okklyBox bgcolor="bg.surface-raised" border="1" borderColor="border.default" [p]="step">
              <div okklyBox width="24" height="24" bgcolor="accent.primary" borderRadius="1"></div>
            </div>
            p={{ step }} · {{ step * 4 }}px
          </div>
        }
      </div>`,
  }),
};

/**
 * A settings row built from Boxes alone: a flex row that pushes its action to
 * the far edge, with token colors and a hairline border.
 */
export const SettingsRow: Story = {
  render: () => ({
    props: { label },
    template: `
      <div okklyBox
        display="flex" alignItems="center" justifyContent="space-between" gap="4"
        px="5" py="4" maxWidth="480" bgcolor="bg.surface-raised"
        border="1" borderColor="border.subtle" borderRadius="3" [style]="label"
      >
        <div okklyBox display="flex" flexDirection="column" gap="1">
          <div okklyBox color="text.primary">Weekly digest</div>
          <div okklyBox color="text.secondary">A summary of your projects every Monday.</div>
        </div>
        <button okklyBox type="button" px="3" py="2" borderRadius="2" bgcolor="accent.primary">
          Enable
        </button>
      </div>`,
  }),
};

/**
 * Every prop takes one value per breakpoint. These cards stack below `md`
 * (993px) and sit side by side from there up, with a larger gap and padding —
 * resize the canvas to watch it switch.
 */
export const Responsive: Story = {
  render: () => ({
    props: { label, steps: ["Plan", "Build", "Ship"] },
    template: `
      <div okklyBox
        display="flex"
        [flexDirection]="{ base: 'column', md: 'row' }"
        [gap]="{ base: 2, md: 6 }"
        [p]="{ base: 3, md: 6 }"
        bgcolor="bg.inset" borderRadius="3" [style]="label"
      >
        @for (step of steps; track step) {
          <div okklyBox
            flexGrow="1" p="4" bgcolor="bg.surface-raised" border="1"
            borderColor="border.subtle" borderRadius="2" color="text.primary"
          >{{ step }}</div>
        }
      </div>`,
  }),
};

/**
 * `@`-keys answer to the nearest `container` Box instead of the window. The
 * same card sits in a narrow region and a wide one: it stacks in the first and
 * lays out as a row in the second, whatever the window size. Drag either
 * region's corner to resize it and watch the card switch at `@md` (640px).
 */
export const ContainerQueries: Story = {
  render: () => ({
    props: { label, widths: [280, 720] },
    template: `
      <div okklyBox display="flex" gap="4" alignItems="flex-start" [style]="label">
        @for (width of widths; track width) {
          <div okklyBox
            container [width]="width" p="2" border="1" borderColor="border.default" borderRadius="3"
            style="resize: horizontal; overflow: auto"
          >
            <div okklyBox
              display="flex"
              [flexDirection]="{ base: 'column', '@md': 'row' }"
              [alignItems]="{ '@md': 'center' }"
              [gap]="{ base: 2, '@md': 4 }"
              [p]="{ base: 3, '@md': 5 }"
              bgcolor="bg.surface-raised" border="1" borderColor="border.subtle"
              borderRadius="3" color="text.primary"
            >
              <div okklyBox
                [width]="{ base: 1, '@md': 120 }" height="72" flexShrink="0"
                bgcolor="accent.secondary" borderRadius="2"
              ></div>
              <div okklyBox display="flex" flexDirection="column" gap="1">
                <div okklyBox>Quarterly report</div>
                <div okklyBox color="text.secondary">Stacked below a 640px container, a row from there up.</div>
              </div>
            </div>
          </div>
        }
      </div>`,
  }),
};

/**
 * `okklyBox` goes on whatever element the markup calls for — there is no `as`
 * to pick one. Here a `section` landmark wrapping a list, both laid out through
 * system props.
 */
export const PolymorphicAs: Story = {
  render: () => ({
    props: { label, files: ["roadmap.pdf", "brand.fig", "notes.md"] },
    template: `
      <section okklyBox aria-label="Recent files" p="4" bgcolor="bg.surface" borderRadius="3">
        <ul okklyBox display="flex" flexDirection="column" gap="2" m="0" p="0" [style]="label">
          @for (file of files; track file) {
            <li okklyBox color="text.secondary" style="list-style: none">{{ file }}</li>
          }
        </ul>
      </section>`,
  }),
};

/**
 * Numeric spacing is a `calc` on `--okkly-space-unit`, so overriding the unit
 * on a Box rescales every numeric step inside it — here the same layout on a
 * 4px and a 6px unit.
 */
export const CustomStyling: Story = {
  render: () => ({
    props: { label, units: ["0.25rem", "0.375rem"] },
    template: `
      <div okklyBox display="flex" gap="6" alignItems="flex-start" [style]="label">
        @for (unit of units; track unit) {
          <div okklyBox
            display="flex" flexDirection="column" gap="2" p="4" bgcolor="bg.surface-raised"
            borderRadius="3" color="text.secondary" [style.--okkly-space-unit]="unit"
          >
            <div okklyBox width="48" height="8" bgcolor="accent.primary" borderRadius="1"></div>
            <div okklyBox width="32" height="8" bgcolor="accent.secondary" borderRadius="1"></div>
            unit {{ unit }}
          </div>
        }
      </div>`,
  }),
};
