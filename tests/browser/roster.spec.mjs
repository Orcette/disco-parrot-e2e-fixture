import { expect, test } from "./fixtures.mjs";

test.beforeEach(async ({ request }) => {
  const { members } = await (await request.get("/api/members")).json();
  if (!members.some((member) => member.name === "Ada Lovelace")) {
    await request.post("/api/members", { data: { name: "Ada Lovelace", role: "Engineer" } });
  }
});

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

test("confirming removal deletes the selected member", async ({ page }) => {
  await page.goto("/");
  const table = page.getByRole("table", { name: "Team members" });
  const ada = table.getByRole("row", { name: /Ada Lovelace/ });
  await expect(ada).toBeVisible();
  await ada.getByRole("button", { name: "Remove Ada Lovelace" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove member" });
  await expect(dialog).toContainText("Are you sure you want to remove Ada Lovelace?");
  await dialog.getByRole("button", { name: "Remove" }).click();
  await expect(dialog).toBeHidden();
  await expect(table.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);
});

test("cancelling removal keeps the selected member", async ({ page }) => {
  await page.goto("/");
  const table = page.getByRole("table", { name: "Team members" });
  const ada = table.getByRole("row", { name: /Ada Lovelace/ });
  await expect(ada).toBeVisible();
  await ada.getByRole("button", { name: "Remove Ada Lovelace" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove member" });
  await expect(dialog).toContainText("Are you sure you want to remove Ada Lovelace?");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(table.getByRole("row", { name: /Ada Lovelace/ })).toBeVisible();
});

test("removing an unknown member returns not found", async ({ request }) => {
  const response = await request.delete("/api/members/unknown-member");
  expect(response.status()).toBe(404);
  await expect(response.json()).resolves.toEqual({ error: "not_found" });
});
