// 결과 그림 50장(명령 #84) — 앱 SVG 장면(src/components/scene → Scene50)을 그대로 PNG 로 뽑는다. 손으로 다시 그리지 않는다.
// 준비: 앱 웹 미리보기 서버(`CI=1 npx expo start --web --port 8093`)를 켜고, playwright 가 있는 곳을 PW 로 준다.
//   PW=/path/to/node_modules/playwright node web/future-test/tools/shots.cjs
// 출력: img/sq/N.png(정사각 680px, 결과·작은 그림) · img/og/N.png(1200×630, 카톡·스레드 미리보기)
const { chromium } = require(process.env.PW || 'playwright');
const { readFileSync } = require('fs');
const { join } = require('path');

const OUT = join(__dirname, '..', 'img');
const BASE = process.env.PREVIEW || 'http://localhost:8093/';
const names = JSON.parse(readFileSync(join(__dirname, '..', 'data.js'), 'utf8').match(/window\.FT = (.*);/)[1]).names;

(async () => {
  const b = await chromium.launch();
  const sq = await b.newContext({ viewport: { width: 390, height: 420 }, deviceScaleFactor: 2 });
  const og = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const p = await sq.newPage();
  const o = await og.newPage();
  for (let lv = 1; lv <= 50; lv++) {
    await p.goto(`${BASE}?shot=v77-face-base-${lv}`, { waitUntil: 'networkidle', timeout: 180000 });
    const svg = p.locator('svg').first();
    await svg.waitFor();
    await p.waitForTimeout(300);
    const file = join(OUT, 'sq', `${lv}.png`);
    await svg.screenshot({ path: file, omitBackground: true });
    const img = `data:image/png;base64,${readFileSync(file).toString('base64')}`;
    await o.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;width:1200px;height:630px;display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;background:#FBF8F2;color:#2B2420;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;word-break:keep-all">
      <img src="${img}" style="width:440px;height:440px;border-radius:40px;flex:none">
      <div style="display:flex;flex-direction:column;gap:18px">
        <div style="font-size:36px;font-weight:800;color:#7A7268">10년 뒤 나는</div>
        <div style="font-size:${names[lv - 1].length > 10 ? 56 : 68}px;font-weight:900;line-height:1.2">Lv.${lv}<br>${names[lv - 1]}</div>
        <div style="font-size:30px;font-weight:800;color:#2E7D4F;margin-top:12px">나도 해 보기 → 습관부자 미래 테스트</div>
      </div></body>`);
    await o.screenshot({ path: join(OUT, 'og', `${lv}.png`) });
    process.stdout.write(`${lv} `);
  }
  await b.close();
  console.log('\nOK');
})().catch((e) => { console.error(e); process.exit(1); });
