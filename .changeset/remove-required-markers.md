---
"@okkly/design-system": minor
---

Remove the unused required/optional marker utilities from the global styles: the `.okkly-required-marker`, `.okkly-optional-marker`, `.okkly-use-required` and `.okkly-use-optional` classes and the `--ON`/`--OFF` custom properties they set on `:root`. No component used them — fields mark themselves required through their own `__required` element — and their colors and fonts pointed at tokens that do not exist.
