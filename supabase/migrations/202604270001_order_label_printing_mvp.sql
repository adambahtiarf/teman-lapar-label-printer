create extension if not exists pgcrypto;

create table if not exists public.attributes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attribute_options (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references public.attributes(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(attribute_id, value)
);

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_attributes (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  attribute_id uuid not null references public.attributes(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(menu_id, attribute_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  daily_sequence integer not null,
  order_date date not null default current_date,
  order_type text not null check (order_type in ('offline', 'online')),
  platform text check (platform in ('GOJ', 'GRB', 'SHP')),
  customer_name text not null,
  note text,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_date, daily_sequence)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_id uuid references public.menus(id) on delete set null,
  menu_name text not null,
  qty integer not null default 1 check (qty > 0),
  printed_count integer not null default 0 check (printed_count >= 0),
  selected_attributes jsonb not null default '{}'::jsonb,
  selected_attribute_labels jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attributes_is_active_idx on public.attributes(is_active);
create index if not exists attribute_options_attribute_id_idx on public.attribute_options(attribute_id);
create index if not exists menus_is_active_idx on public.menus(is_active);
create index if not exists menu_attributes_menu_id_idx on public.menu_attributes(menu_id);
create index if not exists orders_order_date_idx on public.orders(order_date);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_platform_idx on public.orders(platform);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_attributes_updated_at on public.attributes;
create trigger set_attributes_updated_at
before update on public.attributes
for each row execute function public.set_updated_at();

drop trigger if exists set_attribute_options_updated_at on public.attribute_options;
create trigger set_attribute_options_updated_at
before update on public.attribute_options
for each row execute function public.set_updated_at();

drop trigger if exists set_menus_updated_at on public.menus;
create trigger set_menus_updated_at
before update on public.menus
for each row execute function public.set_updated_at();

drop trigger if exists set_menu_attributes_updated_at on public.menu_attributes;
create trigger set_menu_attributes_updated_at
before update on public.menu_attributes
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_order_items_updated_at on public.order_items;
create trigger set_order_items_updated_at
before update on public.order_items
for each row execute function public.set_updated_at();

create or replace function public.create_order_with_code(
  p_order_type text,
  p_platform text,
  p_customer_name text,
  p_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order_date date := current_date;
  v_sequence integer;
  v_prefix text;
  v_code text;
  v_suffix text;
  v_order_id uuid;
begin
  if p_order_type not in ('offline', 'online') then
    raise exception 'Invalid order type';
  end if;

  if p_order_type = 'online' and (p_platform is null or p_platform not in ('GOJ', 'GRB', 'SHP')) then
    raise exception 'Invalid platform';
  end if;

  v_prefix := case when p_order_type = 'offline' then 'OFF' else p_platform end;

  perform pg_advisory_xact_lock(hashtext('orders:' || v_order_date::text));

  select coalesce(max(daily_sequence), 0) + 1
  into v_sequence
  from public.orders
  where order_date = v_order_date;

  v_suffix := chr(65 + floor(random() * 26)::int);
  v_code := v_prefix || to_char(v_order_date, 'YYMMDD') || lpad(v_sequence::text, 3, '0') || v_suffix;

  insert into public.orders (
    order_code,
    daily_sequence,
    order_date,
    order_type,
    platform,
    customer_name,
    note
  )
  values (
    v_code,
    v_sequence,
    v_order_date,
    p_order_type,
    case when p_order_type = 'offline' then null else p_platform end,
    trim(p_customer_name),
    nullif(trim(coalesce(p_note, '')), '')
  )
  returning id into v_order_id;

  return v_order_id;
end;
$$;

alter table public.attributes enable row level security;
alter table public.attribute_options enable row level security;
alter table public.menus enable row level security;
alter table public.menu_attributes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Authenticated users can manage attributes" on public.attributes;
create policy "Authenticated users can manage attributes"
on public.attributes for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage attribute options" on public.attribute_options;
create policy "Authenticated users can manage attribute options"
on public.attribute_options for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage menus" on public.menus;
create policy "Authenticated users can manage menus"
on public.menus for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage menu attributes" on public.menu_attributes;
create policy "Authenticated users can manage menu attributes"
on public.menu_attributes for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage orders" on public.orders;
create policy "Authenticated users can manage orders"
on public.orders for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage order items" on public.order_items;
create policy "Authenticated users can manage order items"
on public.order_items for all
to authenticated
using (true)
with check (true);

grant usage on schema public to authenticated;
grant all on public.attributes to authenticated;
grant all on public.attribute_options to authenticated;
grant all on public.menus to authenticated;
grant all on public.menu_attributes to authenticated;
grant all on public.orders to authenticated;
grant all on public.order_items to authenticated;
grant execute on function public.create_order_with_code(text, text, text, text) to authenticated;

-- Optional local/demo policies. Uncomment only for trusted local testing without login.
-- create policy "Anon demo access to attributes" on public.attributes for all to anon using (true) with check (true);
-- create policy "Anon demo access to attribute options" on public.attribute_options for all to anon using (true) with check (true);
-- create policy "Anon demo access to menus" on public.menus for all to anon using (true) with check (true);
-- create policy "Anon demo access to menu attributes" on public.menu_attributes for all to anon using (true) with check (true);
-- create policy "Anon demo access to orders" on public.orders for all to anon using (true) with check (true);
-- create policy "Anon demo access to order items" on public.order_items for all to anon using (true) with check (true);
-- grant usage on schema public to anon;
-- grant all on public.attributes to anon;
-- grant all on public.attribute_options to anon;
-- grant all on public.menus to anon;
-- grant all on public.menu_attributes to anon;
-- grant all on public.orders to anon;
-- grant all on public.order_items to anon;
-- grant execute on function public.create_order_with_code(text, text, text, text) to anon;

insert into public.attributes (name, slug)
values
  ('Sugar Level', 'sugar_level'),
  ('Ice Level', 'ice_level'),
  ('Spice Level', 'spice_level'),
  ('Size', 'size')
on conflict (slug) do update
set name = excluded.name;

insert into public.attribute_options (attribute_id, label, value, sort_order)
select a.id, option_data.label, option_data.value, option_data.sort_order
from public.attributes a
join (
  values
    ('sugar_level', 'No Sugar', 'no_sugar', 10),
    ('sugar_level', 'Less Sugar', 'less_sugar', 20),
    ('sugar_level', 'Normal Sugar', 'normal_sugar', 30),
    ('sugar_level', 'Extra Sugar', 'extra_sugar', 40),
    ('ice_level', 'No Ice', 'no_ice', 10),
    ('ice_level', 'Less Ice', 'less_ice', 20),
    ('ice_level', 'Normal Ice', 'normal_ice', 30),
    ('ice_level', 'Extra Ice', 'extra_ice', 40),
    ('spice_level', 'Not Spicy', 'not_spicy', 10),
    ('spice_level', 'Mild', 'mild', 20),
    ('spice_level', 'Normal Spicy', 'normal_spicy', 30),
    ('spice_level', 'Extra Spicy', 'extra_spicy', 40),
    ('size', 'Small', 'small', 10),
    ('size', 'Regular', 'regular', 20),
    ('size', 'Large', 'large', 30)
) as option_data(attribute_slug, label, value, sort_order)
on option_data.attribute_slug = a.slug
on conflict (attribute_id, value) do update
set label = excluded.label,
    sort_order = excluded.sort_order;
