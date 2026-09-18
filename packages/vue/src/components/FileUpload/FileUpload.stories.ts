import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onUnmounted, ref } from "vue";
import FileUpload from "./FileUpload.vue";
import type { FileUploadProps } from "./FileUpload.types";

/** `label` fills the `label` slot; everything else is a prop. */
type FileUploadArgs = FileUploadProps & { label?: string };

/**
 * Creates a stand-in file so stories can show a populated state without a file picker.
 * The `File` constructor derives `size` from its content, so it is overridden here.
 */
function sized(name: string, sizeInBytes: number, type = ""): File {
  const file = new File([new Uint8Array(1)], name, { type, lastModified: 0 });
  Object.defineProperty(file, "size", { value: sizeInBytes });
  return file;
}

/**
 * Renders the component with `label` split back out of the args, so it lands
 * in the `label` slot instead of falling through as an attribute.
 */
const render = (args: FileUploadArgs) => ({
  components: { FileUpload },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `
    <div style="width: 26rem; max-width: 100%">
      <FileUpload v-bind="props">
        <template v-if="label" #label>{{ label }}</template>
      </FileUpload>
    </div>`,
});

/**
 * Drop zone for selecting files — click or drag & drop, with per-file validation and a
 * list of the current selection.
 *
 * Files that violate a constraint are kept and marked in red instead of being dropped
 * silently, so the user can see what went wrong and remove them deliberately.
 */
const meta: Meta<FileUploadArgs> = {
  title: "Control/FileUpload",
  component: FileUpload,
  args: {
    label: "Attachments",
    accept: [".png", ".jpg", ".pdf"],
    multiple: true,
    maxSize: "10MiB",
    maxCount: 5,
    size: "large",
    listType: "list",
    fullWidth: false,
    disabled: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["large", "medium", "small"] },
    listType: { control: "inline-radio", options: ["list", "maxHeight", "button", "hidden"] },
  },
  render,
};

export default meta;
type Story = StoryObj<FileUploadArgs>;

/**
 * This example shows the default state: the large, illustrated drop zone.
 */
export const Default: Story = {};

/**
 * This example shows all three sizes. `small` is a button-like trigger and shows its
 * validation message via the native `title` attribute instead of below the icon.
 */
export const Sizes: Story = {
  render: (args) => ({
    components: { FileUpload },
    setup() {
      const { label: _label, ...props } = args;
      return { props };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 26rem">
        <FileUpload v-bind="props" size="large"><template #label>Large</template></FileUpload>
        <FileUpload v-bind="props" size="medium"><template #label>Medium</template></FileUpload>
        <FileUpload v-bind="props" size="small"><template #label>Small</template></FileUpload>
      </div>`,
  }),
};

/**
 * This example shows a single-file upload. `v-model` is a single `File` (or `null`)
 * instead of an array.
 */
export const SingleFile: Story = {
  args: { multiple: false, maxCount: undefined, accept: [".png", ".jpg"] },
};

/**
 * This example shows files that violate a constraint. They stay in the list, marked in
 * red, so the user can remove them.
 */
export const InvalidFiles: Story = {
  args: {
    defaultValue: [
      sized("quarterly-report.pdf", 2 * 1024 * 1024, "application/pdf"),
      sized("raw-scan.tiff", 4 * 1024 * 1024, "image/tiff"),
      sized("backup.zip", 64 * 1024 * 1024, "application/zip"),
    ],
    showError: true,
  },
};

/**
 * This example shows a required upload. The message appears once the user has
 * interacted with the control, and the underlying input reports it to the form.
 */
export const Required: Story = {
  args: { required: true, showError: true, defaultValue: [] },
};

/**
 * This example shows the four list types. `maxHeight` scrolls after
 * `--okkly-file-upload-max-files` rows, `button` toggles the list and `hidden` leaves
 * the rendering to you.
 */
export const ListTypes: Story = {
  args: {
    listType: "maxHeight",
    defaultValue: [
      sized("contract.pdf", 240 * 1024, "application/pdf"),
      sized("photo-01.png", 1.4 * 1024 * 1024, "image/png"),
      sized("photo-02.png", 980 * 1024, "image/png"),
      sized("notes.txt", 12 * 1024, "text/plain"),
      sized("demo.mp4", 6 * 1024 * 1024, "video/mp4"),
    ],
    maxCount: 10,
  },
};

/**
 * This example shows a live upload: `getFileStatus` drives the status text and the
 * progress bar of each row.
 */
export const UploadProgress: Story = {
  render: (args) => ({
    components: { FileUpload },
    setup() {
      const { label: _label, ...props } = args;
      const progress = ref(0);
      const files = ref<File[]>([
        sized("keynote.pdf", 3.2 * 1024 * 1024, "application/pdf"),
        sized("cover.png", 820 * 1024, "image/png"),
      ]);
      const timer = setInterval(() => {
        progress.value = progress.value >= 100 ? 0 : progress.value + 5;
      }, 200);
      onUnmounted(() => clearInterval(timer));

      function getFileStatus() {
        return progress.value >= 100
          ? { text: "Uploaded", color: "success" as const }
          : {
              text: `Uploading… ${progress.value}%`,
              color: "primary" as const,
              progress: progress.value,
            };
      }

      return { props, files, getFileStatus };
    },
    template: `
      <div style="width: 26rem">
        <FileUpload v-bind="props" :default-value="files" :get-file-status="getFileStatus">
          <template #label>Uploading</template>
        </FileUpload>
      </div>`,
  }),
};

/**
 * This example shows a custom file row via the `file` slot, with `listType="list"` still
 * handling the layout around it.
 */
export const CustomFileRow: Story = {
  args: {
    defaultValue: [
      sized("invoice.pdf", 320 * 1024, "application/pdf"),
      sized("logo.svg", 18 * 1024, "image/svg+xml"),
    ],
  },
  render: (args) => ({
    components: { FileUpload },
    setup() {
      const { label: _label, ...props } = args;
      return { props };
    },
    template: `
      <div style="width: 26rem">
        <FileUpload v-bind="props">
          <template #file="{ file, remove }">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.5rem 0.75rem; border: 0.0625rem dashed var(--okkly-border-default); border-radius: 0.625rem; font-family: var(--okkly-font-family-mono); font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">
              <span>{{ file.name }}</span>
              <button type="button" @click="remove" style="background: none; border: 0; color: inherit; cursor: pointer">remove</button>
            </div>
          </template>
        </FileUpload>
      </div>`,
  }),
};

/**
 * This example shows controlled usage — the selection lives in the parent and is
 * rendered next to the control.
 */
export const Controlled: Story = {
  render: () => ({
    components: { FileUpload },
    setup() {
      const files = ref<File[]>([]);
      return { files };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 26rem">
        <FileUpload v-model="files" multiple max-size="5MiB">
          <template #label>Upload</template>
        </FileUpload>
        <span style="color: var(--okkly-text-muted); font-size: var(--okkly-font-size-sm)">
          {{ files.length }} file{{ files.length === 1 ? "" : "s" }} selected
        </span>
      </div>`,
  }),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
