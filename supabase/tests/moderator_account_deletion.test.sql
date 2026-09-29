begin;
create extension if not exists pgtap with schema extensions;
select plan(12);
insert into auth.users(id) values
 ('aaaa1111-1111-4111-8111-111111111111'),
 ('bbbb2222-2222-4222-8222-222222222222');
insert into private.moderators(user_id) values ('aaaa1111-1111-4111-8111-111111111111');
set local role authenticated;
select set_config('request.jwt.claim.sub','bbbb2222-2222-4222-8222-222222222222',true);
select set_config('request.jwt.claims','{"sub":"bbbb2222-2222-4222-8222-222222222222","role":"authenticated","is_anonymous":false}',true);
select throws_ok($$select public.request_my_account_deletion()$$,'22023','No moderation audit review is necessary; use ordinary account deletion','Nonmoderator cannot queue privileged deletion');
select lives_ok($$insert into public.reports(id,user_id,author_name,type,text,lat,lng)
 values ('moderator-delete-report-b',auth.uid(),'Test','danger','Test audit',52.2,5.4)$$,'Other account creates report');
select set_config('request.jwt.claim.sub','aaaa1111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claims','{"sub":"aaaa1111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":false}',true);
select lives_ok($$insert into public.reports(id,user_id,author_name,type,text,lat,lng)
 values ('moderator-delete-report-a',auth.uid(),'Test','danger','Test own report',52.2,5.4)$$,'Moderator creates own report');
select lives_ok($$select public.moderate_report('moderator-delete-report-b','hidden','Audit history on another user report')$$,'Moderator audit on another report');
select lives_ok($$select public.moderate_report('moderator-delete-report-a','hidden','Audit history on own report')$$,'Moderator audit on own report');
select throws_ok($$select public.delete_my_account()$$,'23503',null,'Self-deletion cannot erase unreviewed moderator audit');
select set_config('test.case_id',(select public.request_my_account_deletion())::text,true);
select ok(current_setting('test.case_id')::uuid is not null,'Moderator deletion request created');
select throws_ok(format('select private.approve_moderator_account_deletion(%L::uuid,%L)',current_setting('test.case_id'),'Review of audit retention and erasure'),'42501',null,'Moderator cannot approve their own deletion');
reset role;
select lives_ok(format('select private.approve_moderator_account_deletion(%L::uuid,%L)',current_setting('test.case_id'),'Administrator reviewed audit retention and anonymized original actor'),'Authorized administrator can complete reviewed deletion');
select is((select count(*) from auth.users where id='aaaa1111-1111-4111-8111-111111111111'),0::bigint,'Moderator auth identity deleted');
select is((select count(*) from private.moderation_audit_archive where case_id=current_setting('test.case_id')::uuid),2::bigint,'Both audit actions retained privately, including cascade-deleted report');
select ok((select count(*)=1 and count(moderator_id)=0 from public.moderation_actions where report_id='moderator-delete-report-b'),'Surviving audit stays intact and actor is anonymized');
select * from finish();
rollback;
