-- 명령 #96 시안: 친구 순위표에 유형(type 1~8) 칸 추가. ⚠ 파일만 — 실서버 적용 금지(대표 승인 후).
-- 적용 후 app.js SHARED_ON=true 로 켠다. 기존 행은 type null(순위표에 유형 빈칸).
alter table public.shared_results add column if not exists type smallint check (type between 1 and 8);

drop function if exists public.board(text);
create function public.board(p_key text)
returns table(who text, lv int, type smallint, nickname text)
language sql stable security definer set search_path = public as $$
  with me as (select * from shared_results where p_key ~ '^[a-f0-9]{32}$' and view_key = p_key)
  select 'me', me.lv, me.type, me.nickname from me
  union all
  select 'inviter', p.lv, p.type, p.nickname from me join shared_results p on p.share_id = me.parent_id
  union all
  select * from (select 'invited', c.lv, c.type, c.nickname from me join shared_results c on c.parent_id = me.share_id order by c.created_at limit 100) x;
$$;

drop function if exists public.my_update(text, int, text);
create function public.my_update(p_key text, p_lv int, p_type int, p_nickname text)
returns int language sql security definer set search_path = public as $$
  with u as (
    update shared_results set
      lv = case when p_lv between 1 and 50 then p_lv else lv end,
      type = case when p_type between 1 and 8 then p_type else type end,
      nickname = coalesce(nullif(left(btrim(p_nickname), 10), ''), nickname)
    where p_key ~ '^[a-f0-9]{32}$' and view_key = p_key returning 1)
  select count(*)::int from u;
$$;
revoke all on function public.board(text), public.my_update(text, int, int, text) from public;
grant execute on function public.board(text), public.my_update(text, int, int, text) to anon, authenticated;

-- 되돌리기(#95 상태로): drop function public.my_update(text,int,int,text); drop function public.board(text);
--   alter table public.shared_results drop column type;  그리고 tools/shared_results.sql 의 board·my_update 를 다시 실행
