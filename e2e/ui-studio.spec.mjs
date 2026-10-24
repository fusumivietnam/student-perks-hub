import { expect, test } from "@playwright/test";

test("local UI Studio cannot be opened from a production build", async ({ page }) => {
  // CI Browser E2E exercises next build + next start, not next dev.
  const response = await page.goto("/ui-studio");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Concept F — UI Studio" })).toHaveCount(0);
  await expect(page.getByText("Design workbench / local only")).toHaveCount(0);
  const html = await page.content();
  expect(html).not.toContain("Ưu đãi học tập minh họa");
  expect(html).not.toContain("Khung dữ liệu vận hành — không sử dụng KPI giả.");
});
