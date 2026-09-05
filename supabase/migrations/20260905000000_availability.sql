create table if not exists public.availability (
  option_key text primary key,
  option_type text not null check (option_type in ('room', 'activity')),
  display_name text not null,
  is_available boolean not null default true,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.availability (option_key, option_type, display_name)
values
  ('cottage', 'room', 'Luxury Canopy Cottage'),
  ('suite', 'room', 'Deluxe Safari Suite'),
  ('villa', 'room', 'Executive Eco-Villa'),
  ('none', 'activity', 'No excursion add-on'),
  ('cocoa', 'activity', 'Bundibugyo Cocoa Farm-to-Cup Workshop'),
  ('mungu', 'activity', 'Mungu Ni Mukubwa Mountain Hike'),
  ('batwa', 'activity', 'Batwa Cultural Immersion'),
  ('sempaya', 'activity', 'Sempaya Hot Springs Geothermal Walk'),
  ('semuliki', 'activity', 'Semuliki Wildlife & Primate Safari'),
  ('ultimate', 'activity', 'Ultimate Explorer Pass')
on conflict (option_key) do nothing;

alter table public.availability enable row level security;

create policy "Anyone can view availability"
  on public.availability for select
  to anon, authenticated
  using (true);

create policy "Authenticated admins can update availability"
  on public.availability for update
  to authenticated
  using (true)
  with check (true);

grant select on public.availability to anon, authenticated;
grant update on public.availability to authenticated;

create or replace function public.validate_booking_availability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.availability
    where option_key = new.suite
      and option_type = 'room'
      and is_available
  ) then
    raise exception 'The selected room is currently unavailable';
  end if;

  if coalesce(new.excursion, 'none') <> 'none' and not exists (
    select 1 from public.availability
    where option_key = new.excursion
      and option_type = 'activity'
      and is_available
  ) then
    raise exception 'The selected activity is currently unavailable';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_booking_availability on public.bookings;
create trigger validate_booking_availability
before insert or update of suite, excursion on public.bookings
for each row execute function public.validate_booking_availability();
