-- Enable Supabase Postgres Changes for the tables the client subscribes to.
-- Without this publication membership, the UI only updates after a manual refresh.

do $$
begin
  if not exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'attributes',
    'attribute_options',
    'menus',
    'menu_attributes',
    'orders',
    'order_items'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = target_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target_table);
    end if;
  end loop;
end $$;
