---
"@okkly/prima-react": minor
"@okkly/design-system": minor
---

Add `ParametricEQ`, a parametric equalizer with draggable band nodes over a live spectrum, filter-type picker, band knobs, mute/solo and an output meter; `useParametricEQ`, which runs its bands through Web Audio `BiquadFilterNode`s and feeds the spectrum and meter; `PARAMETRIC_EQ_PRESETS`; and `Knob`, a rotary control. The design system gains the `ParametricEQ` and `Knob` styles with their `--okkly-parametric-eq-*` and `--okkly-knob-*` CSS-variable APIs.
