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

test("cancelling removal keeps Grace Hopper in the roster", async ({ page }) => {
  await page.goto("/");
  const row = page.getByRole("row", { name: /Grace Hopper/ });
  await row.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove Grace Hopper?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(row).toBeVisible();
});

test("confirming removal deletes Ada Lovelace", async ({ page }) => {
  await page.goto("/");
  const row = page.getByRole("row", { name: /Ada Lovelace/ });
  await row.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove Ada Lovelace?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirm removal" }).click();
  await expect(dialog).toBeHidden();
  await expect(row).toHaveCount(0);
});

test("the page communicates loading, empty, and request-error states", async ({ page }) => {
  let releaseRequest;
  const requestReleased = new Promise((resolve) => { releaseRequest = resolve; });
  await page.route("/api/members", async (route) => {
    await requestReleased;
    await route.fulfill({ json: { members: [] } });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("status")).toHaveText("Loading roster…");
  releaseRequest();
  await expect(page.getByText("No team members yet.")).toBeVisible();

  await page.unroute("/api/members");
  await page.route("/api/members", (route) => route.fulfill({ status: 500, json: { error: "internal" } }));
  await page.reload();
  await expect(page.locator("#roster-error")).toHaveText("The roster could not be loaded. Please try again.");
});

test("deleting an unknown member returns not found", async ({ page }) => {
  await page.goto("/");
  const response = await page.evaluate(async () => {
    const result = await fetch("/api/members/unknown-id", { method: "DELETE" });
    return { status: result.status, body: await result.json() };
  });
  expect(response).toEqual({ status: 404, body: { error: "not_found" } });
});
