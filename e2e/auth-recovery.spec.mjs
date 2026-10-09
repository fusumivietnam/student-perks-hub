import { expect, test } from "@playwright/test";

test("login exposes password recovery and request response does not enumerate accounts", async ({ page }) => {
  await page.goto("/login");
  const recoveryLink = page.getByRole("link", { name: "Quên mật khẩu?" });
  await expect(recoveryLink).toHaveAttribute("href", "/forgot-password");
  await recoveryLink.click();

  await expect(page.getByRole("heading", { name: "Quên mật khẩu" })).toBeVisible();
  await page.getByLabel("Email").fill("missing-account@example.test");
  await page.getByRole("button", { name: "Gửi liên kết đặt lại mật khẩu" }).click();

  await expect(
    page.getByText("Nếu email thuộc một tài khoản, liên kết đặt lại mật khẩu đã được gửi."),
  ).toBeVisible();
});

test("invalid auth callback fails closed", async ({ page }) => {
  await page.goto("/auth/callback?next=https://example.com");
  await expect(page).toHaveURL(/\/login\?error=/);
  await expect(page.getByText("Liên kết xác thực không hợp lệ")).toBeVisible();
});

test("reset-password requires an authenticated recovery session", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page).toHaveURL(/\/login\?error=/);
  await expect(page.getByText("Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn")).toBeVisible();
});
