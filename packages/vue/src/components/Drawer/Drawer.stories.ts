import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { iconFolder, iconHome, iconSearch, iconStar } from "@okkly/icons";
import Button from "../Button/Button.vue";
import Icon from "../Icon/Icon.vue";
import Drawer from "./Drawer.vue";
import type { DrawerProps } from "./Drawer.types";

/**
 * A panel that slides in from an edge and takes the page with it. Use it for
 * navigation on narrow screens, for a filter rail beside a table, or for a bottom
 * sheet of actions — anything that is a *place* rather than a question. A question
 * is a `Dialog`.
 *
 * Built on `Modal`, which owns the portal, backdrop, focus trap, scroll lock and
 * focus restoration. The drawer adds the anchored, sliding paper — and keeps itself
 * mounted for the length of the slide-out, since unmounting on the tick `open`
 * flips would cut the animation short.
 *
 * Size comes from CSS variables rather than props: `--okkly-drawer-width` for the
 * left and right anchors, `--okkly-drawer-height` for top and bottom. Set them on
 * the drawer itself through `style` — they are declared on the component element,
 * so an override on an ancestor will not reach them.
 *
 * Props follow MUI's Drawer (`anchor`, `variant`, plus the Modal pass-throughs).
 * `variant="temporary"` (the default) is what the controls below demo — an
 * overlay through `Modal`. For an always-on or toggleable in-flow sidebar, see
 * `variant="permanent"`/`"persistent"` in the stories further down; for a
 * `temporary` drawer that also opens/closes on an edge swipe, see
 * `SwipeableDrawer`.
 */
const meta: Meta<DrawerProps> = {
  title: "Overlays/Drawer",
  component: Drawer,
  args: {
    anchor: "right",
    variant: "temporary",
    keepMounted: false,
    hideBackdrop: false,
    disableEscapeKeyDown: false,
    disableScrollLock: false,
  },
  argTypes: {
    anchor: { control: "inline-radio", options: ["left", "right", "top", "bottom"] },
    variant: { control: false },
    keepMounted: { control: "boolean" },
    hideBackdrop: { control: "boolean" },
    disableEscapeKeyDown: { control: "boolean" },
    disableScrollLock: { control: "boolean" },
    open: { control: false },
    container: { control: false },
  },
  render: (args) => ({
    components: { Drawer, Button },
    setup() {
      const open = ref(false);
      return { args, surface, panel, heading, open };
    },
    template: `
      <div :style="surface">
        <Button size="small" @click="open = true">Open the drawer</Button>
        <Drawer v-bind="args" :open="open" @close="open = false">
          <div :style="panel">
            <h2 :style="heading">Panel</h2>
            <p style="margin: 0">Change \`anchor\` from the controls and reopen.</p>
            <Button size="small" variant="secondary" @click="open = false">Close</Button>
          </div>
        </Drawer>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<DrawerProps>;

const surface = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// The paper is a bare flex column — it brings a background and a border and nothing
// else. Padding and rhythm are the caller's, the same bargain `Modal` makes.
const panel = {
  display: "grid",
  gap: "16px",
  alignContent: "start",
  justifyItems: "start",
  padding: "24px",
  fontFamily: "var(--okkly-font-family-sans)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  color: "var(--okkly-text-secondary)",
};

const heading = {
  margin: 0,
  fontSize: "var(--okkly-font-size-lg)",
  color: "var(--okkly-text-primary)",
};

const navItem = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  color: "var(--okkly-text-secondary)",
  textDecoration: "none",
};

const captionStyle =
  "margin: 0; width: 100%; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The common case: the navigation of a site that does not have room for it. Anchored
 * left, because that is where a menu button is, and closing on every item — a
 * drawer that stays open after you have chosen makes you close it twice.
 */
export const ANavigationPanel: Story = {
  name: "A navigation panel",
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const open = ref(false);
      const page = ref("Library");
      const pages = ["Library", "Releases", "Analytics", "Settings"];
      function select(item: string) {
        page.value = item;
        open.value = false;
      }
      return { surface, panel, heading, navItem, captionStyle, open, page, pages, select };
    },
    template: `
      <div :style="surface">
        <Button size="small" variant="secondary" @click="open = true">Menu</Button>
        <Drawer :open="open" anchor="left" @close="open = false">
          <nav :style="{ ...panel, gap: '4px', width: '100%' }" aria-label="Main">
            <h2 :style="{ ...heading, marginBottom: '12px' }">Okryshto</h2>
            <a
              v-for="item in pages"
              :key="item"
              :href="\`#\${item.toLowerCase()}\`"
              :style="{
                ...navItem,
                background: page === item ? 'var(--okkly-bg-surface-raised)' : 'transparent',
                color: page === item ? 'var(--okkly-text-primary)' : 'var(--okkly-text-secondary)',
              }"
              @click.prevent="select(item)"
            >
              {{ item }}
            </a>
          </nav>
        </Drawer>
        <p :style="captionStyle">Current page: {{ page }}</p>
      </div>`,
  }),
};

/**
 * All four edges. `left` and `right` take `--okkly-drawer-width`, `top` and
 * `bottom` take `--okkly-drawer-height`; the bottom anchor also rounds its top
 * corners, which is what makes it read as a sheet rather than a bar.
 */
export const Anchors: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      // `anchor` and `open` are deliberately separate state: closing must not
      // also clear the anchor, or the drawer would switch edges mid-close —
      // `anchor` picks where it opens from, `open` alone decides visibility.
      const anchor = ref<DrawerProps["anchor"]>("right");
      const open = ref(false);
      const anchors: DrawerProps["anchor"][] = ["left", "right", "top", "bottom"];
      function openFrom(item: DrawerProps["anchor"]) {
        anchor.value = item;
        open.value = true;
      }
      return { surface, panel, heading, anchor, open, anchors, openFrom };
    },
    template: `
      <div :style="surface">
        <Button v-for="item in anchors" :key="item" size="small" variant="secondary" @click="openFrom(item)">{{ item }}</Button>
        <Drawer :open="open" :anchor="anchor" @close="open = false">
          <div :style="panel">
            <h2 :style="heading">anchor = {{ anchor }}</h2>
            <Button size="small" variant="secondary" @click="open = false">Close</Button>
          </div>
        </Drawer>
      </div>`,
  }),
};

/**
 * A bottom sheet of filters, sized with `--okkly-drawer-height` rather than a prop.
 * The variable is declared on the drawer element, so it has to be set there —
 * putting it on a wrapper will not reach it.
 */
export const ABottomSheet: Story = {
  name: "A bottom sheet",
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const open = ref(false);
      const active = ref<string[]>(["Albums"]);
      const filters = ["Albums", "Singles", "Remixes", "Unreleased"];
      function toggle(filter: string) {
        active.value = active.value.includes(filter)
          ? active.value.filter((item) => item !== filter)
          : [...active.value, filter];
      }
      return { surface, panel, heading, open, active, filters, toggle };
    },
    template: `
      <div :style="surface">
        <Button size="small" variant="secondary" @click="open = true">Filters</Button>
        <Drawer :open="open" anchor="bottom" style="--okkly-drawer-height: 18rem" @close="open = false">
          <div :style="{ ...panel, width: '100%' }">
            <h2 :style="heading">Filters</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px">
              <Button v-for="filter in filters" :key="filter" size="small" :variant="active.includes(filter) ? 'primary' : 'ghost'" @click="toggle(filter)">{{ filter }}</Button>
            </div>
            <Button size="small" variant="secondary" @click="open = false">Show results</Button>
          </div>
        </Drawer>
        <p :style="{ margin: 0, fontSize: 'var(--okkly-font-size-sm)', color: 'var(--okkly-text-muted)' }">Active: {{ active.join(", ") || "none" }}</p>
      </div>`,
  }),
};

/**
 * `--okkly-drawer-width` for the side anchors. There is no `width` prop on purpose:
 * the value belongs to the design, not to the call site, so a theme can set it once
 * for every drawer in the app.
 */
export const Widths: Story = {
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const width = ref<string | null>(null);
      const widths = ["16rem", "20rem", "32rem"];
      return { surface, panel, heading, width, widths };
    },
    template: `
      <div :style="surface">
        <Button v-for="value in widths" :key="value" size="small" variant="secondary" @click="width = value">{{ value }}</Button>
        <Drawer :open="width !== null" anchor="right" :style="\`--okkly-drawer-width: \${width ?? '20rem'}\`" @close="width = null">
          <div :style="panel">
            <h2 :style="heading">{{ width }}</h2>
            <p style="margin: 0">Set through \`--okkly-drawer-width\` on the drawer itself.</p>
            <Button size="small" variant="secondary" @click="width = null">Close</Button>
          </div>
        </Drawer>
      </div>`,
  }),
};

/**
 * The `close` emit's second argument reports why — `"backdropClick"` or
 * `"escapeKeyDown"` — so a drawer holding a half-finished form can refuse the
 * stray click and still honour Escape. The reason of the last close is shown
 * below.
 */
export const ClosingReasons: Story = {
  name: "Closing reasons",
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const open = ref(false);
      const reason = ref<string | null>(null);
      function handleClose(_event: Event, closeReason: string) {
        reason.value = closeReason;
        open.value = false;
      }
      return { surface, panel, heading, open, reason, handleClose };
    },
    template: `
      <div :style="surface">
        <Button size="small" variant="secondary" @click="open = true">Open</Button>
        <Drawer :open="open" @close="handleClose">
          <div :style="panel">
            <h2 :style="heading">Close me</h2>
            <p style="margin: 0">Click the scrim, or press Escape, and compare the reason.</p>
            <Button size="small" variant="secondary" @click="reason = 'your own handler'; open = false">Close from a button</Button>
          </div>
        </Drawer>
        <p style="margin: 0; width: 100%; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">Last reason: {{ reason ?? "—" }}</p>
      </div>`,
  }),
};

/**
 * The drawer traps focus while it is open and puts focus back on the trigger when
 * it closes — both inherited from `Modal`, and neither true of this component
 * before it was built on one.
 *
 * Tab from inside the panel: focus cycles within it and never reaches the buttons on
 * the page behind. Close it, and the caret returns to the button you opened it with.
 */
export const FocusHandling: Story = {
  name: "Focus handling",
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const open = ref(false);
      return { surface, panel, heading, open };
    },
    template: `
      <div :style="surface">
        <Button size="small" variant="secondary" @click="open = true">Open, then Tab around</Button>
        <Button size="small" variant="ghost">A button on the page</Button>
        <Drawer :open="open" @close="open = false">
          <div :style="panel">
            <h2 :style="heading">Trapped</h2>
            <Button size="small" variant="ghost">First</Button>
            <Button size="small" variant="ghost">Second</Button>
            <Button size="small" variant="secondary" @click="open = false">Close</Button>
          </div>
        </Drawer>
        <p style="margin: 0; width: 100%; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">Tab never reaches "A button on the page" while the drawer is open.</p>
      </div>`,
  }),
};

const appShellStyle =
  "display: flex; height: 20rem; border: 1px solid var(--okkly-border-subtle); border-radius: 16px; overflow: hidden; font-family: var(--okkly-font-family-sans)";
const appMainStyle = "flex: 1; min-width: 0; padding: 24px; color: var(--okkly-text-secondary)";

/**
 * `variant="permanent"` renders no `Modal` at all — no portal, no backdrop, no
 * focus trap — just the anchored paper as a normal in-flow element. It is
 * always shown; `open`/the `close` emit do nothing. This is the shape for an
 * app's own persistent navigation rail, sized by `--okkly-drawer-width` like
 * any other side anchor.
 */
export const APermanentSidebar: Story = {
  name: "A permanent sidebar",
  render: () => ({
    components: { Drawer },
    setup: () => ({ appShellStyle, appMainStyle, panel, heading, navItem }),
    template: `
      <div :style="appShellStyle">
        <Drawer variant="permanent" anchor="left" style="--okkly-drawer-width: 14rem">
          <nav :style="{ ...panel, gap: '4px', width: '100%' }" aria-label="Main">
            <h2 :style="{ ...heading, marginBottom: '12px' }">Okkly</h2>
            <a
              v-for="(item, index) in ['Library', 'Releases', 'Analytics', 'Settings']"
              :key="item"
              :href="\`#\${item.toLowerCase()}\`"
              :style="{
                ...navItem,
                background: index === 0 ? 'var(--okkly-bg-surface-raised)' : 'transparent',
                color: index === 0 ? 'var(--okkly-text-primary)' : 'var(--okkly-text-secondary)',
              }"
            >{{ item }}</a>
          </nav>
        </Drawer>
        <main :style="appMainStyle">
          <p style="margin: 0">The sidebar beside this is always there — there is no state to toggle.</p>
        </main>
      </div>`,
  }),
};

/**
 * `variant="persistent"` toggles through `open`/the `close` emit like
 * `temporary`, but never overlays the page: it collapses its own width to 0
 * instead of sliding off-screen, so the content beside it reclaims that space
 * rather than a backdrop dimming it. No portal, no backdrop, no focus trap
 * here either — the caller's own toggle (below, the menu button) is both the
 * open and the close trigger, the same way a real app shell's would be.
 */
export const APersistentSidebar: Story = {
  name: "A persistent sidebar",
  render: () => ({
    components: { Drawer, Button },
    setup() {
      const open = ref(true);
      return { appShellStyle, appMainStyle, surface, panel, heading, navItem, open };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div :style="surface">
          <Button size="small" variant="secondary" @click="open = !open">{{ open ? "Collapse" : "Expand" }} sidebar</Button>
        </div>
        <div :style="appShellStyle">
          <Drawer variant="persistent" anchor="left" :open="open" @close="open = false" style="--okkly-drawer-width: 14rem">
            <nav :style="{ ...panel, gap: '4px', width: '100%' }" aria-label="Main">
              <h2 :style="{ ...heading, marginBottom: '12px' }">Okkly</h2>
              <a
                v-for="(item, index) in ['Library', 'Releases', 'Analytics', 'Settings']"
                :key="item"
                :href="\`#\${item.toLowerCase()}\`"
                :style="{
                  ...navItem,
                  background: index === 0 ? 'var(--okkly-bg-surface-raised)' : 'transparent',
                  color: index === 0 ? 'var(--okkly-text-primary)' : 'var(--okkly-text-secondary)',
                }"
              >{{ item }}</a>
            </nav>
          </Drawer>
          <main :style="appMainStyle">
            <p style="margin: 0">The content here reflows as the sidebar collapses and expands.</p>
          </main>
        </div>
      </div>`,
  }),
};

const railItems = [
  { label: "Library", icon: iconHome },
  { label: "Releases", icon: iconFolder },
  { label: "Favourites", icon: iconStar },
  { label: "Search", icon: iconSearch },
];

/**
 * `mini` gives a `persistent` drawer a third state between closed and open: a
 * short view, `--okkly-drawer-mini-width` wide (`--okkly-drawer-mini-height`
 * tall for the top/bottom anchors). `open` still decides whether it shows at
 * all; `mini` only narrows an open one. The paper keeps its full size and is
 * clipped toward the anchored edge, so the icon column stays in view.
 *
 * Content can react two ways: CSS against the `okkly-drawer--mini` class on
 * the drawer root, or `useDrawerState()` in JS — the nav items below use the
 * hook to swap their labels for tooltips.
 */
export const APersistentSidebarWithAShortView: Story = {
  name: "A persistent sidebar with a short view",
  render: () => ({
    components: { Drawer, Icon },
    setup() {
      const state = ref<"closed" | "mini" | "open">("mini");
      return { appShellStyle, appMainStyle, surface, panel, state, railItems };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div :style="surface">
          <button
            v-for="value in ['closed', 'mini', 'open']"
            :key="value"
            type="button"
            :style="\`padding: 6px 12px; border-radius: 8px; border: 1px solid var(--okkly-border-subtle); background: \${state === value ? 'var(--okkly-accent-primary)' : 'transparent'}; color: \${state === value ? '#fff' : 'var(--okkly-text-secondary)'}; cursor: pointer\`"
            @click="state = value"
          >{{ value }}</button>
        </div>
        <div :style="appShellStyle">
          <Drawer variant="persistent" anchor="left" :open="state !== 'closed'" :mini="state === 'mini'" @close="state = 'closed'" style="--okkly-drawer-width: 14rem">
            <nav :style="{ ...panel, gap: '4px', width: '100%', padding: '12px' }" aria-label="Main">
              <a
                v-for="(item, index) in railItems"
                :key="item.label"
                :href="\`#\${item.label.toLowerCase()}\`"
                :title="state === 'mini' ? item.label : undefined"
                :aria-label="state === 'mini' ? item.label : undefined"
                :style="\`display: flex; align-items: center; gap: 12px; white-space: nowrap; padding: 10px 12px; border-radius: 10px; text-decoration: none; background: \${index === 0 ? 'var(--okkly-bg-surface-raised)' : 'transparent'}; color: \${index === 0 ? 'var(--okkly-text-primary)' : 'var(--okkly-text-secondary)'}\`"
              >
                <Icon :icon="item.icon" font-size="small" />
                <span v-if="state !== 'mini'">{{ item.label }}</span>
              </a>
            </nav>
          </Drawer>
          <main :style="appMainStyle">
            <p style="margin: 0">Closed, a short icon rail, or fully open — the content reflows each time.</p>
          </main>
        </div>
      </div>`,
  }),
};
