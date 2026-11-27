import { expect, test } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

test("Rule A heading with recording @disco:tc-14fc9937", async ({ page }) => {
  await page.goto(pathToFileURL(path.join(import.meta.dirname, "b", "index.html")).href);
  await expect(page.getByRole("heading", { name: "Rule A heading with recording" })).toBeVisible();
});
