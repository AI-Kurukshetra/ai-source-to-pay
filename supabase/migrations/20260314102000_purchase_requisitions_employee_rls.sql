-- Update PR RLS to support employee creators + admin approvers.

alter table public.purchase_requisitions enable row level security;

drop policy if exists admin_purchase_requisitions_select_all on public.purchase_requisitions;
drop policy if exists admin_purchase_requisitions_insert on public.purchase_requisitions;
drop policy if exists admin_purchase_requisitions_update on public.purchase_requisitions;
drop policy if exists admin_purchase_requisitions_delete on public.purchase_requisitions;

drop policy if exists employee_purchase_requisitions_select_own on public.purchase_requisitions;
drop policy if exists employee_purchase_requisitions_insert_own on public.purchase_requisitions;

-- Admin: full read + approve/reject via update.
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

-- Employee: create + view only their own PRs.
create policy "employee_purchase_requisitions_select_own"
on public.purchase_requisitions for select
using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'employee'
  and created_by = auth.uid()
);

create policy "employee_purchase_requisitions_insert_own"
on public.purchase_requisitions for insert
with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'employee'
  and created_by = auth.uid()
);

