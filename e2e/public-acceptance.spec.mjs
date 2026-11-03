import { expect, test } from "@playwright/test";

// Read-only acceptance against isolated local Supabase. Do not navigate to,
// request, or crawl external provider sites from automated tests.
test("published offer CTAs remain safe and visible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/offers");

  const offerLinks = await page
    .locator('a[href^="/offers/"]')
    .evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute("href")))].filter(Boolean));
  expect(offerLinks.length, "Seeded published offer listing should not be empty").toBeGreaterThan(0);

  for (const path of offerLinks) {
    const response = await page.goto(path);
    expect(response?.ok(), `Detail page ${path} must load`).toBeTruthy();
    await expect(page.locator("h1").first()).toBeVisible();

    const cta = page.getByRole("link", { name: "Mở trang chính thức" });
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href, `Official URL for ${path}`).toBeTruthy();
    const url = new URL(href);
    expect(url.protocol, `Secure provider URL for ${path}`).toBe("https:");
    expect(["localhost", "127.0.0.1"].includes(url.hostname)).toBe(false);
    await expect(cta).toHaveAttribute("target", "_blank");
    await expect(cta).toHaveAttribute("rel", /noopener/);
    await expect(cta).toHaveAttribute("rel", /noreferrer/);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow, `Horizontal overflow on ${path} at 375px`).toBe(false);
  }
});

test("mobile search and empty state work with keyboard submission", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "Tìm ưu đãi" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Tìm kiếm ưu đãi" });
  await search.fill("GitHub");
  await search.press("Enter");
  await expect(page).toHaveURL((url) => url.pathname === "/search" && url.searchParams.get("q") === "GitHub");
  await expect(page.getByRole("link", { name: "GitHub Student Developer Pack" }).first()).toBeVisible();

  await search.fill("no-such-offer-e2e-xyz");
  await search.press("Enter");
  await expect(page.getByText(/Không tìm thấy kết quả cho/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Xem danh mục" })).toBeVisible();
});
