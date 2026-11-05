# SEO 메모 (명령 #154 · 2026-11-05) — 제안만, 아직 아무것도 바꾸지 않음

## 1. 자기 도메인(예: habitrich.kr)

| | 내용 |
|---|---|
| 좋은 점 | 주소가 짧아 말로 전하기 쉬움 · 나중에 호스팅을 옮겨도 주소가 그대로 · 검색 결과·카톡 미리보기에 브랜드 주소가 보임 |
| 나쁜 점 | 해마다 갱신비 · 갱신을 놓치면 주소를 잃음 · 서치콘솔·서치어드바이저 새로 등록, 쌓인 색인이 옮겨 가는 동안 잠깐 흔들릴 수 있음 |
| 비용 | 가비아 .kr 1년 정가 2만 2천 원(부가세 별도, 인상 뒤 기준) — https://www.news1.kr/industry/sb-founded/6333221 · 등록처별 비교 https://domainoffer.net/tld/kr/GoDaddy · 결제 전 등록처 화면에서 실제 금액 확인 |

### 옮기는 순서
1. 도메인 등록 → DNS: 루트(habitrich.kr)는 A 레코드 185.199.108.153 · .109 · .110 · .111, www 는 CNAME `seungsoos.github.io`
   (공식: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
2. GitHub 리포 Settings → Pages → Custom domain 입력(브랜치 배포라 리포 루트에 `CNAME` 파일이 커밋됨) → DNS 확인 뒤 **Enforce HTTPS**(최대 24시간 걸릴 수 있음)
3. 도메인 소유 확인(Settings → Pages → Verified domains) — 남이 같은 도메인을 가로채지 못하게
4. `BASE_URL=https://habitrich.kr/ node tools/gen.mjs` 로 canonical·og:url·og:image·sitemap·robots 를 새 주소로 다시 생성
5. 구글 서치콘솔: 새 주소 속성 추가 → sitemap 제출. 지금 속성은 'URL 접두어'라 '주소 변경' 도구(도메인 단위)를 못 쓸 수 있음 — 새 속성 등록 + 301 로 처리. 네이버 서치어드바이저도 새 사이트로 등록 + 소유 확인 meta 다시
6. 앱 안 링크·스토어 설명·마케팅 글(스레드·카페·블로그) 주소 교체 — 옛 주소도 이동되니 급하지 않게

### 지금 링크(?src= 포함)가 안 깨지게
- 프로젝트 사이트에 커스텀 도메인을 걸면 `seungsoos.github.io/habit-rich-future/...` 가 새 도메인으로 301 이동하는 것으로 알려져 있음(경로·쿼리 유지). **공식 문서에 명시는 없어** 전환 직후 아래로 확인:
  `curl -sI "https://seungsoos.github.io/habit-rich-future/t/1.html?src=threads"` → `location: https://habitrich.kr/t/1.html?src=threads` 인지
- 경로 구조(`t/N.html`, `r/N.html`, `?src=`·`?lv=`·`?from=`)는 바꾸지 않는다 — 앱 공유 링크·이미 퍼진 링크가 그대로 맞음
- 주의: 이 사이트는 도메인 루트(`/`)로 옮겨지므로 `/habit-rich-future/` 가 빠짐. 페이지 안 링크는 전부 상대 경로라 문제없음, 절대 주소는 gen.mjs BASE_URL 하나로 바뀜
- `seungsoos.github.io` 계정 사이트(사용자 사이트)에 커스텀 도메인을 걸면 같은 계정의 다른 프로젝트 사이트도 그 도메인 아래로 옮겨 가니 **리포 단위로만** 건다

## 2. 앱스토어 검색(ASO) 순위 확인

| 방법 | 어디서 | 메모 |
|---|---|---|
| App Store Connect 분석 | 앱 분석 → 획득(Acquisition) → 출처 유형 'App Store 검색' | 검색에서 본 수·받은 수. 어떤 검색어였는지는 안 나옴. https://developer.apple.com/help/app-store-connect-analytics/acquisition/acquisition |
| Play Console | 사용자 확보 → 스토어 실적 → 스토어 분석·전환 분석, 검색어별 분해 | 정식 출시 뒤 의미 있음. https://support.google.com/googleplay/android-developer/answer/9859173 |
| 손으로 검색 | 아이폰 App Store 앱에서 '습관 앱'·'습관 관리'·'습관부자' 등 검색 → 몇 번째인지 기록 | 국가는 기기 Apple 계정 국가(대한민국)를 따름. 로그인 계정·검색 기록 영향이 있어 매번 같은 기기로, 주 1회 같은 요일에 |
| 무료 도구 | AppFigures 무료 등급, Apple Search Ads 검색어 인기도(광고 만들기 화면에서만 보임) | 대략적 경향만 |
| 유료 도구 | AppTweak, Sensor Tower, data.ai, MobileAction | 키워드 순위 추적·경쟁 앱 비교. 지금 규모엔 과함 |
