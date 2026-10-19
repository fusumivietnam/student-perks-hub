import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const screens = [
  { id: "home", path: "/", admin: false },
  { id: "offers", path: "/offers", admin: false },
  { id: "offer-detail", path: "/offers/github-student-developer-pack", admin: false },
  { id: "admin-dashboard", path: "/admin", admin: true },
  { id: "admin-offers", path: "/admin/content/offers", admin: true },
  { id: "admin-editor", path: "/admin/content/offers/new", admin: true },
  { id: "admin-submissions", path: "/admin/submissions", admin: true },
  { id: "admin-verifications", path: "/admin/verifications", admin: true },
  { id: "admin-categories", path: "/admin/content/categories", admin: true },
];

test("approved nine-screen visual audit evidence at desktop and mobile", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Visual audit requires deterministic admin E2E credentials.");

  await mkdir("test-results/visual-audit", { recursive: true });
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const screen of screens.filter((item) => !item.admin)) {
      const response = await page.goto(screen.path);
      expect(response?.ok(), screen.path).toBeTruthy();
      await expect(page.locator("h1").first()).toBeVisible();
      await page.screenshot({ path: `test-results/visual-audit/${screen.id}-${width}.png`, fullPage: true, animations: "disabled" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow, `horizontal overflow on ${screen.path} at ${width}px`).toBe(false);
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).not.toHaveURL(/\\/login(?:\\?|$)/);

  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const screen of screens.filter((item) => item.admin)) {
      const response = await page.goto(screen.path);
      expect(response?.ok(), screen.path).toBeTruthy();
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("[data-admin-shell]")).toBeVisible();
      await page.screenshot({ path: `test-results/visual-audit/${screen.id}-${width}.png`, fullPage: true, animations: "disabled" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow, `horizontal overflow on ${screen.path} at ${width}px`).toBe(false);
    }
  }
});
