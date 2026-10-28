import { expect, test } from "./fixtures.mjs";

test("the roster lists the seeded members", async ({ page }) => {
  await page.goto("/");
  const rows = page.getByRole("table", { name: "Team members" }).locator("tbody tr");
  await expect(rows).toHaveCount(3);
  await expect(rows.first()).toContainText("Ada Lovelace");
});

test("the roster exposes loading, empty, and fetch-error states", async ({ page }) => {
  let finishLoading;
  const loading = new Promise((resolve) => { finishLoading = resolve; });
  await page.route("**/api/members", async (route) => {
    await loading;
    await route.fulfill({ status: 200, json: { members: [] } });
  });
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("Loading team members…");
  finishLoading();
  await expect(page.getByRole("status")).toHaveText("No team members yet.");

  await page.unroute("**/api/members");
  await page.route("**/api/members", (route) => route.fulfill({ status: 500 }));
  await page.reload();
  await expect(page.locator("#roster-error")).toHaveText("Team members could not be loaded. Please try again.");
  await expect(page.getByRole("status")).toBeEmpty();
});

test("a person adds a member from the form", async ({ page }) => {
  await page.goto("/");
  const form = page.getByRole("form", { name: "Add member" });
  await form.getByLabel("Name").fill("Katherine Johnson");
  await form.getByLabel("Role").fill("Analyst");
  await form.getByRole("button", { name: "Add member" }).click();
  await expect(page.getByRole("row", { name: /Katherine Johnson/ })).toBeVisible();
});

test("a person can cancel and confirm removing a roster member", async ({ page }) => {
  await page.goto("/");
  let deleteRequests = 0;
  page.on("request", (request) => {
    if (request.method() === "DELETE") deleteRequests += 1;
  });
  const table = page.getByRole("table", { name: "Team members" });
  const ada = table.getByRole("row", { name: /Ada Lovelace/ });
  await expect(ada).toBeVisible();

  await ada.getByRole("button", { name: /^Remove/ }).click();
  const dialog = page.getByRole("dialog", { name: "Remove member" });
  await expect(dialog).toContainText("Ada Lovelace");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(ada).toBeVisible();
  expect(deleteRequests).toBe(0);

  await ada.getByRole("button", { name: /^Remove/ }).click();
  await page.getByRole("dialog", { name: "Remove member" })
    .getByRole("button", { name: "Confirm removal" }).click();
  await expect(page.getByRole("dialog", { name: "Remove member" })).toBeHidden();
  await expect(ada).toHaveCount(0);
  expect(deleteRequests).toBe(1);
});

test("a failed removal leaves the row visible and reports an error", async ({ page }) => {
  await page.goto("/");
  const grace = page.getByRole("row", { name: /Grace Hopper/ });
  await page.route("**/api/members/2", (route) => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ error: "internal" }),
  }));

  const dialog = page.getByRole("dialog", { name: "Remove member" });
  await grace.getByRole("button", { name: /^Remove/ }).click();
  await dialog.getByRole("button", { name: "Confirm removal" }).click();
  await expect(grace).toBeVisible();
  await expect(dialog.getByRole("alert")).toContainText("could not be removed");
});

test("DELETE removes a member and returns 404 for an unknown id", async ({ request }) => {
  const removed = await request.delete("/api/members/2");
  expect(removed.status()).toBe(204);
  const remaining = await request.get("/api/members");
  expect((await remaining.json()).members.map(({ name }) => name)).not.toContain("Grace Hopper");

  const unknown = await request.delete("/api/members/999");
  expect(unknown.status()).toBe(404);
  expect(await unknown.json()).toEqual({ error: "not_found" });
});
