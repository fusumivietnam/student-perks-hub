insert into public.categories (slug, name, description, sort_order)
values
  ('ai', 'AI', 'Công cụ AI dành cho học tập và sáng tạo.', 10),
  ('developer-tools', 'Công cụ lập trình', 'IDE, source control và công cụ developer.', 20),
  ('cloud-hosting', 'Cloud & Hosting', 'Cloud credits, hosting và infrastructure.', 30),
  ('productivity', 'Năng suất', 'Ghi chú, quản lý công việc và cộng tác.', 40),
  ('design', 'Thiết kế', 'Thiết kế giao diện, đồ họa và prototyping.', 50),
  ('learning-research', 'Học tập & Nghiên cứu', 'Khóa học, tài liệu và công cụ nghiên cứu.', 60),
  ('security', 'Bảo mật', 'Công cụ bảo mật và quản lý danh tính.', 70),
  ('entertainment', 'Giải trí', 'Ưu đãi giải trí dành cho sinh viên.', 80),
  ('shopping', 'Mua sắm', 'Ưu đãi mua sắm và dịch vụ liên quan.', 90)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;
