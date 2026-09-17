<script setup lang="ts">
import { computed, onUnmounted, ref, useId, watch } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  iconBold,
  iconCode,
  iconHash,
  iconItalic,
  iconLink,
  iconList,
  iconMessageSquare,
  iconMinus,
  iconRefreshCw,
  iconRotateCcw,
  iconType,
  iconUnderline,
} from "@okkly/icons";
import type { Editor } from "@tiptap/core";
import "@okkly/design-system/components/RichEditor/RichEditor.scss";
import RichEditorTool from "./RichEditorTool.vue";
import type {
  RichEditorFormat,
  RichEditorProps,
  RichEditorValue,
  SaveStatus,
  SlashItem,
} from "./RichEditor.types";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// `@tiptap/core`'s own `Editor`, not `@tiptap/vue-3`'s subclass: `onUpdate`'s
// callback always hands back the base type regardless of framework, so
// typing against it here is what lets the same helper take both that
// callback's `editor` and `useEditor()`'s own (subclassed) return value.
function serialize(editor: Editor, format: RichEditorFormat): RichEditorValue {
  return format === "json" ? editor.getJSON() : editor.getHTML();
}

function valuesEqual(
  a: RichEditorValue | undefined,
  b: RichEditorValue | undefined,
  format: RichEditorFormat,
): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (format === "json") return JSON.stringify(a) === JSON.stringify(b);
  return String(a) === String(b);
}

const props = withDefaults(defineProps<RichEditorProps>(), {
  defaultValue: undefined,
  format: "html",
  toolbar: "full",
  placeholder: "Write something…",
  maxLength: undefined,
  autosave: 5000,
  slashMenu: true,
  readonly: false,
  disabled: false,
  error: false,
  fullWidth: true,
  color: "primary",
  id: undefined,
});

const slots = defineSlots<{
  /** Field label above the shell. */
  label?: () => unknown;
  /** Caption below the shell. */
  "helper-text"?: () => unknown;
}>();

const model = defineModel<RichEditorValue>();

const generatedId = useId();
const editorId = computed(() => props.id ?? generatedId);
const labelId = computed(() => `${editorId.value}-label`);
const helperId = computed(() => `${editorId.value}-helper`);

// Read once, at setup — mirrors React's mount-only `useMemo(() => …, [])`, since
// a Vue `setup()` also only runs once per instance.
const initialContent = (model.value !== undefined ? model.value : props.defaultValue) ?? "";

const saveStatus = ref<SaveStatus>("saved");
const slashQuery = ref<string | null>(null);
// Plain closure variables, not refs: neither drives a template render on its
// own, only what they gate (`saveStatus`/the sync-skip below) does.
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
let skipNextEmit = false;

const editable = computed(() => !props.readonly && !props.disabled);

function clearAutosaveTimer() {
  if (autosaveTimer != null) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
}

function markDirty() {
  if (props.autosave === false) return;
  saveStatus.value = "dirty";
  clearAutosaveTimer();
  autosaveTimer = setTimeout(() => {
    saveStatus.value = "saved";
    autosaveTimer = null;
  }, props.autosave);
}

onUnmounted(() => clearAutosaveTimer());

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2] },
      link: {
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  content: initialContent,
  editable: editable.value,
  editorProps: {
    attributes: {
      id: editorId.value,
      class: "okkly-rich-editor__prose",
      ...(slots.label ? { "aria-labelledby": labelId.value } : {}),
      ...(props.disabled ? { "aria-disabled": "true" } : {}),
    },
  },
  onUpdate: ({ editor: ed }) => {
    if (skipNextEmit) {
      skipNextEmit = false;
    } else {
      model.value = serialize(ed, props.format);
      markDirty();
    }

    if (!props.slashMenu || !ed.isEditable) {
      slashQuery.value = null;
      return;
    }

    const { $from } = ed.state.selection;
    const parent = $from.parent;
    if (!parent.isTextblock || parent.type.name !== "paragraph") {
      slashQuery.value = null;
      return;
    }
    const text = parent.textContent;
    if (text.startsWith("/") && !text.includes("\n") && $from.parentOffset === text.length) {
      slashQuery.value = text.slice(1);
    } else {
      slashQuery.value = null;
    }
  },
});

watch(editable, (next) => {
  editor.value?.setEditable(next);
});

watch(
  [editor, () => model.value],
  ([ed, value]) => {
    if (!ed || value === undefined) return;
    const current = serialize(ed, props.format);
    if (valuesEqual(value, current, props.format)) return;
    skipNextEmit = true;
    ed.commands.setContent(value ?? "", { emitUpdate: false });
  },
  { flush: "post" },
);

// Tiptap's `useEditor` seeds options once at construction — unlike React's
// props, nothing here is reactive on its own, so every dependency Tiptap's
// own `editorProps`/`setEditable` needs a manual `watch` to push through,
// same as React's own explicit `useEffect`s for the same purpose.
let bump = ref(0);
watch(
  editor,
  (ed, previous) => {
    previous?.off("transaction");
    ed?.on("transaction", () => {
      bump.value += 1;
    });
  },
  { immediate: true },
);
onUnmounted(() => editor.value?.off("transaction"));

const editorState = computed(() => {
  // Establishes the reactive dependency this computed otherwise has no way to
  // see: `editor.value`'s own internal state (marks/selection/history) is
  // mutated in place on the same shallowRef, so only re-running on this
  // transaction-driven counter — not on `editor` itself — ever recomputes it.
  void bump.value;
  const ed = editor.value;
  if (!ed) {
    return {
      wordCount: 0,
      charCount: 0,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isCode: false,
      isLink: false,
      isBullet: false,
      isOrdered: false,
      isQuote: false,
      isHeading: false,
      canUndo: false,
      canRedo: false,
    };
  }
  const text = ed.getText();
  return {
    wordCount: countWords(text),
    charCount: text.length,
    isBold: ed.isActive("bold"),
    isItalic: ed.isActive("italic"),
    isUnderline: ed.isActive("underline"),
    isCode: ed.isActive("code"),
    isLink: ed.isActive("link"),
    isBullet: ed.isActive("bulletList"),
    isOrdered: ed.isActive("orderedList"),
    isQuote: ed.isActive("blockquote"),
    isHeading: ed.isActive("heading", { level: 2 }),
    canUndo: ed.can().undo(),
    canRedo: ed.can().redo(),
  };
});

const overLimit = computed(
  () => props.maxLength != null && editorState.value.charCount > props.maxLength,
);
const showError = computed(() => props.error || overLimit.value);
const resolvedHelperFallback = computed(() =>
  overLimit.value && props.maxLength != null
    ? `Content exceeds ${props.maxLength.toLocaleString("en-US")} characters`
    : undefined,
);

watch(
  [
    editorId,
    () => slots.label,
    labelId,
    helperId,
    () => slots["helper-text"],
    () => props.disabled,
    showError,
  ],
  () => {
    const ed = editor.value;
    if (!ed) return;
    const describedBy = slots["helper-text"] || showError.value ? helperId.value : undefined;
    ed.setOptions({
      editorProps: {
        attributes: {
          id: editorId.value,
          class: "okkly-rich-editor__prose",
          ...(slots.label ? { "aria-labelledby": labelId.value } : {}),
          ...(describedBy ? { "aria-describedby": describedBy } : {}),
          ...(props.disabled ? { "aria-disabled": "true" } : {}),
          ...(showError.value ? { "aria-invalid": "true" } : {}),
        },
      },
    });
  },
  { flush: "post" },
);

function clearSlashAndRun(command: () => void) {
  const ed = editor.value;
  if (!ed) return;
  const { $from } = ed.state.selection;
  const start = $from.start();
  const text = $from.parent.textContent;
  if (text.startsWith("/")) {
    ed.chain()
      .focus()
      .deleteRange({ from: start, to: start + text.length })
      .run();
  }
  command();
  slashQuery.value = null;
}

const slashItems = computed<SlashItem[]>(() => {
  const ed = editor.value;
  if (!ed) return [];
  return [
    {
      id: "heading",
      label: "Heading 2",
      kbd: "##",
      icon: iconType,
      keywords: ["heading", "h2", "title"],
      run: () => clearSlashAndRun(() => ed.chain().focus().toggleHeading({ level: 2 }).run()),
    },
    {
      id: "bullet",
      label: "Bullet list",
      kbd: "-",
      icon: iconList,
      keywords: ["bullet", "list", "ul"],
      run: () => clearSlashAndRun(() => ed.chain().focus().toggleBulletList().run()),
    },
    {
      id: "ordered",
      label: "Numbered list",
      kbd: "1.",
      icon: iconHash,
      keywords: ["numbered", "ordered", "ol", "list"],
      run: () => clearSlashAndRun(() => ed.chain().focus().toggleOrderedList().run()),
    },
    {
      id: "quote",
      label: "Quote",
      kbd: ">",
      icon: iconMessageSquare,
      keywords: ["quote", "blockquote"],
      run: () => clearSlashAndRun(() => ed.chain().focus().toggleBlockquote().run()),
    },
    {
      id: "code",
      label: "Code block",
      kbd: "```",
      icon: iconCode,
      keywords: ["code", "pre", "block"],
      run: () => clearSlashAndRun(() => ed.chain().focus().toggleCodeBlock().run()),
    },
  ];
});

const filteredSlashItems = computed(() => {
  const query = slashQuery.value;
  if (query == null) return [];
  const q = query.toLowerCase();
  return slashItems.value.filter((item) => {
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q) || q.includes(k))
    );
  });
});

const showToolbar = computed(() => props.toolbar !== "none" && !props.readonly);
const compact = computed(() => props.toolbar === "compact");

function setLink() {
  const ed = editor.value;
  if (!ed) return;
  const previous = ed.getAttributes("link").href as string | undefined;

  const url = window.prompt("URL", previous ?? "https://");
  if (url === null) return;
  if (url === "") {
    ed.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  ed.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-rich-editor",
    props.color !== "primary" && `okkly-rich-editor--color-${props.color}`,
    !props.fullWidth && "okkly-rich-editor--not-full-width",
    showError.value && "okkly-rich-editor--error",
    props.disabled && "okkly-rich-editor--disabled",
    props.readonly && "okkly-rich-editor--readonly",
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div :class="classes">
    <label v-if="slots.label" :id="labelId" :for="editorId" class="okkly-rich-editor__label">
      <slot name="label" />
    </label>

    <div class="okkly-rich-editor__shell">
      <div
        v-if="showToolbar && editor"
        class="okkly-rich-editor__toolbar"
        role="toolbar"
        aria-label="Formatting"
      >
        <div class="okkly-rich-editor__toolbar-left">
          <template v-if="!compact">
            <RichEditorTool
              label="Heading 2"
              :icon="iconType"
              :text="editorState.isHeading ? 'Heading 2' : 'Paragraph'"
              :active="editorState.isHeading"
              :disabled="!editable"
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            />
            <span class="okkly-rich-editor__sep" aria-hidden="true" />
          </template>

          <div class="okkly-rich-editor__group">
            <RichEditorTool
              label="Bold"
              :icon="iconBold"
              :active="editorState.isBold"
              :disabled="!editable"
              @click="editor.chain().focus().toggleBold().run()"
            />
            <RichEditorTool
              label="Italic"
              :icon="iconItalic"
              :active="editorState.isItalic"
              :disabled="!editable"
              @click="editor.chain().focus().toggleItalic().run()"
            />
            <RichEditorTool
              label="Underline"
              :icon="iconUnderline"
              :active="editorState.isUnderline"
              :disabled="!editable"
              @click="editor.chain().focus().toggleUnderline().run()"
            />
            <RichEditorTool
              label="Inline code"
              :icon="iconCode"
              :active="editorState.isCode"
              :disabled="!editable"
              @click="editor.chain().focus().toggleCode().run()"
            />
          </div>

          <span class="okkly-rich-editor__sep" aria-hidden="true" />

          <div class="okkly-rich-editor__group">
            <RichEditorTool
              v-if="!compact"
              label="Link"
              :icon="iconLink"
              :active="editorState.isLink"
              :disabled="!editable"
              @click="setLink"
            />
            <RichEditorTool
              label="Bullet list"
              :icon="iconList"
              :active="editorState.isBullet"
              :disabled="!editable"
              @click="editor.chain().focus().toggleBulletList().run()"
            />
            <RichEditorTool
              label="Numbered list"
              :icon="iconHash"
              :active="editorState.isOrdered"
              :disabled="!editable"
              @click="editor.chain().focus().toggleOrderedList().run()"
            />
            <RichEditorTool
              v-if="!compact"
              label="Blockquote"
              :icon="iconMessageSquare"
              :active="editorState.isQuote"
              :disabled="!editable"
              @click="editor.chain().focus().toggleBlockquote().run()"
            />
          </div>

          <template v-if="!compact">
            <span class="okkly-rich-editor__sep" aria-hidden="true" />
            <div class="okkly-rich-editor__group">
              <RichEditorTool
                label="Horizontal rule"
                :icon="iconMinus"
                :disabled="!editable"
                @click="editor.chain().focus().setHorizontalRule().run()"
              />
            </div>
          </template>
        </div>

        <div class="okkly-rich-editor__toolbar-right">
          <RichEditorTool
            label="Undo"
            :icon="iconRotateCcw"
            :disabled="!editorState.canUndo || !editable"
            @click="editor.chain().focus().undo().run()"
          />
          <RichEditorTool
            label="Redo"
            :icon="iconRefreshCw"
            :disabled="!editorState.canRedo || !editable"
            @click="editor.chain().focus().redo().run()"
          />
        </div>
      </div>

      <div class="okkly-rich-editor__content">
        <EditorContent :editor="editor" />
        <div
          v-if="slashQuery != null && filteredSlashItems.length > 0"
          class="okkly-rich-editor__slash"
          role="listbox"
          aria-label="Insert block"
        >
          <div class="okkly-rich-editor__slash-query">
            <span class="okkly-rich-editor__slash-prefix">/</span>
            <span>{{ slashQuery || "…" }}</span>
          </div>
          <button
            v-for="item in filteredSlashItems"
            :key="item.id"
            type="button"
            role="option"
            class="okkly-rich-editor__slash-item"
            @mousedown.prevent="item.run()"
          >
            <span class="okkly-rich-editor__slash-item-main">
              <span aria-hidden="true" :title="item.label" v-html="item.icon" />
              {{ item.label }}
            </span>
            <span class="okkly-rich-editor__slash-kbd">{{ item.kbd }}</span>
          </button>
        </div>
      </div>

      <div class="okkly-rich-editor__footer">
        <span>{{ readonly ? "Read-only" : "Markdown & ⌘B ⌘I ⌘K" }}</span>
        <div class="okkly-rich-editor__footer-meta">
          <span
            >{{ editorState.wordCount }} {{ editorState.wordCount === 1 ? "word" : "words" }}</span
          >
          <span v-if="autosave !== false && !readonly" class="okkly-rich-editor__status">
            <span
              :class="[
                'okkly-rich-editor__status-dot',
                saveStatus === 'dirty' && 'okkly-rich-editor__status-dot--danger',
              ]"
              aria-hidden="true"
            />
            {{ saveStatus === "dirty" ? "Not saved" : "Saved" }}
          </span>
        </div>
      </div>
    </div>

    <span
      v-if="slots['helper-text'] || resolvedHelperFallback"
      :id="helperId"
      class="okkly-rich-editor__helper"
    >
      <slot name="helper-text">{{ resolvedHelperFallback }}</slot>
    </span>
  </div>
</template>
