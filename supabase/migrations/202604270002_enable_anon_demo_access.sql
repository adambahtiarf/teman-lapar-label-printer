-- Local/demo-only access for the no-login MVP.
-- Do not run this in production. It lets anyone with the public publishable key
-- read and mutate the order-label tables through Supabase Data APIs.

drop policy if exists "Anon demo access to attributes" on public.attributes;
create policy "Anon demo access to attributes"
on public.attributes for all
to anon
using (true)
with check (true);

drop policy if exists "Anon demo access to attribute options" on public.attribute_options;
create policy "Anon demo access to attribute options"
on public.attribute_options for all
to anon
using (true)
with check (true);

drop policy if exists "Anon demo access to menus" on public.menus;
create policy "Anon demo access to menus"
on public.menus for all
to anon
using (true)
with check (true);

drop policy if exists "Anon demo access to menu attributes" on public.menu_attributes;
create policy "Anon demo access to menu attributes"
on public.menu_attributes for all
to anon
using (true)
with check (true);

drop policy if exists "Anon demo access to orders" on public.orders;
create policy "Anon demo access to orders"
on public.orders for all
to anon
using (true)
with check (true);

drop policy if exists "Anon demo access to order items" on public.order_items;
create policy "Anon demo access to order items"
on public.order_items for all
to anon
using (true)
with check (true);

grant usage on schema public to anon;
grant all on public.attributes to anon;
grant all on public.attribute_options to anon;
grant all on public.menus to anon;
grant all on public.menu_attributes to anon;
grant all on public.orders to anon;
grant all on public.order_items to anon;
grant execute on function public.create_order_with_code(text, text, text, text) to anon;
