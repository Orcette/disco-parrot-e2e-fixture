import { defineConfig } from "@playwright/test";

export default defineConfig({ testDir: ".", testMatch: "*.spec.mjs", retries: 0, workers: 1,
  reporter: [["json", { outputFile: "rule-a-report.json" }]],
  use: { channel: "chrome", headless: true, trace: "off", screenshot: "on", video: "on" } });
