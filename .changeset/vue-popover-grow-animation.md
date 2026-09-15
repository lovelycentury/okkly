---
"@okkly/vue": patch
---

Fix `Popover` opening with no animation: the paper's enter transition never ran because its `<Transition>` lacked `appear`, and the paper fully remounts on every open (rather than toggling in place), so every open was an "appear" that Vue skipped without it.
