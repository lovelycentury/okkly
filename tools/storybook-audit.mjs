#!/usr/bin/env node
// oxlint-disable no-console
/**
 * Drives a running Storybook workbench through Chromium and reports what the
 * stories do wrong.
 *
 * Usage:
 *   node tools/storybook-audit.mjs <package> [options]
 *
 * Options:
 *   --out=DIR           where screenshots and the report go (default: a temp dir)
 *   --filter=REGEX      only stories whose id/title/name matches
 *   --stories=a,b,c     only these exact story ids
 *   --max-stories=N     stop after N stories
 *   --concurrency=N     parallel pages in the one browser (default 4)
 *   --no-screenshots    skip the image pass
 *   --no-a11y           skip the axe pass
 *   --no-interactions   skip hover/focus/active/click/Escape
 *   --headed            watch it run
  --fail-on-error     exit 1 when any story produced an error (for CI)
 *
 * The four passes are deliberately separate: a console error tells you the
 * story is broken, axe tells you it is unusable, the interaction pass tells you
 * it is dead, and the screenshot tells you it is ugly — and only the last one
 * needs a pair of eyes on it, which is why every shot's path lands in the
 * report for the agent to open.
 *
 * Each run owns its own Chromium process, so several of these can run at once —
 * one per package — without fighting over a shared browser.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const argv = process.argv.slice(2);
const pkg = argv.find((arg) => !arg.startsWith("--"));
const flag = (name, fallback) => {
  const hit = argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const off = (name) => argv.includes(`--no-${name}`);

if (!pkg) {
  console.error("Usage: node tools/storybook-audit.mjs <package> [--out=DIR] [--filter=REGEX] …");
  process.exit(1);
}

const pkgDir = path.join(rootDir, "packages", pkg);
if (!existsSync(pkgDir)) {
  console.error(`error: no package at packages/${pkg}`);
  process.exit(1);
}

// Playwright and axe are the package's own devDependencies, not the root's, so
// they are resolved from the package being audited.
const require = createRequire(path.join(pkgDir, "package.json"));
const { chromium } = require("@playwright/test");
const AxeBuilder =
  require("@axe-core/playwright").default ?? require("@axe-core/playwright").AxeBuilder;

const pkgJson = JSON.parse(await readFile(path.join(pkgDir, "package.json"), "utf8"));
const port = Number(pkgJson.scripts?.storybook?.match(/-p\s+(\d+)/)?.[1]);
if (!port) {
  console.error(`error: cannot read a port out of ${pkg}'s storybook script`);
  process.exit(1);
}

const base = `http://127.0.0.1:${port}`;
const outDir = path.resolve(flag("out", path.join(os.tmpdir(), "okkly-storybook-audit", pkg)));
const shotDir = path.join(outDir, "screenshots");
const concurrency = Number(flag("concurrency", 4));
const wantShots = !off("screenshots");
const wantA11y = !off("a11y");
const wantInteractions = !off("interactions");

/**
 * Console noise every Vite/Storybook dev server produces. Filtered so that a
 * report with zero findings actually means zero findings — a report nobody
 * trusts is a report nobody reads.
 */
const CONSOLE_NOISE = [
  /Download the React DevTools/i,
  /\[vite\]/i,
  /React Router Future Flag/i,
  /Lit is in dev mode/i,
  /webpack-dev-server/i,
  /storybook.*telemetry/i,
  /^Addon controls?:/i,
];

/** Rules that only make sense on a whole page, not on a story iframe. */
const PAGE_ONLY_A11Y_RULES = [
  "region",
  "page-has-heading-one",
  "landmark-one-main",
  "landmark-unique",
  "html-has-lang",
  "bypass",
  "document-title",
];

const INTERACTIVE = [
  "button:not([disabled])",
  '[role="button"]:not([aria-disabled="true"])',
  "a[href]",
  "input:not([type=hidden]):not([type=file]):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  "summary",
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="menuitem"]',
  '[role="option"]',
].join(", ");

const OVERLAY = [
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="tooltip"]',
  "[data-okkly-portal]",
  ".okkly-popover",
  ".okkly-modal",
  ".okkly-dialog",
].join(", ");

const slug = (id) => id.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

async function fetchIndex() {
  let res;
  try {
    res = await fetch(`${base}/index.json`, { signal: AbortSignal.timeout(15_000) });
  } catch {
    // The caller's job is to bring the workbench up; say so rather than dying on a stack trace.
    console.error(
      `error: nothing is answering on ${base}.\n` +
        `       Start it first: node tools/storybook-ensure.mjs ${pkg}`,
    );
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`error: ${base}/index.json returned ${res.status} — is that really a Storybook?`);
    process.exit(1);
  }
  return Object.values((await res.json()).entries ?? {}).filter((e) => e.type === "story");
}

/**
 * Clip to the component, not to the canvas. Every preview here sets
 * `layout: "fullscreen"` and wraps the story in a full-bleed decorator, so
 * `#storybook-root`'s own box is always 1280×800 — useless as a frame. The
 * union of the story's own elements is the actual subject; anything covering
 * most of the viewport is a wrapper and sits the vote out.
 */
const MIN_SHOT = { width: 200, height: 120 };

async function contentBounds(page) {
  return page
    .evaluate(() => {
      const root = document.querySelector("#storybook-root");
      if (!root) return null;
      const viewportArea = window.innerWidth * window.innerHeight;
      const REPLACED = /^(svg|img|input|canvas|video|textarea|select|iframe)$/;
      /**
       * An element counts only if it paints: a flex wrapper stretched across the
       * canvas would otherwise decide the frame, and the component would end up a
       * speck inside it.
       */
      const paints = (el, style) => {
        if (REPLACED.test(el.tagName.toLowerCase())) return true;
        if (
          style.backgroundColor &&
          !/^rgba\(0, 0, 0, 0\)$|^transparent$/.test(style.backgroundColor)
        )
          return true;
        if (style.backgroundImage !== "none") return true;
        if (style.boxShadow !== "none") return true;
        if (
          ["Top", "Right", "Bottom", "Left"].some((s) => parseFloat(style[`border${s}Width`]) > 0)
        )
          return true;
        return [...el.childNodes].some(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
        );
      };
      let left = Infinity,
        top = Infinity,
        right = -Infinity,
        bottom = -Infinity,
        found = false;
      for (const el of root.querySelectorAll("*")) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (rect.width * rect.height > viewportArea * 0.8) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0")
          continue;
        if (!paints(el, style)) continue;
        found = true;
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }
      return found ? { x: left, y: top, width: right - left, height: bottom - top } : null;
    })
    .catch(() => null);
}

async function capture(page, { full = false } = {}) {
  if (!full) {
    const box = await contentBounds(page);
    if (box) {
      const pad = 16;
      // Grow a tiny component to a legible frame before clamping to the viewport.
      const width = Math.max(box.width + pad * 2, MIN_SHOT.width);
      const height = Math.max(box.height + pad * 2, MIN_SHOT.height);
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      const clip = {
        x: Math.round(Math.max(0, Math.min(cx - width / 2, 1280 - width))),
        y: Math.round(Math.max(0, Math.min(cy - height / 2, 800 - height))),
        width: Math.round(Math.min(width, 1280)),
        height: Math.round(Math.min(height, 800)),
      };
      if (clip.width > 0 && clip.height > 0) return page.screenshot({ clip });
    }
  }
  return page.screenshot();
}

/**
 * The bytes are the point: identical PNGs before and after an interaction are
 * how this tells "the control has no hover state" from "the control has one".
 * Comparing the target's own computed styles cannot see that, because in this
 * design system the visible change usually lands on a sibling — a checkbox's
 * `__box` reacts while the transparent `<input>` on top of it does not. It also
 * means a state shot is only worth keeping when it differs, so saving is the
 * caller's decision rather than part of taking the picture.
 */
async function save(buffer, file) {
  if (!wantShots) return null;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buffer);
  return path.relative(outDir, file);
}

/**
 * Chromium keeps a sequential-focus starting point, so a Tab issued after a
 * click resumes from whatever was clicked rather than from the top of the
 * document. Parking focus on `<body>` puts it back at the start.
 */
async function resetFocus(page) {
  await page
    .evaluate(() => {
      document.activeElement?.blur?.();
      document.body.setAttribute("tabindex", "-1");
      document.body.focus();
      document.body.removeAttribute("tabindex");
    })
    .catch(() => {});
}

async function auditStory(context, entry) {
  const findings = [];
  const shots = [];
  const add = (severity, kind, detail) => findings.push({ severity, kind, detail });

  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  // A story that opens a file picker or an alert must not hang the run.
  page.on("filechooser", (chooser) => chooser.setFiles([]).catch(() => {}));
  page.on("dialog", (dialog) => dialog.dismiss().catch(() => {}));

  page.on("console", (msg) => {
    const type = msg.type();
    if (type !== "error" && type !== "warning") return;
    const text = msg.text();
    if (CONSOLE_NOISE.some((re) => re.test(text))) return;
    add(type === "error" ? "error" : "warn", `console.${type}`, text.slice(0, 500));
  });
  page.on("pageerror", (error) =>
    add("error", "pageerror", String(error.message ?? error).slice(0, 500)),
  );
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "";
    if (/ERR_ABORTED/.test(failure)) return; // HMR teardown, not a broken asset
    add(
      "error",
      "requestfailed",
      `${request.method()} ${request.url().slice(0, 200)} — ${failure}`,
    );
  });

  const started = Date.now();
  try {
    const url = `${base}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=story`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Rendered, or failed loudly — either way, stop waiting.
    await page
      .waitForFunction(
        () => {
          const root = document.querySelector("#storybook-root");
          return (
            document.querySelector("#error-message, .sb-show-errordisplay") !== null ||
            Boolean(root && root.children.length > 0)
          );
        },
        { timeout: 20_000 },
      )
      .catch(() => add("error", "render-timeout", "#storybook-root stayed empty for 20s"));

    const sbError = await page.evaluate(
      () => document.querySelector("#error-message")?.textContent?.trim() ?? null,
    );
    if (sbError) add("error", "storybook-error", sbError.slice(0, 500));

    await page.evaluate(() => document.fonts?.ready).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
    await page.waitForTimeout(120);

    const rootEmpty = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root");
      if (!root) return true;
      const hasText = (root.innerText ?? "").trim().length > 0;
      const hasGraphics = root.querySelectorAll("svg, img, canvas, input, video").length > 0;
      return !hasText && !hasGraphics;
    });
    if (rootEmpty && !sbError) add("warn", "empty-render", "story rendered nothing visible");

    const baseShot = await capture(page);
    const baseRel = await save(baseShot, path.join(shotDir, `${slug(entry.id)}.png`));
    if (baseRel) shots.push(baseRel);

    if (wantA11y) {
      try {
        const { violations } = await new AxeBuilder({ page })
          .include("#storybook-root")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .disableRules(PAGE_ONLY_A11Y_RULES)
          .analyze();
        for (const v of violations) {
          add(
            v.impact === "critical" || v.impact === "serious" ? "error" : "warn",
            `a11y:${v.id}`,
            `${v.help} (${v.impact}, ${v.nodes.length}×) — ${v.nodes[0]?.target?.join(" ") ?? ""}`,
          );
        }
      } catch (error) {
        add("warn", "a11y-failed", String(error.message ?? error).slice(0, 200));
      }
    }

    if (wantInteractions) {
      const controls = page.locator(`#storybook-root :is(${INTERACTIVE})`);
      const count = await controls.count();
      const target = controls.first();
      const shotPath = (suffix) => path.join(shotDir, `${slug(entry.id)}--${suffix}.png`);
      /** Keeps a state shot only when it shows something the base shot does not. */
      const keepIfDifferent = async (buffer, reference, suffix, warning) => {
        if (buffer.equals(reference)) {
          add("warn", `no-${suffix}-feedback`, warning);
          return false;
        }
        const rel = await save(buffer, shotPath(suffix));
        if (rel) shots.push(rel);
        return true;
      };

      if (count > 0 && (await target.isVisible().catch(() => false))) {
        // Keyboard goes first, while nothing has been clicked yet — see resetFocus.
        await resetFocus(page);
        await page.keyboard.press("Tab");
        await page.waitForTimeout(180);
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          return {
            tag: el.tagName.toLowerCase(),
            inRoot: Boolean(document.querySelector("#storybook-root")?.contains(el)),
          };
        });
        if (!focused?.inRoot) {
          add("warn", "not-focusable", "Tab never reaches a control inside the story");
        } else {
          const shot = await capture(page);
          if (shot.equals(baseShot)) {
            add("warn", "no-focus-ring", `<${focused.tag}> looks identical focused and unfocused`);
          } else {
            const rel = await save(shot, shotPath("focus"));
            if (rel) shots.push(rel);
          }
        }
        await resetFocus(page);
        await page.waitForTimeout(120);

        // Hover.
        await target.hover({ timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(220);
        const hoverShot = await capture(page);
        await keepIfDifferent(
          hoverShot,
          baseShot,
          "hover",
          "the story looks identical with the pointer over its first control",
        );

        // Pressed, photographed between mousedown and mouseup.
        const box = await target.boundingBox().catch(() => null);
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.waitForTimeout(160);
          const activeShot = await capture(page);
          await page.mouse.up();
          await page.waitForTimeout(160);
          await keepIfDifferent(
            activeShot,
            hoverShot,
            "active",
            "the story looks identical while the control is held down",
          );
        }

        // That mouseup was the click. Did it open something, and does Escape close it?
        const overlays = page.locator(OVERLAY);
        await page.waitForTimeout(250);
        if ((await overlays.count()) > 0) {
          const openRel = await save(await capture(page, { full: true }), shotPath("open"));
          if (openRel) shots.push(openRel);
          await page.keyboard.press("Escape");
          await page.waitForTimeout(350);
          if ((await overlays.count()) > 0) {
            add("warn", "escape-ignored", "the overlay opened by a click did not close on Escape");
          }
        }
      } else if (count === 0) {
        findings.push({
          severity: "info",
          kind: "static",
          detail: "no interactive elements — interaction pass skipped",
        });
      }
    }
  } catch (error) {
    add(
      "error",
      "crashed",
      String(error.message ?? error)
        .split("\n")[0]
        .slice(0, 300),
    );
  } finally {
    await page.close().catch(() => {});
  }

  return {
    id: entry.id,
    title: entry.title,
    name: entry.name,
    ms: Date.now() - started,
    findings,
    screenshots: shots,
  };
}

const entries = await fetchIndex();
const filterRe = flag("filter") ? new RegExp(flag("filter"), "i") : null;
const only = flag("stories")
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

let stories = entries
  .filter((e) => !only || only.includes(e.id))
  .filter(
    (e) => !filterRe || filterRe.test(e.id) || filterRe.test(e.title) || filterRe.test(e.name),
  );
if (flag("max-stories")) stories = stories.slice(0, Number(flag("max-stories")));

if (stories.length === 0) {
  console.error(`error: no stories matched (workbench has ${entries.length})`);
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

/**
 * Each package pins its own Playwright, so the browser one package downloaded is
 * not necessarily the build another package's version wants. The packages' own
 * `test:playwright` scripts install it before every run for the same reason;
 * doing it here on demand keeps that detail out of the caller's way.
 */
async function launchChromium() {
  const options = { headless: !argv.includes("--headed") };
  try {
    return await chromium.launch(options);
  } catch (error) {
    if (!/install/i.test(String(error.message ?? error))) throw error;
    console.error(`Chromium for ${pkg}'s Playwright is missing — downloading it once…`);
    await new Promise((resolve, reject) => {
      const install = spawn("pnpm", ["exec", "playwright", "install", "chromium"], {
        cwd: pkgDir,
        stdio: "inherit",
      });
      install.on("error", reject);
      install.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error(`playwright install exited ${code}`)),
      );
    });
    return chromium.launch(options);
  }
}

const browser = await launchChromium();
const results = [];
const queue = [...stories];

await Promise.all(
  Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: "en-US",
      timezoneId: "Europe/Berlin",
      reducedMotion: "reduce",
    });
    for (let entry = queue.shift(); entry; entry = queue.shift()) {
      const result = await auditStory(context, entry);
      results.push(result);
      const errors = result.findings.filter((f) => f.severity === "error").length;
      const warns = result.findings.filter((f) => f.severity === "warn").length;
      const tally = errors || warns ? `  ${errors} error(s), ${warns} warning(s)` : "";
      console.log(
        `${errors ? "✗" : warns ? "!" : "✓"} [${results.length}/${stories.length}] ${result.id}${tally}`,
      );
    }
    await context.close();
  }),
);
await browser.close();

results.sort((a, b) => a.id.localeCompare(b.id));

const count = (severity) =>
  results.reduce((n, r) => n + r.findings.filter((f) => f.severity === severity).length, 0);
const summary = {
  package: `@okkly/${pkg}`,
  url: base,
  stories: results.length,
  errors: count("error"),
  warnings: count("warn"),
  passes: [
    "console",
    wantA11y && "a11y",
    wantInteractions && "interactions",
    wantShots && "screenshots",
  ].filter(Boolean),
  generatedAt: new Date().toISOString(),
};

await writeFile(path.join(outDir, "report.json"), JSON.stringify({ summary, results }, null, 2));

const md = [
  `# Storybook audit — @okkly/${pkg}`,
  "",
  `${summary.stories} stories · **${summary.errors} errors** · ${summary.warnings} warnings · ${base}`,
  `Passes: ${summary.passes.join(", ")}. Screenshots in \`${path.relative(outDir, shotDir)}/\`.`,
  "",
];
const flagged = results.filter((r) => r.findings.some((f) => f.severity !== "info"));
if (flagged.length === 0) {
  md.push(
    "No console errors, a11y violations or interaction problems. Screenshots still need eyes.",
  );
} else {
  for (const r of flagged) {
    md.push(`## ${r.title} › ${r.name}`, "", `\`${r.id}\``, "");
    for (const f of r.findings) {
      if (f.severity === "info") continue;
      md.push(`- **${f.severity === "error" ? "ERROR" : "warn"}** \`${f.kind}\` — ${f.detail}`);
    }
    if (r.screenshots.length)
      md.push("", `Screenshots: ${r.screenshots.map((s) => `\`${s}\``).join(", ")}`);
    md.push("");
  }
}
// One line per story, not one per file: a package with 300 stories would
// otherwise bury the findings under a thousand paths.
md.push(
  "",
  "## Every story",
  "",
  `File names below are relative to \`${path.relative(outDir, shotDir)}/\`.`,
  "",
);
for (const r of results) {
  const shots =
    r.screenshots.map((s) => `\`${path.basename(s)}\``).join(", ") || "_no screenshots_";
  const errors = r.findings.filter((f) => f.severity === "error").length;
  const warns = r.findings.filter((f) => f.severity === "warn").length;
  const mark = errors ? `**${errors}E**` : warns ? `${warns}W` : "clean";
  md.push(`- ${mark} · ${r.title} › ${r.name} — ${shots}`);
}
await writeFile(path.join(outDir, "report.md"), `${md.join("\n")}\n`);

console.log(
  `\n@okkly/${pkg}: ${summary.stories} stories, ${summary.errors} error(s), ${summary.warnings} warning(s)
report: ${path.join(outDir, "report.md")}`,
);
process.exit(argv.includes("--fail-on-error") && summary.errors > 0 ? 1 : 0);
