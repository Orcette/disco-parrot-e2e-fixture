import { expect, test } from "./fixtures.mjs";

test("the roster lists the seeded members", async ({ page }) => {
  await page.goto("/");
  const rows = page.getByRole("table", { name: "Team members" }).locator("tbody tr");
  await expect(rows).toHaveCount(3);
  await expect(rows.first()).toContainText("Ada Lovelace");
});

test("a person adds a member from the form", async ({ page }) => {
  await page.goto("/");
  const form = page.getByRole("form", { name: "Add member" });
  await form.getByLabel("Name").fill("Katherine Johnson");
  await form.getByLabel("Role").fill("Analyst");
  await form.getByRole("button", { name: "Add member" }).click();
  await expect(page.getByRole("row", { name: /Katherine Johnson/ })).toBeVisible();
});

test("a person can cancel and confirm removing a named member", async ({ page }) => {
  await page.goto("/");
  const table = page.getByRole("table", { name: "Team members" });
  const ada = table.getByRole("row", { name: /Ada Lovelace/ });
  await ada.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove member" });
  await expect(dialog).toContainText("Remove Ada Lovelace from the team?");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(ada).toBeVisible();

  await ada.getByRole("button", { name: "Remove" }).click();
  await expect(dialog).toContainText("Ada Lovelace");
  await dialog.getByRole("button", { name: "Remove" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(table.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);
});

test("removing an unknown member returns not_found", async ({ page }) => {
  await page.goto("/");
  const response = await page.request.delete("/api/members/999");
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({ error: "not_found" });
});
