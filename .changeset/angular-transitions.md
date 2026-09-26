---
"@okkly/angular": minor
---

Add the MUI-style transitions of `@okkly/react`: `OkklyFade`, `OkklyGrow`, `OkklyZoom` and `OkklySlide` as structural directives on the element they animate (`*okklyFade="open; timeout: 300; unmountOnExit: true"`), and `OkklyCollapse` (`okkly-collapse`) as a component with an `okklyCollapseContent` template for lazy content. All share `appear`, `timeout`, `easing`, `mountOnEnter`, `unmountOnExit` and the six lifecycle phases as outputs.
