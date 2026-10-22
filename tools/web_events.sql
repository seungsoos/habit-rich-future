-- 웹 미래 테스트 계측(명령 #84 · #87 적용) — 앱 events 와 분리. main supabase/web_events.sql 과 같은 내용
-- 숫자만: 이름·닉네임·기기 정보 없음. wid = 브라우저 localStorage 무작위 ID.
-- ev: start · done{lv,score} · share{m:1 공유시트/2 링크복사, c:1 비교 링크} · compare_open{vs} · app_click{os:1 iOS/2 Android/3 PC}
-- 모든 이벤트 props.src: 1 스레드 · 2 카톡 · 3 커뮤니티 · 4 블로그 · 9 광고 · null 직접
create table if not exists public.web_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  wid text not null check (char_length(wid) between 8 and 40),
  ev text not null check (ev in ('start', 'done', 'share', 'compare_open', 'app_click')),
  props jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object' and pg_column_size(props) < 512)
);
create index if not exists web_events_created_at on public.web_events (created_at);
alter table public.web_events enable row level security;
-- 익명은 넣기만, 읽기는 막는다(대시보드·SQL 로만 조회)
drop policy if exists web_events_insert on public.web_events;
create policy web_events_insert on public.web_events for insert to anon with check (true);
-- 명령 #87: TRUNCATE 는 RLS 를 거치지 않는다 — anon 에서 회수
revoke truncate on public.web_events from anon;
