---
"@okkly/angular": patch
---

Fix a disabled or loading `<a okklyButton>` still firing the consumer's `(click)` handler: the click is now swallowed before it reaches listeners on the element.
