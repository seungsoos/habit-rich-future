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

// ── 유형 8개(명령 #96, 대표 확정본 그대로). two = 약점 유형(2~7)의 고정 2줄(명령 #99) — 첫 줄은 내 실제 답(app.js ANSWER) · 그림은 기존 50칸 장면에서 고른 칸(scene) ──
const TYPES = [
  null,
  { name: '갓생 그 자체', scene: 40, tags: ['#알람전기상', '#루틴장인', '#쉬는날도바쁨'], lines: ['알람보다 먼저 일어나요.', '계획표에 줄 긋는 게 취미예요.', '쉬는 날에도 뭔가 하고 있어요.'], good: 8, bad: 6 },
  { name: '알람 스누즈 장인', scene: 10, tags: ['#5분만', '#지각직전', '#그래도출근'], lines: ['알람을 세 번 끄고 일어나요.', '아침밥은 늘 생략이에요.', '일어나기만 하면 하루는 잘 굴러가요.'], good: 1, bad: 6, two: ['아침밥은 늘 생략이에요.', '일어나기만 하면 하루는 잘 굴러가요.'] },
  { name: '운동은 마음으로', scene: 44, tags: ['#헬스장기부천사', '#운동복부자', '#엘리베이터파'], lines: ['운동복은 많은데 땀은 안 나요.', '운동 영상은 끝까지 봐요.', '계단 앞에서 엘리베이터를 기다려요.'], good: 4, bad: 1, two: ['운동복은 많은데 땀은 안 나요.', '운동 영상은 끝까지 봐요.'] },
  { name: '배달앱 VIP', scene: 15, tags: ['#사장님안녕하세요', '#최소주문맞추기', '#리뷰이벤트'], lines: ['냉장고보다 배달앱을 먼저 열어요.', '최소 주문 금액은 꼭 맞춰요.', '메뉴 고르는 데 20분 걸려요.'], good: 3, bad: 7, two: ['냉장고보다 배달앱을 먼저 열어요.', '최소 주문 금액은 꼭 맞춰요.'] },
  { name: '책은 사는 것까지', scene: 22, tags: ['#책장인테리어', '#책갈피는3쪽', '#서점은좋아'], lines: ['서점에 가면 기분이 좋아져요.', '산 책은 많은데 읽은 책은 적어요.', '책갈피가 늘 앞쪽에 있어요.'], good: 6, bad: 1, two: ['서점에 가면 기분이 좋아져요.', '책갈피가 늘 앞쪽에 있어요.'] },
  { name: '내일부터 진짜', scene: 9, tags: ['#월요일부터', '#계획은완벽', '#다이어리는3월까지'], lines: ['계획 세울 때가 제일 신나요.', '"내일부터"를 매일 말해요.', '시작만 하면 의외로 잘해요.'], good: 5, bad: 1, two: ['계획 세울 때가 제일 신나요.', '시작만 하면 의외로 잘해요.'] },
  { name: '통장 스쳐가는 낭만파', scene: 11, tags: ['#월급순삭', '#오늘만산다', '#카드값은미래의나'], lines: ['월급날이 제일 행복해요. 사흘 동안만.', '기분 따라 결제해요.', '카드값은 미래의 나한테 맡겨요.'], good: 8, bad: 4, two: ['월급날이 제일 행복해요. 사흘 동안만.', '기분 따라 결제해요.'] },
  { name: '평화로운 현상 유지', scene: 19, tags: ['#무난함', '#중간은간다', '#하던대로'], lines: ['크게 망하지도 뜨지도 않아요.', '하던 대로 하는 게 편해요.', '마음만 먹으면 금방 올라가요.'], good: 1, bad: 7 },
];
const DESC = '갓생 테스트 결과 · 나도 해 보기'; // 명령 #91
const INTRO = '텐트부터 건물주까지, 10년 뒤 나는 어디쯤일까요?'; // 명령 #91: 사람이 보는 문구는 한 줄
const SITE_TITLE = '갓생 테스트: 10년 뒤 나는?';
const SITE_DESC = '질문 7개로 보는 10년 뒤 내 모습. 1분이면 끝나요.';
// 서치어드바이저·서치콘솔 소유 확인(구글은 명령 #100 서치콘솔 'URL 접두어' 속성 값 — 지우면 소유 확인이 풀린다) — 값을 받으면 NAVER_VERIFY·GOOGLE_VERIFY 로 다시 생성(비어 있으면 넣지 않는다)
const verify = [['naver-site-verification', process.env.NAVER_VERIFY], ['google-site-verification', process.env.GOOGLE_VERIFY ?? 'B2sYDFC_048pgPvN8QG93rnG0qAO0r5gzStSSgMSkoU']]
  .map(([k, v]) => (v ? `<meta name="${k}" content="${v}">` : `<!-- ${k}: ${k === 'naver-site-verification' ? 'NAVER_VERIFY' : 'GOOGLE_VERIFY'}=값 node tools/gen.mjs -->`)).join('\n');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const og = (title, img, url, desc) => `<meta property="og:type" content="website">
<meta property="og:site_name" content="습관부자 갓생 테스트">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">`;
writeFileSync(join(OUT, 'data.js'), `// 생성 파일(tools/gen.mjs) — 손으로 고치지 마\nwindow.FT = ${JSON.stringify({
  names: NAMES, map: MAP, lines: NAMES.map((_, i) => lineOf(i + 1)),
  types: TYPES.map((t) => (t ? { name: t.name, scene: t.scene } : null)),
})};\n`);

// ── 유형 페이지 t/1~8.html — 공유 미리보기는 유형별(카톡·스레드는 JS 를 안 읽는다). 이름·레벨·초대 정보는 쿼리로 ──
mkdirSync(join(OUT, 't'), { recursive: true });
TYPES.forEach((t, k) => {
  if (!t) return;
  const title = `나는 ${t.name}${/[가-힣]$/.test(t.name) && (t.name.charCodeAt(t.name.length - 1) - 0xac00) % 28 ? '이래' : '래'}ㅋㅋ 너는?`; // 받침 있으면 '이래'(장인이래)
  writeFileSync(join(OUT, 't', `${k}.html`), `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t.name)} | 갓생 테스트</title>
<meta name="description" content="${esc(t.lines.join(' '))}">
<link rel="canonical" href="${BASE}t/${k}.html">
${og(title, `${BASE}img/type/${k}.png`, `${BASE}t/${k}.html`, DESC)}
<link rel="stylesheet" href="../style.css">
</head><body data-type="${k}">
<main class="page result">
  <p id="who" class="who" hidden></p>
  <h1 class="typename">${esc(t.name)}</h1>
  <img class="hero" src="../img/sq/${t.scene}.png" width="340" height="340" alt="${esc(t.name)}">
  <p class="tags">${t.tags.map(esc).join(' ')}</p>
  <section class="card"><h3>이런 사람이에요</h3><ul id="lines" class="lines">${(t.two ?? t.lines).map((l) => `<li>${esc(l)}</li>`).join('')}</ul></section>
  <section id="future" class="card future" hidden></section>
  <section class="card match">
    <p><b>잘 맞는</b> <a href="${t.good}.html">${esc(TYPES[t.good].name)}</a></p>
    <p><b>안 맞는</b> <a href="${t.bad}.html">${esc(TYPES[t.bad].name)}</a></p>
  </section>
  <section id="board" class="board" hidden></section>
  <div id="mineActions" class="actions" hidden>
    <button id="share" class="primary">친구한테 보내기</button>
    <button id="app">앱으로 바꿔 보기</button>
  </div>
  <a id="try" class="btnlink primary" href="../index.html">나도 해 보기</a>
  <div id="stores" class="stores" hidden></div>
  <p id="toast" class="toast" hidden></p>
  <a id="again" class="again" href="../index.html" hidden>다시 해 보기</a>
</main>
<footer>재미로 보는 테스트예요 · 습관부자</footer>
<script src="../data.js"></script><script src="../app.js"></script>
</body></html>
`);
});

// ── 예전 결과 링크 r/N.html — 이미 퍼진 링크가 깨지지 않게 시작 화면으로 보낸다(미리보기 og 는 그대로) ──
mkdirSync(join(OUT, 'r'), { recursive: true });
for (let lv = 1; lv <= 50; lv++) {
  writeFileSync(join(OUT, 'r', `${lv}.html`), `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>10년 뒤 나는 ${esc(NAMES[lv - 1])}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${BASE}">
${og(`10년 뒤 나는 ${NAMES[lv - 1]}`, `${BASE}img/og/${lv}.png`, `${BASE}r/${lv}.html`, DESC)}
<meta http-equiv="refresh" content="0; url=../index.html">
<script>location.replace('../index.html' + location.search)</script>
</head><body><a href="../index.html">갓생 테스트 하러 가기</a></body></html>
`);
}

// ── 시작 화면(index.html) · sitemap.xml · robots.txt — 도메인이 바뀌면 BASE_URL 로 다시 생성 ──
const ld = { '@context': 'https://schema.org', '@type': 'WebApplication', name: '습관부자 갓생 테스트', url: BASE, description: SITE_DESC,
  applicationCategory: 'EntertainmentApplication', operatingSystem: 'Web', inLanguage: 'ko', isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }, publisher: { '@type': 'Organization', name: '습관부자' } };
writeFileSync(join(OUT, 'index.html'), `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(SITE_TITLE)}</title>
<meta name="description" content="${esc(SITE_DESC)}">
<link rel="canonical" href="${BASE}">
${verify}
${og('지금 습관 그대로면, 10년 뒤 나는?', `${BASE}img/og/10.png`, BASE, SITE_DESC)}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="stylesheet" href="style.css">
</head><body>
<main class="page">
  <section id="start" class="start">
    <a id="mine" class="mine" hidden></a>
    <p id="invite" class="invite" hidden></p>
    <img class="hero" src="img/sq/10.png" width="300" height="300" alt="평범한 직장인">
    <h1>지금 습관 그대로면,<br>10년 뒤 나는?</h1>
    <p class="sub">질문 7개 · 1분이면 끝나요</p>
    <input id="name" class="nick" maxlength="8" placeholder="이름" autocomplete="off">
    <p id="nameErr" class="hint" hidden>다른 이름으로 써 주세요</p>
    <button id="go" class="primary" disabled>테스트 시작</button>
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
${TYPES.map((t, k) => (t ? `  <url><loc>${BASE}t/${k}.html</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>` : '')).filter(Boolean).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}sitemap.xml\n`);
writeFileSync(join(HERE, 'types.json'), JSON.stringify(TYPES.map((t, k) => (t ? { k, name: t.name, scene: t.scene } : null)).filter(Boolean))); // tools/type_og.cjs 가 읽는다

console.log('MAP', MAP.map((lv, s) => `${s}→${lv}`).join(' '));
