import { CategoryCard } from "@/components/categories/category-card";
import { getCategories } from "@/lib/queries/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Danh mục</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Khám phá theo nhu cầu
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        Duyệt các nhóm ưu đãi đang được theo dõi và xác minh từ nguồn chính thức.
      </p>

      {categories.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
          <p className="font-semibold">Chưa có danh mục nào.</p>
          <p className="mt-1 text-sm text-slate-500">
            Hãy chạy seed local hoặc thêm danh mục trước khi tiếp tục.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}
