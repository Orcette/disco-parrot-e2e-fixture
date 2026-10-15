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

test("a person removes a member only after confirming", async ({ page }) => {
  await page.goto("/");
  const ada = page.getByRole("row", { name: /Ada Lovelace/ });
  await ada.getByRole("button", { name: "Remove" }).click();

  const dialog = page.getByRole("dialog", { name: "Remove Ada Lovelace?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Remove Ada Lovelace?" })).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(ada).toBeVisible();

  await ada.getByRole("button", { name: "Remove" }).click();
  const confirmation = page.getByRole("dialog", { name: "Remove Ada Lovelace?" });
  await confirmation.getByRole("button", { name: "Remove" }).click();
  await expect(confirmation).toBeHidden();
  await expect(page.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);

  const missing = await page.request.delete("/api/members/unknown-member");
  expect(missing.status()).toBe(404);
});
