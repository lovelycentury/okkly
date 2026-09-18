#!/usr/bin/env node
// oxlint-disable no-console
/**
 * Usage:
 *   node tools/storybook-ensure.mjs <package...>           start, or reuse, each workbench
 *   node tools/storybook-ensure.mjs --status <package...>  report without starting anything
 *   node tools/storybook-ensure.mjs --stop <package...>    stop only the ones this tool started
 *
 * Idempotent on purpose. Several agents may ask for the same workbench in the
 * same second, and none of them may end up with a second `storybook dev` on an
 * occupied port, so the decision is made from the port itself rather than from
 * anything a caller remembers:
 *
 *   1. `/index.json` already answers  -> reuse, whoever started it.
 *   2. the port is taken but silent   -> somebody else is mid-boot; wait for it.
 *   3. the port is free               -> take the lock, boot it, record ownership.
 *
 * Ownership is what makes `--stop` safe: a server that was already running when
 * we arrived is never killed, because the developer is probably using it.
 *
 * Packages are handled in parallel — booting four workbenches one after another
 * would cost four boots' worth of wall time for no reason.
 */
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync, mkdirSync, openSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stateDir = path.join(os.tmpdir(), "okkly-storybook");

/** Angular regenerates Compodoc metadata before Storybook starts, so boots are slow. */
const BOOT_TIMEOUT_MS = Number(process.env.OKKLY_SB_BOOT_TIMEOUT_MS ?? 600_000);
const POLL_MS = 1_000;
/** A lock older than this belongs to a crashed starter, not a live one. */
const LOCK_STALE_MS = BOOT_TIMEOUT_MS + 60_000;

const argv = process.argv.slice(2);
const mode = argv.includes("--stop") ? "stop" : argv.includes("--status") ? "status" : "ensure";
const asJson = argv.includes("--json");
const packages = argv.filter((arg) => !arg.startsWith("--"));

if (packages.length === 0) {
  console.error(
    "Usage: node tools/storybook-ensure.mjs [--status|--stop] [--json] <package...>\n" +
      "       e.g. node tools/storybook-ensure.mjs react vue svelte",
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The port is not configuration we keep in a second place — it is read back out
 * of the package's own `storybook` script, so the two can never drift.
 */
async function portFor(pkg) {
  const pkgJsonPath = path.join(rootDir, "packages", pkg, "package.json");
  if (!existsSync(pkgJsonPath)) throw new Error(`no package at packages/${pkg}`);
  const script = JSON.parse(await readFile(pkgJsonPath, "utf8")).scripts?.storybook;
  if (!script) throw new Error(`@okkly/${pkg} has no "storybook" script`);
  const port = script.match(/-p\s+(\d+)/)?.[1];
  if (!port) throw new Error(`cannot read a port out of ${pkg}'s storybook script: ${script}`);
  return Number(port);
}

/** Ready means Storybook answers with its story index — not merely that the port is bound. */
async function indexReady(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/index.json`, {
      signal: AbortSignal.timeout(3_000),
    });
    if (!res.ok) return false;
    return Boolean((await res.json())?.entries);
  } catch {
    return false;
  }
}

function portBound(port) {
  return new Promise((resolve) => {
    const socket = net
      .connect({ port, host: "127.0.0.1" })
      .on("connect", () => (socket.destroy(), resolve(true)))
      .on("error", () => resolve(false))
      .setTimeout(1_000, () => (socket.destroy(), resolve(false)));
  });
}

async function waitForIndex(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await indexReady(port)) return true;
    await sleep(POLL_MS);
  }
  return false;
}

const statePath = (pkg) => path.join(stateDir, `${pkg}.json`);
const logPath = (pkg) => path.join(stateDir, `${pkg}.log`);

async function readState(pkg) {
  try {
    return JSON.parse(await readFile(statePath(pkg), "utf8"));
  } catch {
    return null;
  }
}

async function tailLog(pkg, lines = 25) {
  try {
    return (await readFile(logPath(pkg), "utf8")).split("\n").slice(-lines).join("\n");
  } catch {
    return "";
  }
}

/**
 * `mkdir` is the lock: on every POSIX filesystem it either creates the
 * directory or fails, atomically, which is exactly the "only one of us starts
 * the server" guarantee — no read-then-write window for a second agent to slip
 * through.
 */
async function acquireLock(pkg) {
  const lock = path.join(stateDir, `${pkg}.lock`);
  try {
    await mkdir(lock);
    return lock;
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const age = Date.now() - (await stat(lock).catch(() => ({ mtimeMs: Date.now() }))).mtimeMs;
    if (age <= LOCK_STALE_MS) return null;
    await rm(lock, { recursive: true, force: true });
    return acquireLock(pkg);
  }
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function ensure(pkg) {
  const port = await portFor(pkg);
  const url = `http://127.0.0.1:${port}`;

  if (await indexReady(port)) {
    const state = await readState(pkg);
    // Don't clobber an ownership record: a workbench this tool booted earlier is
    // still ours to stop, even though this call found it already up.
    if (!state?.owned) {
      await writeFile(statePath(pkg), JSON.stringify({ pkg, port, owned: false }, null, 2));
    }
    return { pkg, port, url, status: "reused", owned: Boolean(state?.owned) };
  }

  if (mode === "status") return { pkg, port, url, status: "down", owned: false };

  const lock = await acquireLock(pkg);

  if (!lock) {
    // Another starter got there first. Wait on its server rather than racing it.
    const ready = await waitForIndex(port, BOOT_TIMEOUT_MS);
    if (!ready) throw new Error(`${pkg}: another process holds the start lock but never came up`);
    return { pkg, port, url, status: "reused", owned: false };
  }

  try {
    if (await portBound(port)) {
      // Bound but mute: either a Storybook still compiling, or a stranger.
      const ready = await waitForIndex(port, BOOT_TIMEOUT_MS);
      if (!ready)
        throw new Error(`${pkg}: port ${port} is taken by something that is not Storybook`);
      return { pkg, port, url, status: "reused", owned: false };
    }

    const log = logPath(pkg);
    const fd = openSync(log, "a");
    // Detached, so the server outlives the shell that asked for it — an agent's
    // Bash call returns in seconds, the workbench has to stay up for the run.
    const child = spawn(process.execPath, [path.join(rootDir, "tools", "storybook.mjs"), pkg], {
      cwd: rootDir,
      detached: true,
      stdio: ["ignore", fd, fd],
    });
    child.unref();

    const ready = await waitForIndex(port, BOOT_TIMEOUT_MS);
    if (!ready) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        /* already gone */
      }
      throw new Error(`${pkg}: Storybook did not come up on ${port}\n${await tailLog(pkg)}`);
    }

    // The port answering is not proof that *we* are the one answering. Our child
    // can lose a race for the port, or die on a build error, while somebody
    // else's server satisfies the probe — and claiming ownership then would put
    // a stranger's workbench on the list of things `--stop` may kill.
    if (!isAlive(child.pid)) {
      await writeFile(statePath(pkg), JSON.stringify({ pkg, port, owned: false }, null, 2));
      return { pkg, port, url, status: "reused", owned: false };
    }

    const state = {
      pkg,
      port,
      owned: true,
      pid: child.pid,
      log,
      startedAt: new Date().toISOString(),
    };
    await writeFile(statePath(pkg), JSON.stringify(state, null, 2));
    return { pkg, port, url, status: "started", owned: true, pid: child.pid, log };
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}

/** The pid of whatever currently holds the port, or null. */
function listenerPid(port) {
  return new Promise((resolve) => {
    const lsof = spawn("lsof", ["-t", `-iTCP:${port}`, "-sTCP:LISTEN"], {
      stdio: ["ignore", "pipe", "ignore"],
    });
    let out = "";
    lsof.stdout.on("data", (chunk) => (out += chunk));
    lsof.on("close", () => resolve(Number(out.trim().split("\n")[0]) || null));
    lsof.on("error", () => resolve(null));
  });
}

async function stop(pkg) {
  const port = await portFor(pkg);
  const state = await readState(pkg);

  if (!state?.owned || !state.pid) {
    return { pkg, port, status: (await indexReady(port)) ? "left-running" : "down", owned: false };
  }
  if (!isAlive(state.pid)) {
    await rm(statePath(pkg), { force: true });
    // Our process is gone but the port still answers: either an orphaned
    // grandchild of ours or a server somebody started since. There is no way to
    // tell them apart, so say so instead of killing a workbench that may be in use.
    if (await indexReady(port)) {
      return { pkg, port, status: "orphaned", owned: false, holder: await listenerPid(port) };
    }
    return { pkg, port, status: "down", owned: false };
  }

  // `tools/storybook.mjs` runs as its own group leader (spawned detached), so a
  // negative pid reaches the dependency watchers and the Vite server with it.
  try {
    process.kill(-state.pid, "SIGTERM");
  } catch {
    /* already gone */
  }
  for (let i = 0; i < 50 && isAlive(state.pid); i++) await sleep(100);
  if (isAlive(state.pid)) {
    try {
      process.kill(-state.pid, "SIGKILL");
    } catch {
      /* already gone */
    }
  }

  await rm(statePath(pkg), { force: true });
  return { pkg, port, status: "stopped", owned: true };
}

mkdirSync(stateDir, { recursive: true });

const results = await Promise.all(
  packages.map(async (pkg) => {
    try {
      return await (mode === "stop" ? stop(pkg) : ensure(pkg));
    } catch (error) {
      return { pkg, status: "error", error: error.message };
    }
  }),
);

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const r of results) {
    if (r.status === "error") console.error(`✗ ${r.pkg}: ${r.error}`);
    else
      console.log(
        `${r.status === "error" ? "✗" : "✓"} ${r.pkg.padEnd(8)} ${String(r.status).padEnd(12)} ${r.url ?? `:${r.port}`}`,
      );
  }
}

process.exit(results.some((r) => r.status === "error") ? 1 : 0);
