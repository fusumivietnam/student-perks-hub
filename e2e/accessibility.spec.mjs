import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const criticalPublicPages = [
  ["/", "home"],
  ["/offers", "offers discovery"],
  ["/categories", "categories"],
  ["/login", "login"],
  ["/submit", "offer submission"],
  ["/offers/github-student-developer-pack", "offer detail"],
];

function summarizeViolations(violations) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      failureSummary: node.failureSummary,
    })),
  }));
}

for (const [path, name] of criticalPublicPages) {
  test(`${name} has no serious or critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );

    expect(
      blocking,
      JSON.stringify(summarizeViolations(blocking), null, 2),
    ).toEqual([]);
  });
}

test("mobile navigation exposes the main destinations", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.locator("summary[aria-label='Mở menu điều hướng']");
  await expect(toggle).toBeVisible();
  await toggle.click();
  const nav = page.getByRole("navigation", { name: "Điều hướng di động" });
  await expect(nav.getByRole("link", { name: "Tất cả ưu đãi" })).toBeVisible();
  await nav.getByRole("link", { name: "Tất cả ưu đãi" }).click();
  await expect(page).toHaveURL(/\/offers$/);
});

test("keyboard users can skip the header", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Chuyển đến nội dung chính" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
});
