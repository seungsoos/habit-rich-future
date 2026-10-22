// 웹 미래 테스트 생성기(명령 #84) — 앱 소스(칸 이름·NODE_UP/DOWN)를 읽어 data.js 와 결과 페이지 r/1~50.html 을 만든다.
// 빌드 도구 없이: node web/future-test/tools/gen.mjs   (BASE_URL=https://.../ 로 og 절대 주소를 바꾼다)
// 카톡·스레드 미리보기는 JS 를 안 읽어서 칸마다 정적 HTML 에 og:title·og:image 를 박는다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..');
const SRC = join(HERE, '..', '..', '..', 'src', 'game');
// ponytail: 배포 주소가 정해지면 BASE_URL 로 다시 생성 — og:image 는 절대 주소여야 카톡이 읽는다
const BASE = process.env.BASE_URL ?? 'https://seungsoos.github.io/habit-rich-future/';

const roadmap = readFileSync(join(SRC, 'roadmap.ts'), 'utf8');
const NAMES = [...roadmap.matchAll(/\{ at: [-\d_]+, name: "([^"]+)"/g)].map((m) => m[1]);
const messages = readFileSync(join(SRC, 'messages.ts'), 'utf8');
const arr = (name) => {
  const body = messages.slice(messages.indexOf(`export const ${name}`)).split('\n];')[0];
  return [...body.matchAll(/^\s*(null|"([^"]*)"),\s*\/\/ Lv\.\d+/gm)].map((m) => (m[1] === 'null' ? null : m[2]));
};
const UP = arr('NODE_UP'), DOWN = arr('NODE_DOWN');
if (NAMES.length !== 50 || UP.length !== 50 || DOWN.length !== 50) throw new Error(`읽기 실패 ${NAMES.length}/${UP.length}/${DOWN.length}`);

/** 총점(0~21) → 칸(대표 확정 구간, 구간 안에서는 점수에 비례해 고르게) */
const BANDS = [[0, 5, 1, 4], [6, 11, 5, 9], [12, 16, 10, 14], [17, 20, 15, 22], [21, 21, 25, 25]];
const lvOf = (s) => { const [a, b, l, h] = BANDS.find(([a, b]) => s >= a && s <= b); return a === b ? l : Math.round(l + ((s - a) * (h - l)) / (b - a)); };
const MAP = Array.from({ length: 22 }, (_, s) => lvOf(s));
const lineOf = (lv) => (lv <= 9 ? DOWN[lv - 1] : UP[lv - 1]) ?? DOWN[lv - 1] ?? UP[lv - 1]; // 미래의 나(명령 #93) — Lv.1~9 떨어졌을 때 문장, Lv.10~50 올라왔을 때 문장
const goalOf = (lv) => Math.min(lv + 15, 50); // Lv.50 은 더 갈 칸이 없어 줄을 숨긴다

/** 결과 페이지 설명(120자 안) — 칸마다 다르게 */
const descOf = () => '갓생 테스트 결과 · 나도 해 보기'; // 명령 #91
// 시작 화면 소개 문단(명령 #90) — 버튼 아래 작은 글씨, 검색엔진이 읽는 본문
const INTRO = '텐트부터 건물주까지, 10년 뒤 나는 어디쯤일까요?'; // 명령 #91: 사람이 보는 문구는 한 줄
// 시작 화면 제목·설명(명령 #90 1안) — 검색·공유 미리보기 공용
const SITE_TITLE = '갓생 테스트: 10년 뒤 나는?';
const SITE_DESC = '질문 7개로 보는 10년 뒤 내 모습. 1분이면 끝나요.';
// 서치어드바이저·서치콘솔 소유 확인 — 값을 받으면 NAVER_VERIFY·GOOGLE_VERIFY 로 다시 생성(비어 있으면 넣지 않는다)
const verify = [['naver-site-verification', process.env.NAVER_VERIFY], ['google-site-verification', process.env.GOOGLE_VERIFY]]
  .map(([k, v]) => (v ? `<meta name="${k}" content="${v}">` : `<!-- ${k}: ${k === 'naver-site-verification' ? 'NAVER_VERIFY' : 'GOOGLE_VERIFY'}=값 node tools/gen.mjs -->`)).join('\n');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
writeFileSync(join(OUT, 'data.js'), `// 생성 파일(tools/gen.mjs) — 손으로 고치지 마\nwindow.FT = ${JSON.stringify({ names: NAMES, map: MAP })};\n`);

mkdirSync(join(OUT, 'r'), { recursive: true });
for (let lv = 1; lv <= 50; lv++) {
  const name = NAMES[lv - 1], goal = goalOf(lv);
  const title = `10년 뒤 나는 ${name}`; // 명령 #91
  writeFileSync(join(OUT, 'r', `${lv}.html`), `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(descOf(lv))}">
<link rel="canonical" href="${BASE}r/${lv}.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="습관부자 미래 테스트">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(descOf(lv))}">
<meta property="og:image" content="${BASE}img/og/${lv}.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${BASE}r/${lv}.html">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="../style.css">
</head><body data-lv="${lv}" data-goal="${goal}">
<main class="page result">
  <p id="vs" class="vs" hidden></p>
  <img class="hero" src="../img/sq/${lv}.png" width="340" height="340" alt="${esc(name)}">
  <p class="eyebrow">10년 뒤 당신</p>
  <h1>Lv.${lv} ${esc(name)}</h1>
  <p class="bubble"><b>미래의 나</b> ${esc(lineOf(lv))}</p>
${lv < 50 ? `  <div class="goal"><img src="../img/sq/${goal}.png" width="64" height="64" alt=""><p>주 3번만 지켜도 → <b>Lv.${goal} ${esc(NAMES[goal - 1])}</b></p></div>
` : ''}  <div class="actions">
    <button id="share" class="primary">친구한테 보내기</button>
    <button id="app">앱으로 바꿔 보기</button>
  </div>
  <div id="stores" class="stores" hidden></div>
  <p id="toast" class="toast" hidden></p>
  <a class="again" href="../index.html">다시 해 보기</a>
</main>
<footer>재미로 보는 테스트예요 · 습관부자</footer>
<script src="../data.js"></script><script src="../app.js"></script>
</body></html>
`);
}
// ── 시작 화면(index.html) · sitemap.xml · robots.txt — 도메인이 바뀌면 BASE_URL 로 다시 생성 ──
const ld = { '@context': 'https://schema.org', '@type': 'WebApplication', name: '습관부자 미래 테스트', url: BASE, description: SITE_DESC,
  applicationCategory: 'EntertainmentApplication', operatingSystem: 'Web', inLanguage: 'ko', isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }, publisher: { '@type': 'Organization', name: '습관부자' } };
writeFileSync(join(OUT, 'index.html'), `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(SITE_TITLE)}</title>
<meta name="description" content="${esc(SITE_DESC)}">
<link rel="canonical" href="${BASE}">
${verify}
<meta property="og:type" content="website">
<meta property="og:site_name" content="습관부자 미래 테스트">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="지금 습관 그대로면, 10년 뒤 나는?">
<meta property="og:description" content="${esc(SITE_DESC)}">
<meta property="og:image" content="${BASE}img/og/10.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${BASE}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="stylesheet" href="style.css">
</head><body>
<main class="page">
  <section id="start" class="start">
    <img class="hero" src="img/sq/10.png" width="300" height="300" alt="평범한 직장인">
    <h1>지금 습관 그대로면,<br>10년 뒤 나는?</h1>
    <p class="sub">질문 7개 · 1분이면 끝나요</p>
    <p id="vsInvite" class="vs" hidden></p>
    <button id="go" class="primary">테스트 시작</button>
    <p class="about">${INTRO}</p>
  </section>
  <section id="quiz" class="quiz" hidden>
    <div class="progress"><div id="bar"></div></div>
    <p id="step" class="step"></p>
    <h2 id="q"></h2>
    <div id="opts" class="opts"></div>
  </section>
</main>
<footer>재미로 보는 테스트예요 · 습관부자</footer>
<script src="data.js"></script><script src="app.js"></script>
</body></html>
`);
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
${Array.from({ length: 50 }, (_, i) => `  <url><loc>${BASE}r/${i + 1}.html</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}sitemap.xml\n`);

console.log('MAP', MAP.map((lv, s) => `${s}→${lv}`).join(' '));
