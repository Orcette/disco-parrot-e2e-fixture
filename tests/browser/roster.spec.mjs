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

test("an empty roster shows an explanatory message and no member rows", async ({ page }) => {
  await page.route("/api/members", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ members: [] }),
  }));

  await page.goto("/");

  const table = page.getByRole("table", { name: "Team members" });
  await expect(page.getByText("No members yet")).toBeVisible();
  await expect(table.locator("tbody tr[data-member-id]")).toHaveCount(0);
});
