/**
 * The commit convention, in one place:
 *
 *   <:gitmoji:> <type>(<scope>)?<!>?: <summary>
 *   :sparkles: feat: add a size prop to Button
 *   :bug: fix(react): stop Dialog leaking the scroll lock
 *
 * Both ends of the convention read from here — `commit.mjs` builds a message
 * from these lists, `check-commit-msg.mjs` validates one against them — so the
 * prompt can never offer something the hook would then reject.
 */

/** The `<type>` half of the header — Conventional Commits, with the hint shown in the picker. */
export const CONVENTIONAL_TYPES = [
  { name: "feat", description: "A user-facing feature" },
  { name: "fix", description: "A bug fix" },
  { name: "chore", description: "Housekeeping with no src change" },
  { name: "docs", description: "Documentation only" },
  { name: "refactor", description: "Behaviour-preserving rework" },
  { name: "test", description: "Tests only" },
  { name: "perf", description: "A performance improvement" },
  { name: "build", description: "Build system, bundling, packaging" },
  { name: "ci", description: "CI config and workflows" },
  { name: "style", description: "Formatting, whitespace, no logic" },
  { name: "revert", description: "Reverts a previous commit" },
];

/** Official gitmoji, in gitmoji.dev order — https://gitmoji.dev */
export const GITMOJIS = [
  { code: "art", emoji: "🎨", description: "Improve structure / format of the code" },
  { code: "zap", emoji: "⚡️", description: "Improve performance" },
  { code: "fire", emoji: "🔥", description: "Remove code or files" },
  { code: "bug", emoji: "🐛", description: "Fix a bug" },
  { code: "ambulance", emoji: "🚑️", description: "Critical hotfix" },
  { code: "sparkles", emoji: "✨", description: "Introduce new features" },
  { code: "memo", emoji: "📝", description: "Add or update documentation" },
  { code: "rocket", emoji: "🚀", description: "Deploy stuff" },
  { code: "lipstick", emoji: "💄", description: "Add or update the UI and style files" },
  { code: "tada", emoji: "🎉", description: "Begin a project" },
  { code: "white_check_mark", emoji: "✅", description: "Add, update, or pass tests" },
  { code: "lock", emoji: "🔒️", description: "Fix security or privacy issues" },
  { code: "closed_lock_with_key", emoji: "🔐", description: "Add or update secrets" },
  { code: "bookmark", emoji: "🔖", description: "Release / version tags" },
  { code: "rotating_light", emoji: "🚨", description: "Fix compiler / linter warnings" },
  { code: "construction", emoji: "🚧", description: "Work in progress" },
  { code: "green_heart", emoji: "💚", description: "Fix CI build" },
  { code: "arrow_down", emoji: "⬇️", description: "Downgrade dependencies" },
  { code: "arrow_up", emoji: "⬆️", description: "Upgrade dependencies" },
  { code: "pushpin", emoji: "📌", description: "Pin dependencies to specific versions" },
  { code: "construction_worker", emoji: "👷", description: "Add or update CI build system" },
  {
    code: "chart_with_upwards_trend",
    emoji: "📈",
    description: "Add or update analytics or track code",
  },
  { code: "recycle", emoji: "♻️", description: "Refactor code" },
  { code: "heavy_plus_sign", emoji: "➕", description: "Add a dependency" },
  { code: "heavy_minus_sign", emoji: "➖", description: "Remove a dependency" },
  { code: "wrench", emoji: "🔧", description: "Add or update configuration files" },
  { code: "hammer", emoji: "🔨", description: "Add or update development scripts" },
  {
    code: "globe_with_meridians",
    emoji: "🌐",
    description: "Internationalization and localization",
  },
  { code: "pencil2", emoji: "✏️", description: "Fix typos" },
  { code: "poop", emoji: "💩", description: "Write bad code that needs to be improved" },
  { code: "rewind", emoji: "⏪️", description: "Revert changes" },
  { code: "twisted_rightwards_arrows", emoji: "🔀", description: "Merge branches" },
  { code: "package", emoji: "📦️", description: "Add or update compiled files or packages" },
  { code: "alien", emoji: "👽️", description: "Update code due to external API changes" },
  { code: "truck", emoji: "🚚", description: "Move or rename resources (files, paths, routes)" },
  { code: "page_facing_up", emoji: "📄", description: "Add or update license" },
  { code: "boom", emoji: "💥", description: "Introduce breaking changes" },
  { code: "bento", emoji: "🍱", description: "Add or update assets" },
  { code: "wheelchair", emoji: "♿️", description: "Improve accessibility" },
  { code: "bulb", emoji: "💡", description: "Add or update comments in source code" },
  { code: "beers", emoji: "🍻", description: "Write code drunkenly" },
  { code: "speech_balloon", emoji: "💬", description: "Add or update text and literals" },
  { code: "card_file_box", emoji: "🗃️", description: "Perform database related changes" },
  { code: "loud_sound", emoji: "🔊", description: "Add or update logs" },
  { code: "mute", emoji: "🔇", description: "Remove logs" },
  { code: "busts_in_silhouette", emoji: "👥", description: "Add or update contributor(s)" },
  { code: "children_crossing", emoji: "🚸", description: "Improve user experience / usability" },
  { code: "building_construction", emoji: "🏗️", description: "Make architectural changes" },
  { code: "iphone", emoji: "📱", description: "Work on responsive design" },
  { code: "clown_face", emoji: "🤡", description: "Mock things" },
  { code: "egg", emoji: "🥚", description: "Add or update an easter egg" },
  { code: "see_no_evil", emoji: "🙈", description: "Add or update a .gitignore file" },
  { code: "camera_flash", emoji: "📸", description: "Add or update snapshots" },
  { code: "alembic", emoji: "⚗️", description: "Perform experiments" },
  { code: "mag", emoji: "🔍️", description: "Improve SEO" },
  { code: "label", emoji: "🏷️", description: "Add or update types" },
  { code: "seedling", emoji: "🌱", description: "Add or update seed files" },
  {
    code: "triangular_flag_on_post",
    emoji: "🚩",
    description: "Add, update, or remove feature flags",
  },
  { code: "goal_net", emoji: "🥅", description: "Catch errors" },
  { code: "dizzy", emoji: "💫", description: "Add or update animations and transitions" },
  { code: "wastebasket", emoji: "🗑️", description: "Deprecate code that needs to be cleaned up" },
  {
    code: "passport_control",
    emoji: "🛂",
    description: "Work on code related to authorization, roles and permissions",
  },
  { code: "adhesive_bandage", emoji: "🩹", description: "Simple fix for a non-critical issue" },
  { code: "monocle_face", emoji: "🧐", description: "Data exploration / inspection" },
  { code: "coffin", emoji: "⚰️", description: "Remove dead code" },
  { code: "test_tube", emoji: "🧪", description: "Add a failing test" },
  { code: "necktie", emoji: "👔", description: "Add or update business logic" },
  { code: "stethoscope", emoji: "🩺", description: "Add or update healthcheck" },
  { code: "bricks", emoji: "🧱", description: "Infrastructure related changes" },
  { code: "technologist", emoji: "🧑‍💻", description: "Improve developer experience" },
  {
    code: "money_with_wings",
    emoji: "💸",
    description: "Add sponsorships or money related infrastructure",
  },
  {
    code: "thread",
    emoji: "🧵",
    description: "Add or update code related to multithreading or concurrency",
  },
  { code: "safety_vest", emoji: "🦺", description: "Add or update code related to validation" },
];

const TYPE_NAMES = CONVENTIONAL_TYPES.map((type) => type.name);
const GITMOJI_CODES = new Set(GITMOJIS.map((gitmoji) => gitmoji.code));

/** Subjects longer than this get truncated in `git log --oneline` and PR lists. */
export const MAX_SUBJECT_LENGTH = 100;

/**
 * Commits git itself (or an autosquash rebase) writes for you. They have their
 * own fixed shape, so the convention does not apply.
 */
const SKIP_PREFIXES = ["Merge ", "Revert ", "fixup! ", "squash! ", "amend! "];

export function isExemptSubject(subject) {
  return SKIP_PREFIXES.some((prefix) => subject.startsWith(prefix));
}

/** The first non-empty, non-comment line of a raw commit message. */
export function subjectOf(message) {
  return message.split(/\r?\n/).find((line) => line.trim() !== "" && !line.startsWith("#")) ?? "";
}

/** Every rule the subject breaks, in reading order. Empty means it is valid. */
export function validateSubject(subject) {
  const errors = [];
  const gitmojiMatch = subject.match(/^:([a-z0-9_+-]+): (.+)$/);

  if (gitmojiMatch) {
    const [, code, rest] = gitmojiMatch;
    if (!GITMOJI_CODES.has(code)) {
      errors.push(`":${code}:" is not an official gitmoji — see https://gitmoji.dev.`);
    }
    const header = rest.match(/^([a-z]+)(\([^)]+\))?(!)?: .+/);
    if (!header) {
      errors.push(
        'After the gitmoji, use a Conventional Commits header: "<type>(<scope>)?: <summary>".',
      );
    } else if (!TYPE_NAMES.includes(header[1])) {
      errors.push(`"${header[1]}" is not an allowed type (${TYPE_NAMES.join(", ")}).`);
    }
  } else {
    errors.push('Must start with a gitmoji shortcode, e.g. ":sparkles: feat: ...".');
  }

  if (subject.length > MAX_SUBJECT_LENGTH) {
    errors.push(`Subject is ${subject.length} chars; keep it \u2264 ${MAX_SUBJECT_LENGTH}.`);
  }

  return errors;
}
