-- Moderators with audit history require an explicit administrator-reviewed deletion.
-- Existing users, reports, chat rooms and audit entries remain intact until approval.
create table if not exists private.account_deletion_requests (
 id uuid primary key default gen_random_uuid(),
 requester_id uuid references auth.users(id) on delete set null,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 requested_at timestamptz not null default now(),
 reviewed_at timestamptz,
 review_reason text,
 check (review_reason is null or char_length(review_reason) between 10 and 1000)
);
create unique index if not exists one_pending_account_deletion_per_user
 on private.account_deletion_requests(requester_id) where status='pending';
alter table private.account_deletion_requests enable row level security;
revoke all on private.account_deletion_requests from public,anon,authenticated;
create table if not exists private.moderation_audit_archive (
 case_id uuid not null references private.account_deletion_requests(id),
 action_id uuid not null,
 report_id text not null,
 previous_status text not null,
 new_status text not null,
 reason text not null,
 action_at timestamptz not null,
 archived_at timestamptz not null default now(),
 primary key(case_id,action_id)
);
alter table private.moderation_audit_archive enable row level security;
revoke all on private.moderation_audit_archive from public,anon,authenticated;
-- Preserve moderation events even after the original actor is erased.
alter table public.moderation_actions alter column moderator_id drop not null;
alter table public.moderation_actions drop constraint if exists moderation_actions_moderator_id_fkey;
alter table public.moderation_actions add constraint moderation_actions_moderator_id_fkey
 foreign key (moderator_id) references auth.users(id) on delete set null;
create or replace function public.request_my_account_deletion() returns uuid
 language plpgsql security definer set search_path=''
as $$
declare me uuid:=auth.uid(); pending_case uuid;
begin
 if me is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,true) then
  raise exception 'Verified account required' using errcode='42501';
 end if;
 if not exists(select 1 from public.moderation_actions where moderator_id=me) then
  raise exception 'No moderation audit review is necessary; use ordinary account deletion' using errcode='22023';
 end if;
 insert into private.account_deletion_requests(requester_id) values(me)
 on conflict (requester_id) where status='pending' do update set requester_id=excluded.requester_id
 returning id into pending_case;
 return pending_case;
end $$;
revoke all on function public.request_my_account_deletion() from public,anon;
grant execute on function public.request_my_account_deletion() to authenticated;
-- This procedure is deliberately private: no browser/user can approve its own erasure.
-- Authorized administrator must review retention duties and provide a case-specific reason.
create or replace function private.approve_moderator_account_deletion(p_case_id uuid, approval_reason text) returns void
 language plpgsql security definer set search_path=''
as $$
declare target uuid;
begin
 if approval_reason is null or char_length(trim(approval_reason)) not between 10 and 1000 then
  raise exception 'Document a specific retention and privacy review reason' using errcode='22023';
 end if;
 select requester_id into target from private.account_deletion_requests
 where id=p_case_id and status='pending' for update;
 if target is null then raise exception 'Pending deletion request not found' using errcode='22023'; end if;
 if not exists(select 1 from auth.users u where u.id=target) then
  raise exception 'Account not found' using errcode='22023';
 end if;
 insert into private.moderation_audit_archive
  (case_id,action_id,report_id,previous_status,new_status,reason,action_at)
 select p_case_id,a.id,a.report_id,a.previous_status,a.new_status,a.reason,a.created_at
 from public.moderation_actions a where a.moderator_id=target
 on conflict(case_id,action_id) do nothing;
 -- The original moderation events remain until their report is deleted;
 -- surviving rows retain their reason/status/timestamps, actor becomes NULL via FK.
 update private.account_deletion_requests
 set status='approved',reviewed_at=now(),review_reason=trim(approval_reason)
 where id=p_case_id;
 update public.chat_rooms r set created_by=(
  select m.user_id from public.chat_members m
  where m.room_id=r.id and m.user_id<>target order by m.user_id limit 1
 ) where r.created_by=target
 and exists(select 1 from public.chat_members m where m.room_id=r.id and m.user_id<>target);
 delete from public.chat_messages m where m.room_id in (select id from public.chat_rooms where created_by=target);
 delete from public.chat_members m where m.room_id in (select id from public.chat_rooms where created_by=target);
 delete from public.chat_rooms where created_by=target;
 delete from auth.users where id=target;
end $$;
revoke all on function private.approve_moderator_account_deletion(uuid,text) from public,anon,authenticated;
grant execute on function private.approve_moderator_account_deletion(uuid,text) to service_role;
