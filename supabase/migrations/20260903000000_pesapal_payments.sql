create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  merchant_reference text not null unique,
  order_tracking_id text unique,
  amount_ugx numeric(12, 2) not null check (amount_ugx > 0),
  currency text not null default 'UGX' check (currency = 'UGX'),
  status text not null default 'initiated' check (status in ('initiated', 'pending', 'completed', 'failed', 'reversed')),
  payment_method text,
  pesapal_status_code integer,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.bookings
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded'));

create index if not exists payments_booking_id_idx on public.payments (booking_id);
create index if not exists payments_status_idx on public.payments (status);

alter table public.payments enable row level security;

create policy "Admins can view payments"
  on public.payments for select
  to authenticated
  using (true);

revoke all on public.payments from anon;
revoke all on public.payments from authenticated;
 grant select on public.payments to authenticated;
