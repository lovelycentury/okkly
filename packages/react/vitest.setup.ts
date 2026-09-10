// The component suite runs in a real browser through Playwright, so nothing is
// rendered here any more. What is left for Vitest are the pure helpers in
// `src/helpers`, a couple of which touch the DOM — hence the jsdom environment
// in vitest.config.ts — but none of which mount a component.
export {};
