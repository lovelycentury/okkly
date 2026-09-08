#!/usr/bin/env node
// oxlint-disable no-console
/**
 * `pnpm commit` — a guided prompt for the project commit convention.
 *
 *   gitmoji → type → scope (optional) → summary → body paragraphs → confirm
 *
 * Every list it offers comes from `commit-convention.mjs`, the same module the
 * commit-msg hook validates against, so a message built here always passes the
 * hook. The composed subject is run through `validateSubject` before `git
 * commit` is called anyway — belt and braces, and it catches a summary typed
 * past the 100-char budget while it can still be retyped.
 *
 * Flags: `--breaking` marks the header with `!`, `--dry-run` prints the message
 * instead of committing, `--help` explains both.
 */
import { execFileSync, spawnSync } from "node:child_process";
import readline from "node:readline";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import {
  CONVENTIONAL_TYPES,
  GITMOJIS,
  MAX_SUBJECT_LENGTH,
  validateSubject,
} from "./commit-convention.mjs";

const DIM = "\u001B[2m";
const BOLD = "\u001B[1m";
const CYAN = "\u001B[36m";
const GREEN = "\u001B[32m";
const RED = "\u001B[31m";
const RESET = "\u001B[0m";

const PAGE_SIZE = 10;

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

/** Cut a rendered line to the terminal width so redraws stay line-accurate. */
function fit(line) {
  const width = (stdout.columns || 80) - 1;
  return line.length > width ? `${line.slice(0, width - 1)}…` : line;
}

function bail(message, code = 1) {
  console.error(`${RED}✗${RESET} ${message}`);
  process.exit(code);
}

/**
 * A filterable list. Type to narrow, ↑↓ to move, ↵ to pick — the 73 gitmoji do
 * not fit on a screen, and scrolling to "safety_vest" is slower than typing it.
 */
function select(label, items) {
  return new Promise((resolve) => {
    let filter = "";
    let index = 0;
    let printed = 0;

    const matching = () => {
      const needle = filter.toLowerCase();
      return items.filter((item) => item.search.toLowerCase().includes(needle));
    };

    const draw = () => {
      const visible = matching();
      if (index >= visible.length) index = Math.max(0, visible.length - 1);

      // Keep the cursor inside the window as it moves past either edge.
      const half = Math.floor(PAGE_SIZE / 2);
      const start = Math.max(0, Math.min(index - half, visible.length - PAGE_SIZE));
      const page = visible.slice(start, start + PAGE_SIZE);

      const head = `${CYAN}?${RESET} ${BOLD}${label}${RESET} ${DIM}${
        filter ? `filter: ${filter}` : "type to filter, ↑↓ move, ↵ select"
      }${RESET}`;

      const rows = page.map((item) => {
        const active = visible.indexOf(item) === index;
        const row = fit(`${active ? "❯" : " "} ${item.label}`);
        return active ? `${CYAN}${row}${RESET}` : row;
      });

      if (visible.length === 0) rows.push(`${DIM}  no match${RESET}`);
      const more = visible.length - (start + page.length);
      if (more > 0) rows.push(`${DIM}  … ${more} more${RESET}`);

      const out = `${[head, ...rows].join("\n")}\n`;
      if (printed > 0) {
        readline.moveCursor(stdout, 0, -printed);
        readline.cursorTo(stdout, 0);
        readline.clearScreenDown(stdout);
      }
      stdout.write(out);
      printed = out.split("\n").length - 1;
    };

    const finish = (item) => {
      stdin.off("keypress", onKey);
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
      readline.moveCursor(stdout, 0, -printed);
      readline.cursorTo(stdout, 0);
      readline.clearScreenDown(stdout);
      console.log(`${GREEN}✔${RESET} ${BOLD}${label}${RESET} ${item.label.trim()}`);
      resolve(item);
    };

    const onKey = (str, key) => {
      const visible = matching();
      if (key.ctrl && key.name === "c") {
        stdin.off("keypress", onKey);
        if (stdin.isTTY) stdin.setRawMode(false);
        console.log("\naborted");
        process.exit(130);
      } else if (key.name === "return") {
        if (visible[index]) return finish(visible[index]);
      } else if (key.name === "up" || (key.ctrl && key.name === "p")) {
        index = index > 0 ? index - 1 : Math.max(0, visible.length - 1);
      } else if (key.name === "down" || key.name === "tab" || (key.ctrl && key.name === "n")) {
        index = index < visible.length - 1 ? index + 1 : 0;
      } else if (key.name === "backspace") {
        filter = filter.slice(0, -1);
        index = 0;
      } else if (key.name === "escape") {
        filter = "";
        index = 0;
      } else if (str && !key.ctrl && !key.meta && str >= " ") {
        filter += str;
        index = 0;
      } else {
        return;
      }
      draw();
    };

    readline.emitKeypressEvents(stdin);
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.on("keypress", onKey);
    draw();
  });
}

async function ask(question, { required = false } = {}) {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    for (;;) {
      const answer = (await rl.question(`${CYAN}?${RESET} ${BOLD}${question}${RESET} `)).trim();
      if (answer || !required) return answer;
      console.log(`${DIM}  required${RESET}`);
    }
  } finally {
    rl.close();
  }
}

async function confirm(question, fallback = true) {
  const hint = fallback ? "Y/n" : "y/N";
  const answer = (await ask(`${question} ${DIM}(${hint})${RESET}`)).toLowerCase();
  if (!answer) return fallback;
  return answer.startsWith("y");
}

function stagedFiles() {
  return git(["diff", "--cached", "--name-only"]).split("\n").filter(Boolean);
}

/** Nothing staged is usually a forgotten `git add`, so offer to stage it all. */
async function ensureStaged() {
  if (stagedFiles().length > 0) return;

  const dirty = git(["status", "--porcelain"]).split("\n").filter(Boolean);
  if (dirty.length === 0) bail("nothing to commit — the working tree is clean.");

  console.log(`${DIM}Nothing staged. ${dirty.length} file(s) changed.${RESET}`);
  if (!(await confirm("Stage everything?", false))) {
    bail("nothing staged — `git add` the files you mean to commit.");
  }
  git(["add", "-A"]);
}

function helpText() {
  return `pnpm commit — build a commit message the commit-msg hook accepts.

  Flow: gitmoji → type → scope (optional) → summary → body paragraphs → confirm.
  Body paragraphs are asked for one at a time; an empty line ends the body.

  --breaking   mark the header with "!" (e.g. ":boom: feat(react)!: ...")
  --dry-run    print the message instead of committing
  --help       this text
`;
}

async function main() {
  const flags = new Set(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    console.log(helpText());
    return;
  }
  if (!stdin.isTTY) bail("pnpm commit needs an interactive terminal.");

  try {
    git(["rev-parse", "--git-dir"]);
  } catch {
    bail("not a git repository.");
  }

  await ensureStaged();
  const files = stagedFiles();
  console.log(
    `${DIM}${files.length} file(s) staged: ${files.slice(0, 3).join(", ")}${
      files.length > 3 ? ", …" : ""
    }${RESET}\n`,
  );

  const gitmoji = await select(
    "Gitmoji",
    GITMOJIS.map((item) => ({
      value: item.code,
      search: `${item.code} ${item.description}`,
      label: `${item.emoji}  ${`:${item.code}:`.padEnd(26)} ${DIM}${item.description}${RESET}`,
    })),
  );

  const type = await select(
    "Type",
    CONVENTIONAL_TYPES.map((item) => ({
      value: item.name,
      search: `${item.name} ${item.description}`,
      label: `${item.name.padEnd(10)} ${DIM}${item.description}${RESET}`,
    })),
  );

  const scope = await ask(`Scope ${DIM}(optional, ↵ to skip)${RESET}:`);
  const breaking = flags.has("--breaking") ? "!" : "";
  const prefix = `:${gitmoji.value}: ${type.value}${scope ? `(${scope})` : ""}${breaking}: `;

  let subject = "";
  for (;;) {
    const budget = MAX_SUBJECT_LENGTH - prefix.length;
    console.log(`${DIM}  ${prefix}…${RESET}`);
    const summary = await ask(`Summary ${DIM}(≤ ${budget} chars)${RESET}:`, { required: true });
    subject = prefix + summary;

    const errors = validateSubject(subject);
    if (errors.length === 0) break;
    for (const error of errors) console.log(`${RED}  • ${error}${RESET}`);
  }

  // One paragraph per answer, blank line ends the body — the same shape as the
  // `-m` flags they turn into.
  const body = [];
  console.log(`${DIM}\nBody — one paragraph per line, ↵ on an empty line to finish.${RESET}`);
  for (;;) {
    const paragraph = await ask(`Paragraph ${body.length + 1} ${DIM}(↵ to finish)${RESET}:`);
    if (!paragraph) break;
    body.push(paragraph);
  }

  const message = [subject, ...body].join("\n\n");
  console.log(`\n${DIM}────────────────────────${RESET}`);
  console.log(message);
  console.log(`${DIM}────────────────────────${RESET}\n`);

  if (flags.has("--dry-run")) return;
  if (!(await confirm("Commit?"))) bail("aborted — nothing committed.", 0);

  const args = ["commit", "-m", subject];
  for (const paragraph of body) args.push("-m", paragraph);
  const result = spawnSync("git", args, { stdio: "inherit" });
  process.exit(result.status ?? 1);
}

await main();
