-- 명령 #95 — 친구 순위표("나 + 나를 초대한 사람 + 내가 초대한 사람"). 웹 미래 테스트(habit-rich-future) 전용.
-- 행 = 테스트를 끝낸 사람 1명(같은 브라우저가 다시 하면 lv 만 갱신).
--   share_id  링크용(공개) — 친구한테 보내는 링크 ?from= 에 들어간다. 이것으로는 아무것도 조회할 수 없다
--   view_key  목록 조회용(비공개) — 그 브라우저 localStorage 에만 있다
--   parent_id 나를 초대한 사람의 share_id(없으면 null)
-- anon: 넣기만(테이블 직접 select·update·delete 불가). 읽기는 board(view_key), 갱신은 my_update(view_key, …) 본인 행만.
-- 되돌리기: 맨 아래 주석의 drop 문.

create table if not exists public.shared_results (
  id bigint generated always as identity primary key,
  share_id text not null unique check (share_id ~ '^[a-f0-9]{24}$'),
  view_key text not null unique check (view_key ~ '^[a-f0-9]{32}$'),
  parent_id text check (parent_id is null or (parent_id ~ '^[a-f0-9]{24}$' and parent_id <> share_id)),
  lv int not null check (lv between 1 and 50),
  nickname text check (nickname is null or char_length(nickname) between 1 and 10),
  created_at timestamptz not null default now()
);
create index if not exists shared_results_parent on public.shared_results (parent_id, created_at);
alter table public.shared_results enable row level security;
drop policy if exists shared_results_insert on public.shared_results;
create policy shared_results_insert on public.shared_results for insert to anon with check (true); -- 값 검사는 위 check 제약
revoke truncate on public.shared_results from anon;

-- 순위표: 본인 + 나를 초대한 사람(1명) + 내가 초대한 사람들(최대 100). share_id·view_key 는 돌려주지 않는다
create or replace function public.board(p_key text)
returns table (who text, lv int, nickname text)
language sql stable security definer set search_path = public as $$
  with me as (select * from shared_results where p_key ~ '^[a-f0-9]{32}$' and view_key = p_key)
  select 'me'::text, me.lv, me.nickname from me
  union all
  select 'inviter', p.lv, p.nickname from shared_results p join me on p.share_id = me.parent_id
  union all
  (select 'invited', c.lv, c.nickname from shared_results c join me on c.parent_id = me.share_id order by c.created_at limit 100)
$$;

-- 본인 행만 갱신(view_key 로): 다시 한 테스트의 lv, 닉네임(null 이면 그대로). 바뀐 행 수를 돌려준다
create or replace function public.my_update(p_key text, p_lv int, p_nickname text)
returns int
language sql volatile security definer set search_path = public as $$
  with u as (
    update shared_results
       set lv = coalesce(p_lv, lv),
           nickname = coalesce(nullif(left(btrim(p_nickname), 10), ''), nickname)
     where p_key ~ '^[a-f0-9]{32}$' and view_key = p_key
       and (p_lv is null or p_lv between 1 and 50)
    returning 1
  ) select count(*)::int from u
$$;

revoke all on function public.board(text) from public;
revoke all on function public.my_update(text, int, text) from public;
grant execute on function public.board(text) to anon, authenticated;
grant execute on function public.my_update(text, int, text) to anon, authenticated;

-- 되돌리기(롤백):
--   drop function if exists public.my_update(text, int, text);
--   drop function if exists public.board(text);
--   drop table if exists public.shared_results;
