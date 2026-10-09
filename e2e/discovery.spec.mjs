import { expect, test } from "@playwright/test";

test("search route returns published offers and links to advanced filters", async ({ page }) => {
  await page.goto("/search?q=GitHub");

  await expect(page.getByRole("heading", { name: "Tìm ưu đãi" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub Student Developer Pack" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Mở bộ lọc nâng cao" })).toHaveAttribute(
    "href",
    "/offers?q=GitHub",
  );
});

test("offer provider links to its canonical brand page", async ({ page }) => {
  await page.goto("/offers");

  const brandLink = page.getByRole("link", { name: "GitHub", exact: true }).first();
  await expect(brandLink).toHaveAttribute("href", "/brands/github");

  await page.goto("/brands/github");
  await expect(page.getByRole("heading", { name: "GitHub" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub Student Developer Pack" }).first(),
  ).toBeVisible();
});

test("unknown brand renders branded not-found state", async ({ page }) => {
  await page.goto("/brands/__missing_brand__");
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Về trang chủ" })).toBeVisible();
});
