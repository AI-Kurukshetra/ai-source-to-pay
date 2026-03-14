-- Purchase Requisitions (PR)
-- Adds a basic requisition workflow for procurement.

create table if not exists public.purchase_requisitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_name text not null,
  description text not null,
  quantity integer not null,
  estimated_budget numeric not null,
  category text not null,
  urgency text not null,
  status text not null default 'draft',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint purchase_requisitions_urgency_check check (urgency in ('low', 'medium', 'high')),
  constraint purchase_requisitions_status_check check (status in ('draft', 'pending', 'approved', 'rejected')),
  constraint purchase_requisitions_quantity_check check (quantity > 0),
  constraint purchase_requisitions_budget_check check (estimated_budget >= 0)
);

create index if not exists idx_purchase_requisitions_created_by on public.purchase_requisitions (created_by);
create index if not exists idx_purchase_requisitions_status on public.purchase_requisitions (status);
create index if not exists idx_purchase_requisitions_created_at on public.purchase_requisitions (created_at);

alter table public.purchase_requisitions enable row level security;

-- Admin-only access (role stored in auth JWT user_metadata).
create policy "admin_purchase_requisitions_select_all"
on public.purchase_requisitions for select
using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "admin_purchase_requisitions_insert"
on public.purchase_requisitions for insert
with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "admin_purchase_requisitions_update"
on public.purchase_requisitions for update
using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "admin_purchase_requisitions_delete"
on public.purchase_requisitions for delete
using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

