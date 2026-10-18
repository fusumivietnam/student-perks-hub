/** Central non-secret product presentation settings.
 * Change only approved copy/layout choices here; styling tokens live in app/globals.css.
 * Never store API keys, RLS rules, pricing or analytics assumptions in this file.
 */
export const uiConfig = {
  productName: "Student Perks Hub",
  locale: "vi-VN",
  admin: {
    title: "Admin Workspace",
    sidebar: "navy",
  },
  public: {
    searchPlaceholder: "Tìm ưu đãi, thương hiệu, danh mục...",
  },
  pageSize: {
    adminQueues: 20,
  },
} as const;
