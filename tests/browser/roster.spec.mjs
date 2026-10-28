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

test("a failed removal keeps the member visible and reports an accessible error", async ({ page }) => {
  await page.goto("/");
  const adaRow = page.getByRole("row", { name: /Ada Lovelace/ });
  await expect(adaRow).toBeVisible();
  await page.route("**/api/members/1", (route) => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ error: "internal" }),
  }));

  await adaRow.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("dialog", { name: /Remove Ada Lovelace/ });
  await dialog.getByRole("button", { name: "Remove member" }).click();

  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("alert")).toHaveText(/could not remove Ada Lovelace/i);
  await expect(adaRow).toBeVisible();
});

test("an empty roster has a clear table message", async ({ page }) => {
  await page.route("**/api/members", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ members: [] }),
  }));
  await page.goto("/");

  await expect(page.getByRole("table", { name: "Team members" })).toContainText("No team members.");
});

test("a roster load failure has a clear table message", async ({ page }) => {
  await page.route("**/api/members", (route) => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ error: "internal" }),
  }));
  await page.goto("/");

  await expect(page.getByRole("table", { name: "Team members" })).toContainText("Could not load team members.");
});

test("a member is removed only after the named confirmation", async ({ page }) => {
  await page.goto("/");
  const adaRow = page.getByRole("row", { name: /Ada Lovelace/ });
  await expect(adaRow).toBeVisible();

  await adaRow.getByRole("button", { name: "Remove Ada Lovelace" }).click();
  const dialog = page.getByRole("dialog", { name: /Remove Ada Lovelace/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(adaRow).toBeVisible();

  await adaRow.getByRole("button", { name: "Remove Ada Lovelace" }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Remove member" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);
});

test("removing an unknown member returns not found", async ({ page }) => {
  await page.goto("/");
  const response = await page.request.delete("/api/members/unknown");
  expect(response.status()).toBe(404);
});
