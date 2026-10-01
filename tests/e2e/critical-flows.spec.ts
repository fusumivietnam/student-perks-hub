import { expect, test } from "@playwright/test";

test("home exposes primary discovery flow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /Học nhiều hơn/i }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();

  const search = page.getByLabel("Tìm ưu đãi");
  await search.fill("GitHub");
  await page.getByRole("button", { name: "Tìm kiếm" }).click();

  await expect(page).toHaveURL(/\/offers\?q=GitHub/);
  await expect(page.getByRole("heading", { level: 1, name: "Tất cả ưu đãi" })).toBeVisible();
});

test("offers keep filter state in the URL", async ({ page }) => {
  await page.goto("/offers?q=GitHub&benefit=free");

  await expect(page.getByRole("searchbox")).toHaveValue("GitHub");
  await expect(page.getByLabel("Loại quyền lợi").first()).toHaveValue("free");
  await expect(page).toHaveURL(/q=GitHub/);
  await expect(page).toHaveURL(/benefit=free/);
});

test("private saved page redirects anonymous users to login", async ({ page }) => {
  await page.goto("/saved");

  await expect(page).toHaveURL(/\/login\?next=%2Fsaved|\/login\?next=\/saved/);
  await expect(page.getByRole("heading", { level: 1, name: "Đăng nhập" })).toBeVisible();
});

test("submission and legal pages are available", async ({ page }) => {
  await page.goto("/submit");
  await expect(page.getByRole("heading", { level: 1, name: "Gửi một ưu đãi" })).toBeVisible();
  await expect(page.getByLabel("Link chính thức")).toHaveAttribute("type", "url");

  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1, name: "Quyền riêng tư" })).toBeVisible();

  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1, name: "Điều khoản sử dụng" })).toBeVisible();
});

test("keyboard users can skip directly to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Bỏ qua đến nội dung chính" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("robots and sitemap expose only public discovery surfaces", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const robotsText = await robots.text();
  expect(robotsText).toContain("Disallow: /saved");
  expect(robotsText).toContain("Disallow: /login");
  expect(robotsText).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("<loc>");
  expect(sitemapText).toContain("/offers");
  expect(sitemapText).not.toContain("/saved");
});
