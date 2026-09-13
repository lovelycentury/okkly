// Mount harness for the Playwright component tests — our stand-in for the
// harness `@playwright/experimental-ct-react` provides, which Playwright does
// not ship for Angular. A test hands `window.okklyHarness.mount()` a template;
// the harness compiles it into a throwaway standalone host component that
// imports every public export of the package, and renders it into `#root`.
//
// A template reads the inputs a test changes from the host's `state` signal
// (`[size]="state().size"`), which `update()` patches, and reports outputs
// through `record()` (`(click)="record('click')"`), which `events()` reads
// back — the counterparts of React's `component.update()` and callback props.
//
// The library is AOT-compiled by the Vite Angular plugin (signal inputs and
// host directives need it — see vitest.config.ts). Only the per-test host
// component is compiled at runtime, which is what `@angular/compiler` is for.
import "@angular/compiler";
// The design tokens, then the package's own published stylesheet — the same
// two imports a consuming app makes.
import "@okkly/design-system/styles/index.scss";
import "../src/styles.scss";
import "./index.css";
import {
  Component,
  createComponent,
  provideZonelessChangeDetection,
  signal,
  type ApplicationRef,
  type ComponentRef,
} from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import * as okkly from "../src/index";
import type { HarnessEvent, HarnessState, OkklyHarness } from "../src/playwright/harness";

// Every runtime export of the package is a standalone component or directive.
const IMPORTS = Object.values(okkly);

const root = document.getElementById("root") as HTMLElement;
const application: Promise<ApplicationRef> = createApplication({
  providers: [provideZonelessChangeDetection()],
});

let events: HarnessEvent[] = [];

/** What every mounted template compiles against. */
class HarnessHost {
  /** The values the template binds to; `update()` patches it. */
  readonly state = signal<HarnessState>({});

  /** Reports an output to the test, e.g. `(valueChange)="record('valueChange', $event)"`. */
  record(name: string, value?: unknown): void {
    events.push({ name, value });
  }
}

let mounted: ComponentRef<HarnessHost> | undefined;

const render = async (): Promise<void> => {
  const appRef = await application;
  appRef.tick();
  await appRef.whenStable();
};

const unmount = async (): Promise<void> => {
  if (!mounted) return;
  (await application).detachView(mounted.hostView);
  mounted.destroy();
  mounted = undefined;
  root.replaceChildren();
};

const mount = async (template: string, state: HarnessState = {}): Promise<void> => {
  await unmount();
  events = [];
  const appRef = await application;
  // A fresh subclass per template: `Component()` decorates the class it is given.
  const Host = Component({ selector: "okkly-playwright-host", template, imports: IMPORTS })(
    class extends HarnessHost {},
  );
  const hostElement = root.appendChild(document.createElement("div"));
  mounted = createComponent(Host, { environmentInjector: appRef.injector, hostElement });
  mounted.instance.state.set(state);
  appRef.attachView(mounted.hostView);
  await render();
};

const update = async (patch: HarnessState): Promise<void> => {
  if (!mounted) throw new Error("Nothing is mounted.");
  mounted.instance.state.update((state) => ({ ...state, ...patch }));
  await render();
};

window.okklyHarness = { mount, unmount, update, events: () => events } satisfies OkklyHarness;
