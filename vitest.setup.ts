import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom doesn't implement scrolling; browsers do. (Node-environment tests have no Element.)
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView ??= function scrollIntoView() {};
}

afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia; components query it for responsive defaults (phone layout here).
if (typeof window !== "undefined") {
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
