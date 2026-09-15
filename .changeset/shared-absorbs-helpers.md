---
"@okkly/shared": minor
"@okkly/react": patch
---

`@okkly/shared` takes over `@okkly/helpers`: `bem`, `clamp`, `uniqueId` and `debounce` are exported from `@okkly/shared` with the same signatures, and `@okkly/helpers` is no longer published — import them from `@okkly/shared` instead. `uniqueId`'s default prefix is now `okkly` (it was `lokki`, from the project's former name). `@okkly/react` drops its unused dependency on `@okkly/helpers`.
