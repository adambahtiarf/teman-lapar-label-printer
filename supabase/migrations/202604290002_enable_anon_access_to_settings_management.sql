drop policy if exists "Anon demo access to paper sizes" on public.paper_sizes;
create policy "Anon demo access to paper sizes"
on public.paper_sizes for all
to anon
using (true)
with check (true);

drop policy if exists "Anon demo access to order number formats" on public.order_number_formats;
create policy "Anon demo access to order number formats"
on public.order_number_formats for all
to anon
using (true)
with check (true);

grant all on public.paper_sizes to anon;
grant all on public.order_number_formats to anon;
grant execute on function public.create_order_with_code(text, text, text, text) to anon;
