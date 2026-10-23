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

test("a person can cancel or confirm removing a named roster member", async ({ page }) => {
  await page.goto("/");
  const ada = page.getByRole("row", { name: /Ada Lovelace/ });

  await ada.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove Ada Lovelace?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(ada).toBeVisible();

  await ada.getByRole("button", { name: "Remove" }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirm removal" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("row", { name: /Ada Lovelace/ })).toHaveCount(0);
});

test("deleting an unknown member returns not found without changing the roster", async ({ page }) => {
  const before = await page.request.get("/api/members");
  const beforeMembers = (await before.json()).members;

  const deletion = await page.request.delete("/api/members/9999");
  expect(deletion.status()).toBe(404);

  const after = await page.request.get("/api/members");
  expect((await after.json()).members.map(({ id }) => id)).toEqual(beforeMembers.map(({ id }) => id));
});
