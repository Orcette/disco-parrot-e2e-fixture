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

test("a failed removal keeps the confirmation open and reports an error", async ({ page }) => {
  await page.route("**/api/members/1", (route) => {
    if (route.request().method() === "DELETE") return route.fulfill({ status: 500, json: { error: "internal" } });
    return route.continue();
  });
  await page.goto("/");
  const row = page.getByRole("row", { name: /Ada Lovelace/ });
  await row.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove Ada Lovelace?" });
  await dialog.getByRole("button", { name: "Confirm removal" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("alert")).toHaveText("The member could not be removed. Please try again.");
  await expect(row).toBeVisible();
});

test("a person can cancel and then confirm removing Ada Lovelace", async ({ page }) => {
  await page.goto("/");
  const row = page.getByRole("row", { name: /Ada Lovelace/ });
  await row.getByRole("button", { name: "Remove" }).click();

  const dialog = page.getByRole("dialog", { name: "Remove Ada Lovelace?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: "Remove" }).click();
  await expect(dialog).toBeVisible();
  const deleted = page.waitForResponse((response) =>
    response.url().endsWith("/api/members/1") && response.request().method() === "DELETE",
  );
  await dialog.getByRole("button", { name: "Confirm removal" }).click();
  expect((await deleted).status()).toBe(204);
  await expect(dialog).toBeHidden();
  await expect(row).toHaveCount(0);
});

test("deleting an unknown member returns 404", async ({ request }) => {
  const response = await request.delete("/api/members/unknown-id");
  expect(response.status()).toBe(404);
});

test("an empty roster has an accessible empty state", async ({ page }) => {
  await page.route("**/api/members", (route) => route.fulfill({ json: { members: [] } }));
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("No team members yet.");
});

test("the roster shows a loading state while members are being fetched", async ({ page }) => {
  await page.route("**/api/members", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.fulfill({ json: { members: [] } });
  });
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.getByRole("status")).toHaveText("Loading roster…");
  await expect(page.getByRole("status")).toHaveText("No team members yet.");
});

test("a failed roster request is shown as an error", async ({ page }) => {
  await page.route("**/api/members", (route) => route.fulfill({ status: 500, json: { error: "internal" } }));
  await page.goto("/");
  await expect(page.locator("#roster-status")).toHaveText("The roster could not be loaded. Please try again.");
});
