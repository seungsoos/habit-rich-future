# 습관부자 미래 테스트 (명령 #84 · 시안)

서버·빌드 도구 없는 정적 페이지. 질문 7개 → 총점(0~21) → 결과 칸 `r/N.html`.

| 파일 | 내용 |
|---|---|
| `index.html` | 시작 화면 + 질문 7개(한 화면 한 문항) — **생성 파일**(gen.mjs, 제목·설명·canonical·JSON-LD·소개 문단) |
| `sitemap.xml` · `robots.txt` | 생성 파일(gen.mjs) — 시작 화면 + 결과 50개 |
| `r/1.html` ~ `r/50.html` | 결과 페이지(정적 생성 — 카톡·스레드 미리보기용 og:title·og:image) |
| `app.js` · `style.css` · `data.js` | 공용 동작·모양 · 칸 이름과 점수→칸 표(생성) |
| `img/sq/N.png` · `img/og/N.png` | 앱 장면 그대로 뽑은 그림(정사각 680px · 1200×630) |
| `tools/gen.mjs` | 앱 소스(`src/game/roadmap.ts`·`messages.ts`)에서 `data.js`·`r/*.html` 생성 |
| `tools/shots.cjs` | 앱 웹 미리보기(`?shot=v77-face-base-N`)에서 그림 50장 생성 |
| `tools/web_events.sql` | 계측 테이블(앱 events 와 분리) — 아직 적용 안 함 |

다시 만들기
```
BASE_URL=https://<배포 주소>/ node web/future-test/tools/gen.mjs   # og·canonical·sitemap 절대 주소
NAVER_VERIFY=<값> GOOGLE_VERIFY=<값> BASE_URL=... node web/future-test/tools/gen.mjs   # 검색엔진 소유 확인 meta(docs/SEO.md)
CI=1 npx expo start --web --port 8093 &                             # 그림이 바뀌었을 때만
PW=<playwright 경로> node web/future-test/tools/shots.cjs
```
계측은 `app.js` 의 `EVENTS.url/key` 가 비어 있으면 보내지 않는다(테이블 적용 뒤 채운다). 유입은 `?src=1 스레드 · 2 카톡 · 3 커뮤니티 · 4 블로그 · 9 광고`.
