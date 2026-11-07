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

test("a failed save is retried once and succeeds", async ({ page }) => {
  let attempts = 0;
  await page.route("/api/members", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    attempts += 1;
    if (attempts === 1) return route.fulfill({ status: 503, body: "unavailable" });
    return route.continue();
  });

  await page.goto("/");
  const form = page.getByRole("form", { name: "Add member" });
  await form.getByLabel("Name").fill("Katherine Johnson");
  await form.getByRole("button", { name: "Add member" }).click();

  await expect(page.getByRole("row", { name: /Katherine Johnson/ })).toBeVisible();
  await expect(page.getByRole("alert")).toBeEmpty();
  expect(attempts).toBe(2);
});

test("a save error is reported after one retry", async ({ page }) => {
  let attempts = 0;
  await page.route("/api/members", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    attempts += 1;
    await route.fulfill({ status: 503, body: "unavailable" });
  });

  await page.goto("/");
  const form = page.getByRole("form", { name: "Add member" });
  await form.getByLabel("Name").fill("Katherine Johnson");
  await form.getByRole("button", { name: "Add member" }).click();

  await expect(page.getByRole("alert")).toHaveText("Could not save the member. Please try again.");
  await expect(page.getByRole("row", { name: /Katherine Johnson/ })).toHaveCount(0);
  expect(attempts).toBe(2);
});
