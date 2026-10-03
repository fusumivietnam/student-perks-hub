import { expect, test } from "@playwright/test";

const testEmail = process.env.E2E_TEST_EMAIL;
const testPassword = process.env.E2E_TEST_PASSWORD;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

async function loginWith(page, email, password) {
  if (!email || !password) {
    throw new Error("E2E test credentials are missing.");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

async function login(page) {
  await loginWith(page, testEmail, testPassword);
}

async function signOut(page) {
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
}

test("anonymous discovery reaches a verified offer detail", async ({ page }) => {
  await page.goto("/offers");

  const offer = page
    .getByRole("link", { name: "GitHub Student Developer Pack" })
    .first();

  await expect(offer).toBeVisible();
  await offer.click();

  await expect(
    page.getByRole("heading", { name: "GitHub Student Developer Pack" }),
  ).toBeVisible();

  const officialLink = page.getByRole("link", { name: "Mở trang chính thức" });
  await expect(officialLink).toHaveAttribute(
    "href",
    "https://education.github.com/pack",
  );
});

test("saved page enforces the authentication boundary", async ({ page }) => {
  await page.goto("/saved");

  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();

  const url = new URL(page.url());
  expect(url.pathname).toBe("/login");
  expect(url.searchParams.get("next")).toBe("/saved");
});

test("authenticated user can save and remove an offer", async ({ page }) => {
  await login(page);

  await page.goto("/offers/github-student-developer-pack");
  await page.getByRole("button", { name: "Lưu ưu đãi" }).click();
  await expect(page.getByRole("button", { name: "Bỏ lưu" })).toBeVisible();

  await page.goto("/saved");
  await expect(
    page.getByRole("link", { name: "GitHub Student Developer Pack" }).first(),
  ).toBeVisible();

  await page.goto("/offers/github-student-developer-pack");
  await page.getByRole("button", { name: "Bỏ lưu" }).click();
  await expect(page.getByRole("button", { name: "Lưu ưu đãi" })).toBeVisible();

  await page.goto("/saved");
  await expect(page.getByText("Bạn chưa lưu ưu đãi nào.")).toBeVisible();
});

test("offer submission stays pending after browser submission", async ({
  page,
  request,
}) => {
  const title = `E2E Student Offer ${Date.now()}`;

  await page.goto("/submit");
  await page.getByLabel("Nhà cung cấp").fill("E2E Provider");
  await page.getByLabel("Tên ưu đãi").fill(title);
  await page
    .getByLabel("Link chính thức")
    .fill("https://example.com/student-offer");
  await page
    .getByLabel("Mô tả")
    .fill("Automated browser release-gate submission.");
  await page.getByRole("button", { name: "Gửi đề xuất" }).click();

  await expect(
    page.getByText(
      "Đã nhận đề xuất. Offer chỉ được publish sau khi được kiểm tra.",
    ),
  ).toBeVisible();

  const apiUrl = process.env.E2E_SUPABASE_URL;
  const serviceKey = process.env.E2E_SERVICE_ROLE_KEY;

  if (!apiUrl || !serviceKey) {
    throw new Error("E2E Supabase verification credentials are missing.");
  }

  const response = await request.get(
    `${apiUrl}/rest/v1/submissions?title=eq.${encodeURIComponent(title)}&select=title,status`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    },
  );

  expect(response.ok()).toBeTruthy();
  const rows = await response.json();
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ title, status: "pending" });
});

test("regular authenticated user cannot access admin console", async ({ page }) => {
  await login(page);

  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Moderation console" }),
  ).toHaveCount(0);
});

test("admin can review a pending submission", async ({ page }) => {
  const title = `E2E Admin Review ${Date.now()}`;

  await page.goto("/submit");
  await page.getByLabel("Nhà cung cấp").fill("Admin Review Provider");
  await page.getByLabel("Tên ưu đãi").fill(title);
  await page
    .getByLabel("Link chính thức")
    .fill("https://example.com/admin-review");
  await page.getByRole("button", { name: "Gửi đề xuất" }).click();
  await expect(page).toHaveURL(/\/submit\?success=1/);

  await loginWith(page, adminEmail, adminPassword);
  await page.goto("/admin");

  await expect(
    page.getByRole("heading", { name: "Moderation console" }),
  ).toBeVisible();

  const submission = page.locator("article").filter({ hasText: title });
  await expect(submission).toBeVisible();
  await submission.getByRole("button", { name: "Approve" }).click();
  await expect(submission.getByText("approved")).toBeVisible();
});

test("student verification requires admin review before verified state", async ({ page }) => {
  const institution = `E2E University ${Date.now()}`;

  await login(page);
  await page.goto("/verification");
  await page.getByLabel("Tên trường hoặc tổ chức giáo dục").fill(institution);
  await page.getByRole("button", { name: "Gửi yêu cầu xác minh" }).click();

  await expect(page).toHaveURL(/\/verification\?success=1/);
  await expect(page.getByText("Đang chờ duyệt", { exact: true })).toBeVisible();
  await signOut(page);

  await loginWith(page, adminEmail, adminPassword);
  await page.goto("/admin/verifications");

  const verification = page.locator("article").filter({ hasText: institution });
  await expect(verification).toBeVisible();
  await verification.getByRole("button", { name: "Xác minh 1 năm" }).click();
  await expect(verification.getByText("Đã xác minh", { exact: true })).toBeVisible();
  await signOut(page);

  await login(page);
  await page.goto("/verification");
  await expect(page.getByText("Đã xác minh", { exact: true })).toBeVisible();
});
