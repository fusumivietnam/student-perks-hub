import { expect, test } from "@playwright/test";

test("local UI Studio cannot be opened from a production build", async ({ page }) => {
  // CI Browser E2E exercises next build + next start, not next dev.
  const response = await page.goto("/ui-studio");
  // Next.js streamed notFound() can keep HTTP 200 after headers are committed.\n  // Assert the route renders the not-found UI and no Studio content instead.\n  expect([200, 404]).toContain(response?.status());\n  await expect(page.getByText("This page could not be found.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Concept F — UI Studio" })).toHaveCount(0);
  await expect(page.getByText("Design workbench / local only")).toHaveCount(0);
  const html = await page.content();
  expect(html).not.toContain("Ưu đãi học tập minh họa");
  expect(html).not.toContain("Khung dữ liệu vận hành — không sử dụng KPI giả.");
});
