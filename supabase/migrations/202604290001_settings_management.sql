create table if not exists public.paper_sizes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  width_mm numeric(6, 2) not null check (width_mm > 0),
  height_mm numeric(6, 2) not null check (height_mm > 0),
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_number_formats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  offline_prefix text not null default 'OFF',
  goj_prefix text not null default 'GOJ',
  grab_prefix text not null default 'GRB',
  shopee_prefix text not null default 'SHP',
  date_pattern text not null default 'YYMMDD' check (date_pattern in ('YYMMDD', 'YYYYMMDD', 'DDMMYY')),
  sequence_padding integer not null default 3 check (sequence_padding between 1 and 6),
  separator text not null default '',
  include_random_suffix boolean not null default true,
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists paper_sizes_single_default_idx
on public.paper_sizes (is_default)
where is_default = true;

create unique index if not exists order_number_formats_single_default_idx
on public.order_number_formats (is_default)
where is_default = true;

drop trigger if exists set_paper_sizes_updated_at on public.paper_sizes;
create trigger set_paper_sizes_updated_at
before update on public.paper_sizes
for each row execute function public.set_updated_at();

drop trigger if exists set_order_number_formats_updated_at on public.order_number_formats;
create trigger set_order_number_formats_updated_at
before update on public.order_number_formats
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
  v_date_part text;
  v_order_id uuid;
  v_format record;
begin
  if p_order_type not in ('offline', 'online') then
    raise exception 'Invalid order type';
  end if;

  if p_order_type = 'online' and (p_platform is null or p_platform not in ('GOJ', 'GRB', 'SHP')) then
    raise exception 'Invalid platform';
  end if;

  select *
  into v_format
  from public.order_number_formats
  where is_active = true
  order by is_default desc, updated_at desc
  limit 1;

  if p_order_type = 'offline' then
    v_prefix := coalesce(v_format.offline_prefix, 'OFF');
  elsif p_platform = 'GOJ' then
    v_prefix := coalesce(v_format.goj_prefix, 'GOJ');
  elsif p_platform = 'GRB' then
    v_prefix := coalesce(v_format.grab_prefix, 'GRB');
  else
    v_prefix := coalesce(v_format.shopee_prefix, 'SHP');
  end if;

  v_date_part := case coalesce(v_format.date_pattern, 'YYMMDD')
    when 'YYYYMMDD' then to_char(v_order_date, 'YYYYMMDD')
    when 'DDMMYY' then to_char(v_order_date, 'DDMMYY')
    else to_char(v_order_date, 'YYMMDD')
  end;

  perform pg_advisory_xact_lock(hashtext('orders:' || v_order_date::text));

  select coalesce(max(daily_sequence), 0) + 1
  into v_sequence
  from public.orders
  where order_date = v_order_date;

  v_suffix := case
    when coalesce(v_format.include_random_suffix, true) then chr(65 + floor(random() * 26)::int)
    else ''
  end;

  v_code :=
    v_prefix ||
    coalesce(v_format.separator, '') ||
    v_date_part ||
    lpad(v_sequence::text, coalesce(v_format.sequence_padding, 3), '0') ||
    v_suffix;

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

alter table public.paper_sizes enable row level security;
alter table public.order_number_formats enable row level security;

drop policy if exists "Authenticated users can manage paper sizes" on public.paper_sizes;
create policy "Authenticated users can manage paper sizes"
on public.paper_sizes for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage order number formats" on public.order_number_formats;
create policy "Authenticated users can manage order number formats"
on public.order_number_formats for all
to authenticated
using (true)
with check (true);

grant all on public.paper_sizes to authenticated;
grant all on public.order_number_formats to authenticated;
grant execute on function public.create_order_with_code(text, text, text, text) to authenticated;

insert into public.paper_sizes (name, width_mm, height_mm, is_default)
select 'NIIMBOT 40 x 30', 40, 30, true
where not exists (select 1 from public.paper_sizes);

insert into public.order_number_formats (
  name,
  offline_prefix,
  goj_prefix,
  grab_prefix,
  shopee_prefix,
  date_pattern,
  sequence_padding,
  separator,
  include_random_suffix,
  is_default
)
select 'Default', 'OFF', 'GOJ', 'GRB', 'SHP', 'YYMMDD', 3, '', true, true
where not exists (select 1 from public.order_number_formats);
