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

test("a failed removal keeps the member and explains the error", async ({ page }) => {
  await page.goto("/");
  await page.route("**/api/members/1", (route) => route.fulfill({ status: 500, body: "{}" }));

  const table = page.getByRole("table", { name: "Team members" });
  const adaRow = table.getByRole("row", { name: /Ada Lovelace/ });
  await adaRow.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Confirm" }).click();

  await expect(dialog.getByRole("alert")).toHaveText("Unable to remove this member. Please try again.");
  await expect(dialog).toBeVisible();
  await expect(adaRow).toBeVisible();
});

test("a person confirms one removal and cancels another", async ({ page }) => {
  await page.goto("/");
  const table = page.getByRole("table", { name: "Team members" });
  await expect(table.getByRole("row", { name: /Ada Lovelace/ })).toBeVisible();
  await expect(table.getByRole("row", { name: /Grace Hopper/ })).toBeVisible();
  await expect(table.getByRole("row", { name: /Alan Turing/ })).toBeVisible();

  const adaRow = table.getByRole("row", { name: /Ada Lovelace/ });
  await adaRow.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Ada Lovelace");
  await dialog.getByRole("button", { name: "Confirm" }).click();
  await expect(dialog).toBeHidden();
  await expect(table.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);
  await expect(table.getByRole("row", { name: /Grace Hopper/ })).toBeVisible();
  await expect(table.getByRole("row", { name: /Alan Turing/ })).toBeVisible();

  const graceRow = table.getByRole("row", { name: /Grace Hopper/ });
  await graceRow.getByRole("button", { name: "Remove" }).click();
  await expect(dialog).toContainText("Grace Hopper");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(table.getByRole("row", { name: /Grace Hopper/ })).toBeVisible();

  const missing = await page.request.delete("/api/members/unknown-id");
  expect(missing.status()).toBe(404);
  await expect(missing.json()).resolves.toEqual({ error: "not_found" });
});
