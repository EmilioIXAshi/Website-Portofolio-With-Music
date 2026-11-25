create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  msg text not null,
  created_at timestamptz not null default now(),
  constraint feedback_name_length check (char_length(name) <= 40),
  constraint feedback_type_valid check (type in ('kritik', 'saran')),
  constraint feedback_msg_length check (char_length(btrim(msg)) between 5 and 400)
);

create table if not exists public.feedback_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.feedback enable row level security;
alter table public.feedback_admins enable row level security;

revoke all on table public.feedback from public, anon, authenticated;
revoke all on table public.feedback_admins from public, anon, authenticated;

grant select on table public.feedback to anon, authenticated;
grant insert (name, type, msg) on table public.feedback to anon, authenticated;
grant delete on table public.feedback to authenticated;
grant select on table public.feedback_admins to authenticated;

drop policy if exists "Anyone can read feedback" on public.feedback;
create policy "Anyone can read feedback"
on public.feedback for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback"
on public.feedback for insert
to anon, authenticated
with check (
  char_length(name) <= 40
  and type in ('kritik', 'saran')
  and char_length(btrim(msg)) between 5 and 400
);

drop policy if exists "Admins can delete feedback" on public.feedback;
create policy "Admins can delete feedback"
on public.feedback for delete
to authenticated
using (
  exists (
    select 1
    from public.feedback_admins
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can read their own access" on public.feedback_admins;
create policy "Admins can read their own access"
on public.feedback_admins for select
to authenticated
using (user_id = (select auth.uid()));
