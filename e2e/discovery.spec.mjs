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

test("offer provider and category links keep discovery navigable", async ({ page }) => {
  await page.goto("/offers");

  const brandLink = page.getByRole("link", { name: "GitHub", exact: true }).first();
  await expect(brandLink).toHaveAttribute("href", "/brands/github");

  const categoryLink = page.getByRole("link", { name: "Công cụ lập trình", exact: true }).first();
  await expect(categoryLink).toHaveAttribute("href", "/offers?category=developer-tools");

  await categoryLink.click();
  await expect(page).toHaveURL(/\/offers\?category=developer-tools$/);
  await expect(page.getByRole("link", { name: "Bỏ Danh mục: Công cụ lập trình" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub Student Developer Pack" }).first(),
  ).toBeVisible();
});

test("active filters can be removed without losing the remaining discovery state", async ({ page }) => {
  await page.goto("/offers?q=GitHub&category=developer-tools&audience=student");

  const removeCategory = page.getByRole("link", { name: "Bỏ Danh mục: Công cụ lập trình" });
  await expect(removeCategory).toHaveAttribute(
    "href",
    "/offers?q=GitHub&audience=student",
  );

  await removeCategory.click();
  await expect(page).toHaveURL(/\/offers\?q=GitHub&audience=student$/);
  await expect(page.getByRole("link", { name: "Bỏ Từ khóa: GitHub" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bỏ Đối tượng: Sinh viên" })).toBeVisible();
});

test("offer provider links to its canonical brand page", async ({ page }) => {
  await page.goto("/brands/github");
  await expect(page.getByRole("heading", { name: "GitHub", exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub Student Developer Pack" }).first(),
  ).toBeVisible();
});

test("unknown brand renders branded not-found state", async ({ page }) => {
  await page.goto("/brands/__missing_brand__");
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Về trang chủ" })).toBeVisible();
});
