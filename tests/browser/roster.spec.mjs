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

test("a person removes a member after confirming and can cancel another removal", async ({ page }) => {
  await page.goto("/");
  const table = page.getByRole("table", { name: "Team members" });
  const ada = table.getByRole("row", { name: /Ada Lovelace/ });
  await expect(ada).toBeVisible();
  await ada.getByRole("button", { name: "Remove" }).click();

  const adaDialog = page.getByRole("dialog", { name: "Remove Ada Lovelace?" });
  await expect(adaDialog).toBeVisible();
  await adaDialog.getByRole("button", { name: "Confirm" }).click();
  await expect(adaDialog).not.toBeVisible();
  await expect(table.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);
  await page.reload();
  await expect(table.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);

  const grace = table.getByRole("row", { name: /Grace Hopper/ });
  await grace.getByRole("button", { name: "Remove" }).click();
  const graceDialog = page.getByRole("dialog", { name: "Remove Grace Hopper?" });
  await expect(graceDialog).toBeVisible();
  await graceDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(graceDialog).not.toBeVisible();
  await expect(grace).toBeVisible();
});

test("removing an unknown member returns not found", async ({ request }) => {
  const response = await request.delete("/api/members/unknown-member");
  expect(response.status()).toBe(404);
});
