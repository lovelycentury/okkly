# @okkly/prima-react

React music and audio components for the Okryshto design system — parametric
equalizers, reverbs and other effect controls.

```bash
pnpm add @okkly/prima-react react react-dom
```

```tsx
import { useEffect, useState } from "react";
import {
  ParametricEQ,
  PARAMETRIC_EQ_PRESETS,
  useParametricEQ,
  type EQBand,
} from "@okkly/prima-react";
import "@okkly/design-system/styles/index.scss"; // design tokens, once per app
import "@okkly/prima-react/style.css";

export function Channel({ context, source }: { context: AudioContext; source: AudioNode }) {
  const [bands, setBands] = useState<EQBand[]>(PARAMETRIC_EQ_PRESETS.vocal.bands);
  const eq = useParametricEQ({ context, bands });

  useEffect(() => {
    if (!eq.input || !eq.output) return;
    source.connect(eq.input);
    eq.output.connect(context.destination);
  }, [eq.input, eq.output]);

  return <ParametricEQ title="Vocal" bands={bands} onBandsChange={setBands} meter={eq} />;
}
```

## Components

- **`ParametricEQ`** — frequency-response graph with draggable band nodes over a
  live spectrum, filter-type picker, FREQ/GAIN/BW knobs, mute/solo and an output
  meter. Drag a node for frequency and gain, scroll over it for Q, double-click
  the graph to add a band, press Delete to remove one. Controlled through
  `bands` / `onBandsChange`; the UI needs no audio.
- **`useParametricEQ`** — runs the bands through a chain of `BiquadFilterNode`s
  and returns `input`/`output` nodes plus the spectrum and level readings the
  component's `meter` prop draws. Shelves follow Web Audio and ignore Q.
- **`PARAMETRIC_EQ_PRESETS`** — Reference, Vocal, Kick, Smiley, Telephone,
  De-mud, Resonant and Flat.
- **`Knob`** — rotary control (linear or log), drag, keyboard and double-click reset.

## Workbench

Storybook lives in this package. Stories sit next to their component as
`*.stories.tsx` and render from `src`, so a change shows up without rebuilding.

```bash
pnpm storybook prima-react                        # from the repo root, on :6010
pnpm --filter @okkly/prima-react storybook:build  # static build → storybook-static/
```

Stories never ship: `files` publishes only `dist`, and `tsconfig.build.json`
excludes `*.stories.*`.

## Tests

```bash
pnpm --filter @okkly/prima-react test   # vitest
```
