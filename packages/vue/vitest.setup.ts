import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach } from "vitest";

// `globals: false` means Test Utils can't auto-detect `afterEach` off
// globalThis — register the unmount hook explicitly so mounted components
// don't leak between tests in the same file.
enableAutoUnmount(afterEach);
