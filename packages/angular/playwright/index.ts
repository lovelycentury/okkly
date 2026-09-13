// Mount harness for the Playwright component tests — our stand-in for the
// harness `@playwright/experimental-ct-react` provides, which Playwright does
// not ship for Angular. A test hands `window.okklyHarness.mount()` a template;
// the harness compiles it into a throwaway standalone host component that
// imports every public export of the package, and renders it into `#root`.
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
  type ApplicationRef,
  type ComponentRef,
} from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import * as okkly from "../src/index";
import type { OkklyHarness } from "../src/playwright/harness";

// Every runtime export of the package is a standalone component or directive.
const IMPORTS = Object.values(okkly);

const root = document.getElementById("root") as HTMLElement;
const application: Promise<ApplicationRef> = createApplication({
  providers: [provideZonelessChangeDetection()],
});
let mounted: ComponentRef<unknown> | undefined;

const unmount = async (): Promise<void> => {
  if (!mounted) return;
  (await application).detachView(mounted.hostView);
  mounted.destroy();
  mounted = undefined;
  root.replaceChildren();
};

const mount = async (template: string): Promise<void> => {
  await unmount();
  const appRef = await application;
  const Host = Component({ selector: "okkly-playwright-host", template, imports: IMPORTS })(
    // oxlint-disable-next-line no-extraneous-class -- `Component()` needs a class to decorate; the template is the whole host
    class {},
  );
  const hostElement = root.appendChild(document.createElement("div"));
  mounted = createComponent(Host, { environmentInjector: appRef.injector, hostElement });
  appRef.attachView(mounted.hostView);
  appRef.tick();
  await appRef.whenStable();
};

window.okklyHarness = { mount, unmount } satisfies OkklyHarness;
