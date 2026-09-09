// JIT-compiles anything the Angular transform did not reach — the published
// bundle is AOT, so this import exists only for the test runner.
import "@angular/compiler";
import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { afterEach, beforeAll, beforeEach } from "vitest";

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
});

// No zone.js in this package: the library is zoneless-safe and the tests drive
// change detection explicitly through `fixture.detectChanges()`. The testing
// module is reset after every test, so the provider has to be re-declared here.
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
});

afterEach(() => TestBed.resetTestingModule());
