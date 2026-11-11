// 공유 미리보기(1200×630) — 첫 화면 1장 + 유형 8장(명령 #96 → #177-1 GPT 그림). 그림은 img/art/lvNN.webp(앱 assets/art 그대로), 새로 그리지 않는다.
//   node tools/gen.mjs && PW=/path/to/node_modules/playwright node tools/type_og.cjs  →  img/share/home.jpg · img/share/type-1~8.jpg(JPG — 용량)
const { chromium } = require(process.env.PW || 'playwright');
const { readFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const IMG = join(__dirname, '..', 'img');
const types = JSON.parse(readFileSync(join(__dirname, 'types.json'), 'utf8'));
const art = (lv) => `data:image/webp;base64,${readFileSync(join(IMG, 'art', `lv${String(lv).padStart(2, '0')}.webp`)).toString('base64')}`;
const BODY = "margin:0;width:1200px;height:630px;box-sizing:border-box;background:#FBF8F2;color:#2B2420;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;word-break:keep-all";
(async () => {
  mkdirSync(join(IMG, 'share'), { recursive: true });
  const b = await chromium.launch();
  const o = await (await b.newContext({ viewport: { width: 1200, height: 630 } })).newPage();
  // 첫 화면: 그림 가운데 + 제목
  await o.setContent(`<!doctype html><meta charset="utf-8"><body style="${BODY};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px">
    <img src="${art(10)}" style="width:430px;height:430px;border-radius:40px">
    <div style="font-size:56px;font-weight:900;letter-spacing:-1px">지금 습관 그대로면, 10년 뒤 나는?</div></body>`);
  await o.waitForLoadState('networkidle');
  await o.screenshot({ path: join(IMG, 'share', 'home.jpg'), type: 'jpeg', quality: 85 });
  for (const t of types) {
    await o.setContent(`<!doctype html><meta charset="utf-8"><body style="${BODY};display:flex;align-items:center;gap:56px;padding:0 80px">
      <img src="${art(t.scene)}" style="width:440px;height:440px;border-radius:40px;flex:none">
      <div style="display:flex;flex-direction:column;gap:18px">
        <div style="font-size:36px;font-weight:800;color:#7A7268">나는</div>
        <div style="font-size:${t.name.length > 8 ? 64 : 76}px;font-weight:900;line-height:1.2">${t.name}</div>
        <div style="font-size:30px;font-weight:800;color:#2E7D4F;margin-top:12px">너는? → 습관부자 갓생 테스트</div>
      </div></body>`);
    await o.screenshot({ path: join(IMG, 'share', `type-${t.k}.jpg`), type: 'jpeg', quality: 85 });
    process.stdout.write(`${t.k} `);
  }
  await b.close(); console.log('OK');
})().catch((e) => { console.error(e); process.exit(1); });
