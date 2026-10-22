// 유형 공유 미리보기 8장(명령 #96) — 기존 칸 그림(img/sq/N.png)에 유형 이름만 얹는다. 새로 그리지 않는다.
//   node tools/gen.mjs && PW=/path/to/node_modules/playwright node tools/type_og.cjs  →  img/type/1~8.png(1200×630)
const { chromium } = require(process.env.PW || 'playwright');
const { readFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const IMG = join(__dirname, '..', 'img');
const types = JSON.parse(readFileSync(join(__dirname, 'types.json'), 'utf8'));
(async () => {
  mkdirSync(join(IMG, 'type'), { recursive: true });
  const b = await chromium.launch();
  const o = await (await b.newContext({ viewport: { width: 1200, height: 630 } })).newPage();
  for (const t of types) {
    const img = `data:image/png;base64,${readFileSync(join(IMG, 'sq', `${t.scene}.png`)).toString('base64')}`;
    await o.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;width:1200px;height:630px;display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;background:#FBF8F2;color:#2B2420;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;word-break:keep-all">
      <img src="${img}" style="width:440px;height:440px;border-radius:40px;flex:none">
      <div style="display:flex;flex-direction:column;gap:18px">
        <div style="font-size:36px;font-weight:800;color:#7A7268">나는</div>
        <div style="font-size:${t.name.length > 8 ? 64 : 76}px;font-weight:900;line-height:1.2">${t.name}</div>
        <div style="font-size:30px;font-weight:800;color:#2E7D4F;margin-top:12px">너는? → 습관부자 갓생 테스트</div>
      </div></body>`);
    await o.screenshot({ path: join(IMG, 'type', `${t.k}.png`) });
    process.stdout.write(`${t.k} `);
  }
  await b.close(); console.log('OK');
})().catch((e) => { console.error(e); process.exit(1); });
