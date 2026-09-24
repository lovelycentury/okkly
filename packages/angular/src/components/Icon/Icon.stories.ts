import { Component, computed, signal } from "@angular/core";
import { iconHeart, iconSearch, iconStar } from "@okkly/icons";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { ICON_NAMES, OkklyIcon } from "./Icon";
import type { IconColor, IconName, IconSize } from "./Icon";

/** Every input the Playground binds. */
type IconArgs = {
  name: IconName | undefined;
  icon: string | undefined;
  color: IconColor;
  fontSize: IconSize;
  titleAccess: string | undefined;
};

const bindings = `[name]="name" [icon]="icon" [color]="color" [fontSize]="fontSize" [titleAccess]="titleAccess"`;

/** Drives the `Picker` story: a filter over every name, and the one last clicked. */
@Component({
  selector: "okkly-icon-picker-demo",
  imports: [OkklyIcon],
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 34rem">
      <div style="display: flex; align-items: center; gap: 0.75rem">
        <okkly-icon [icon]="searchIcon" fontSize="small" />
        <input
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          placeholder="Filter icons…"
          style="flex: 1; padding: 0.5rem 0.75rem"
        />
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
        @for (name of matches(); track name) {
          <button
            type="button"
            [title]="name"
            (click)="selected.set(name)"
            style="display: grid; place-items: center; width: 2.5rem; height: 2.5rem; cursor: pointer"
          >
            <okkly-icon [name]="name" [color]="name === selected() ? 'primary' : 'inherit'" />
          </button>
        }
      </div>
      <code>&lt;okkly-icon name="{{ selected() }}" /&gt;</code>
    </div>
  `,
})
class IconPickerDemo {
  protected readonly searchIcon = iconSearch;
  protected readonly query = signal("");
  protected readonly selected = signal<IconName>("iconSearch");
  protected readonly matches = computed(() =>
    ICON_NAMES.filter((name) => name.toLowerCase().includes(this.query().toLowerCase())).slice(
      0,
      48,
    ),
  );
}

/**
 * Renders any glyph from `@okkly/icons`. Pick one by `name` for autocomplete over the
 * whole set, or hand it markup you already imported via `icon` — when both are set,
 * `icon` wins.
 *
 * The icon paints with `currentColor`, so inside a Button, a link, or a Typography block
 * it simply inherits the text colour; reach for `color` only when it should stand apart.
 */
const meta: Meta<IconArgs> = {
  title: "Data/Icon",
  component: OkklyIcon,
  decorators: [moduleMetadata({ imports: [OkklyIcon, IconPickerDemo] })],
  args: {
    name: "iconStar",
    icon: undefined,
    color: "inherit",
    fontSize: "medium",
    titleAccess: undefined,
  },
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    icon: { control: false },
    color: {
      control: "select",
      options: [
        "inherit",
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
        "muted",
      ],
    },
    fontSize: { control: "inline-radio", options: ["small", "medium", "large", "inherit"] },
    titleAccess: { control: "text" },
  },
  render: (args) => ({ props: args, template: `<okkly-icon ${bindings} />` }),
};
export default meta;

type Story = StoryObj<IconArgs>;

/**
 * This example shows the default state: medium size, inheriting the text colour,
 * and hidden from assistive tech as decoration.
 */
export const Default: Story = {};

/**
 * Passing markup directly keeps the bundle to the one icon you imported — the
 * preferred form in application code.
 */
export const FromImportedMarkup: Story = {
  args: { name: undefined, icon: iconHeart },
};

/**
 * `fontSize` matches IconButton's glyph scale, so the two line up side by side.
 * `"inherit"` tracks the surrounding font size instead.
 */
export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 1.5rem">
        <okkly-icon [name]="name" [icon]="icon" fontSize="small" />
        <okkly-icon [name]="name" [icon]="icon" fontSize="medium" />
        <okkly-icon [name]="name" [icon]="icon" fontSize="large" />
        <span style="font-size: 2.5rem"><okkly-icon [name]="name" [icon]="icon" fontSize="inherit" /></span>
      </div>`,
  }),
};

/**
 * Accent and feedback tones. The default, `"inherit"`, is the one to reach for
 * most of the time.
 */
export const Colors: Story = {
  render: (args) => ({
    props: {
      ...args,
      colors: [
        "inherit",
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
        "muted",
      ],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1.25rem">
        @for (color of colors; track color) {
          <okkly-icon [name]="name" [icon]="icon" [color]="color" [titleAccess]="color" />
        }
      </div>`,
  }),
};

/**
 * With `titleAccess` the icon is exposed as an image with a name. Use it whenever
 * the glyph is the only thing carrying the meaning.
 */
export const WithLabel: Story = {
  args: { name: "iconSearch", titleAccess: "Search" },
};

/**
 * A live picker over the full set — the same union TypeScript autocompletes at
 * the call site.
 */
export const Picker: Story = {
  render: () => ({ template: `<okkly-icon-picker-demo />` }),
};

/**
 * Inline with text the icon inherits both colour and — with `fontSize="inherit"` —
 * the surrounding size.
 */
export const InlineWithText: Story = {
  render: () => ({
    props: { star: iconStar },
    template: `
      <p style="max-width: 30rem">
        Starred items <okkly-icon [icon]="star" fontSize="inherit" /> stay pinned to the top of the list.
      </p>`,
  }),
};
