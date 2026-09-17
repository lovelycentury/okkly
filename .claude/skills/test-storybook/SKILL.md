---
name: test-storybook
description: Test components in the live Storybook workbenches with Playwright — pick any mix of react, vue, svelte and angular, and a storybook-tester subagent per group renders every story in Chromium, collects console and page errors, runs axe, drives hover/focus/active/click, and reviews the screenshots. Use when asked to test, audit, smoke-check or visually review components in Storybook, across one package or several at once.
argument-hint: <packages: react|vue|svelte|angular|all> [component or area to focus on]
---

# Test components in Storybook

Run `$ARGUMENTS` through the live workbenches and report what is broken.

## 1. Read the request

Two things come out of `$ARGUMENTS`:

- **Which packages.** Accept them written any way — `vue react`, `react/vue/svelte`, `all` (every framework package: react, vue, svelte, angular). Only `react`, `vue`, `svelte` and `angular` have workbenches. If no package was named, ask which ones before doing anything else; do not guess.
- **What to focus on**, if anything — a component name, a category, "the ones I just changed". A component name becomes the audit's `--filter`; "the ones I just changed" means reading `git diff --name-only main...HEAD` first and filtering to those components.

## 2. Bring the workbenches up yourself

One call, before any subagent starts:

```bash
node tools/storybook-ensure.mjs <packages...>
```

Do this from here rather than leaving it to the subagents — they would otherwise all reach for the same port in the same second. The script is safe either way (it reuses a running workbench, waits on one that is mid-boot, and only starts a free port), but doing it once up front means nothing has to race at all.

Expect it to be slow on a cold start — a couple of minutes per package, up to ten for Angular, which regenerates Compodoc metadata first. Tell the user what is booting and what was already up; `--json` gives you `status: "reused" | "started"` per package. If one fails, carry on with the rest and say which one did not come up.

Leave every workbench running when the run ends. `node tools/storybook-ensure.mjs --stop <pkg>` exists, only ever stops servers this tool started, and is for when the user asks.

## 3. Split the packages across subagents

Spawn `storybook-tester` subagents with the Agent tool — **all of them in a single message**, so they run at once.

- **Default: one agent per package.** Four packages, four agents; each has its own Chromium and they do not interfere.
- **One agent for all of them when the request names a single component** (`/test-storybook react vue svelte Button`). One agent that has seen all four Buttons can say the Vue one's focus ring is 1px thinner than React's; four agents each holding one screenshot cannot.
- **Group packages** when the user asks for fewer agents. An agent takes its packages one at a time.

Each agent's prompt states, explicitly:

- Its packages, and that they are its alone.
- Its output directory — a separate one per package under this session's scratchpad, e.g. `<scratchpad>/storybook/<pkg>`.
- The focus, as the exact `--filter` regex or `--stories` list to pass, or that it is auditing the whole package.
- That the workbenches are already up, and that it must call `node tools/storybook-ensure.mjs <pkg>` anyway to confirm rather than starting anything itself.
- That its final message is the only thing that reaches anyone.

## 4. Report

A subagent's report is not shown to the user — relay it. Merge them into one answer:

- The verdict first: how many stories, how many errors, across which packages.
- Findings worst first, grouped by package. A finding that shows up in every package is a design-system problem, not four component problems — say so once.
- Where the screenshots and reports are, so the user can open them.
- Which workbenches you started and which were already running, and that they are still up.

Never present a pending agent's results as if they had arrived. If one is still running when the user asks, say so.
