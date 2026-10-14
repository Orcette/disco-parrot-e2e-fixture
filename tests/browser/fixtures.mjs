import { test as base, chromium } from "@playwright/test";

// Inside a Disco Parrot Agent Sandbox the pod's workspace browser (a Chromium
// sibling container) is reachable on loopback: its supervisor on 9224 starts
// Chrome, and Chrome serves CDP on 9222. Elsewhere, launch a local Chromium.
const SUPERVISOR = "http://127.0.0.1:9224";
const CDP = "http://127.0.0.1:9222";

async function workspaceBrowserEndpoint() {
  let status;
  try {
    status = await (await fetch(`${SUPERVISOR}/status`, { signal: AbortSignal.timeout(2_000) })).json();
  } catch {
    return undefined;
  }
  if (!status.running) {
    const started = await fetch(`${SUPERVISOR}/start`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: "team-roster-browser-tests" }),
    });
    if (!started.ok) throw new Error(`The workspace browser did not start (${started.status}): ${await started.text()}`);
  }
  return CDP;
}

export const test = base.extend({
  browser: [async ({}, use) => {
    const endpoint = await workspaceBrowserEndpoint();
    const browser = endpoint ? await chromium.connectOverCDP(endpoint) : await chromium.launch();
    await use(browser);
    await browser.close();
  }, { scope: "worker" }],
});

export { expect } from "@playwright/test";
