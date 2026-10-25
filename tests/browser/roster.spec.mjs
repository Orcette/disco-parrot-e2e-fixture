import { expect, test } from "./fixtures.mjs";

test("the roster lists the seeded members", async ({ page }) => {
  await page.goto("/");
  const rows = page.getByRole("table", { name: "Team members" }).locator("tbody tr");
  await expect(rows).toHaveCount(3);
  await expect(rows.first()).toContainText("Ada Lovelace");
});

test("the roster shows an empty state when there are no members", async ({ page }) => {
  await page.route("**/api/members", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ members: [] }),
  }));
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("No team members yet.");
  await expect(page.getByRole("table", { name: "Team members" }).locator("tbody tr")).toHaveCount(0);
});

test("the roster reports a failed load instead of showing an empty table", async ({ page }) => {
  await page.route("**/api/members", (route) => route.fulfill({ status: 503 }));
  await page.goto("/");
  await expect(page.locator("#roster-error")).toHaveText("Team members could not be loaded. Please try again.");
  await expect(page.getByRole("table", { name: "Team members" }).locator("tbody tr")).toHaveCount(0);
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
  const adaRow = table.getByRole("row", { name: /Ada Lovelace/ });
  await expect(adaRow).toBeVisible();
  await adaRow.getByRole("button", { name: "Remove" }).click();

  const dialog = page.getByRole("dialog", { name: "Remove Ada Lovelace?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirm" }).click();
  await expect(dialog).toBeHidden();
  await expect(table.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);

  const graceRow = table.getByRole("row", { name: /Grace Hopper/ });
  await graceRow.getByRole("button", { name: "Remove" }).click();
  const graceDialog = page.getByRole("dialog", { name: "Remove Grace Hopper?" });
  await expect(graceDialog).toBeVisible();
  await graceDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(graceDialog).toBeHidden();
  await expect(graceRow).toBeVisible();
});

test("removing an unknown member id returns not found", async ({ page }) => {
  await page.goto("/");
  const response = await page.request.delete("/api/members/not-a-member");
  expect(response.status()).toBe(404);
  await expect(response.json()).resolves.toEqual({ error: "not_found" });
});
