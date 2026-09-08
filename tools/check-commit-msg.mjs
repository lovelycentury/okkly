#!/usr/bin/env node
// oxlint-disable no-console
/**
 * commit-msg hook: enforce the project commit convention.
 *
 *   <:gitmoji:> <type>(<scope>)?<!>?: <summary>
 *   :sparkles: feat: add a size prop to Button
 *   :bug: fix(react): stop Dialog leaking the scroll lock
 *
 * The rules and the lists they check against live in `commit-convention.mjs`,
 * shared with `commit.mjs` — this file only finds the subject and reports.
 *
 * Skipped: merge commits, reverts, and `fixup!` / `squash!` / `amend!`
 * autosquash commits. The changesets bot needs no exemption — its commit and
 * PR title are spelled ":bookmark: chore: version packages" in
 * `.github/workflows/release.yml`, which passes the rules.
 *
 * simple-git-hooks invokes this as `node tools/check-commit-msg.mjs $1`, where
 * `$1` is the path to the commit message file; when no path is passed it falls
 * back to `git rev-parse --git-path COMMIT_EDITMSG`.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

import { isExemptSubject, subjectOf, validateSubject } from "./commit-convention.mjs";

function resolveMessagePath() {
  if (process.argv[2]) return process.argv[2];
  return execFileSync("git", ["rev-parse", "--git-path", "COMMIT_EDITMSG"], {
    encoding: "utf8",
  }).trim();
}

const subject = subjectOf(readFileSync(resolveMessagePath(), "utf8"));

if (isExemptSubject(subject)) {
  process.exit(0);
}

const errors = validateSubject(subject);

if (errors.length > 0) {
  console.error("✗ commit message rejected:\n");
  console.error(`  ${subject || "(empty subject)"}\n`);
  for (const error of errors) console.error(`  • ${error}`);
  console.error("\n  Run `pnpm commit` for a guided prompt.\n");
  process.exit(1);
}
