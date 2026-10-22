// 습관부자 미래 테스트(명령 #84) — 시작·질문 7개(index.html)와 결과 페이지(r/N.html) 공용. 빌드 도구 없음.
(function () {
  'use strict';
  var APP_STORE = 'https://apps.apple.com/kr/app/id6820009070';
  // 계측(숫자만, 앱 events 와 분리된 web_events — 명령 #87 적용). 공개(publishable/anon) 키만 — 테이블은 insert 만 허용. 서비스 키 금지
  var EVENTS = { url: 'https://kmomnrmdfhhgkfiqskrp.supabase.co', key: 'sb_publishable_jQszQoPn-KTL14d3KvuqcQ_INczf2jG' };
  // 친구 순위표(명령 #95, tools/shared_results.sql). false 면 저장·조회를 안 하고, ?demo=A|B|E 로 화면만 본다
  var SHARED_ON = true; // 명령 #95: 서버 적용(2026-10-22)

  var store = function (s, k, v) { try { if (v === undefined) return window[s].getItem(k); window[s].setItem(k, v); } catch (e) { return null; } };
  var params = new URLSearchParams(location.search);
  var num = function (v) { var n = parseInt(v, 10); return isNaN(n) ? null : n; };

  // 유입: ?src=1 스레드 · 2 카톡 · 3 커뮤니티 · 4 블로그 · 9 광고 — 이 탭에서 처음 본 값을 계속 붙인다
  if (num(params.get('src')) !== null) store('sessionStorage', 'ft_src', String(num(params.get('src'))));
  var SRC = num(store('sessionStorage', 'ft_src'));
  var wid = store('localStorage', 'ft_wid');
  if (!wid) { wid = Math.random().toString(36).slice(2) + Date.now().toString(36); store('localStorage', 'ft_wid', wid); }

  function track(ev, props) {
    var p = Object.assign({}, props || {}, { src: SRC });
    if (!EVENTS.url) return;
    try {
      fetch(EVENTS.url + '/rest/v1/web_events', {
        method: 'POST', keepalive: true,
        headers: { apikey: EVENTS.key, Authorization: 'Bearer ' + EVENTS.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ wid: wid, ev: ev, props: p }),
      }).catch(function () {});
    } catch (e) { /* 계측 실패는 버린다 */ }
  }

  // ── 친구 순위표 저장·조회 ──
  var SHARE_RE = /^[a-f0-9]{24}$/, KEY_RE = /^[a-f0-9]{32}$/;
  var hex = function (n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); };
  var me = function () { var s = store('localStorage', 'ft_share'), k = store('localStorage', 'ft_view'); return SHARE_RE.test(s || '') && KEY_RE.test(k || '') ? { share: s, view: k } : null; };
  function api(path, body) { // 넣기는 응답 본문 없이, rpc 는 결과 JSON
    var h = { apikey: EVENTS.key, Authorization: 'Bearer ' + EVENTS.key, 'Content-Type': 'application/json' };
    if (path.indexOf('rpc/') !== 0) h.Prefer = 'return=minimal';
    return fetch(EVENTS.url + '/rest/v1/' + path, { method: 'POST', headers: h, body: JSON.stringify(body) });
  }
  // 닉네임: 10자, 욕설이면 "익명"(간단 목록 — 띄어쓰기·숫자·기호를 빼고 비교)
  var BAD = ['시발', '씨발', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '븅신', '좆', '존나', 'ㅈㄴ', '개새', '새끼', '지랄', '염병', '미친', '닥쳐', 'fuck', 'shit', 'bitch'];
  function cleanName(v) {
    var n = (v || '').trim().slice(0, 10);
    if (!n) return null;
    var flat = n.toLowerCase().replace(/[\s\d._\-~!@#$%^&*()]+/g, '');
    return BAD.some(function (w) { return flat.indexOf(w) >= 0; }) ? '익명' : n;
  }
  /** 테스트를 끝낸 순간 — 처음이면 한 줄 만들고(초대한 사람 연결), 다시 했으면 lv 만 갱신 */
  function saveResult(lv, parent, nickname) {
    if (!SHARED_ON) return Promise.resolve();
    var m = me();
    if (m) return api('rpc/my_update', { p_key: m.view, p_lv: lv, p_nickname: nickname }).catch(function () {});
    var row = { share_id: hex(12), view_key: hex(16), parent_id: parent && SHARE_RE.test(parent) ? parent : null, lv: lv, nickname: nickname };
    return api('shared_results', row).then(function (r) {
      if (r.ok) { store('localStorage', 'ft_share', row.share_id); store('localStorage', 'ft_view', row.view_key); if (nickname) store('localStorage', 'ft_named', '1'); }
    }).catch(function () {});
  }

  var QUESTIONS = [
    ['아침 알람이 울리면?', [['알람 전에 깬다', 3], ['바로 일어난다', 2], ['5분만…을 세 번', 1], ['알람 끈 기억이 없다', 0]]],
    ['이번 달 운동한 날은?', [['9일 이상', 3], ['4~8일', 2], ['1~3일', 1], ['계단 오른 것도 쳐 주나요?', 0]]],
    ['이번 주 배달앱 주문 횟수는?', [['0번', 3], ['1~2번', 2], ['3~5번', 1], ['사장님이 내 이름 앎', 0]]],
    ['마지막으로 끝까지 읽은 책은?', [['이번 달', 3], ['올해 안에', 2], ['기억이 안 남', 1], ['웹툰도 책인가요?', 0]]],
    ['이번 주 "내일부터 진짜 한다"고 말한 횟수는?', [['0번', 3], ['1번', 2], ['2~3번', 1], ['매일', 0]]],
    ['월급날 사흘 뒤 통장은?', [['거의 그대로', 3], ['조금 줄었다', 2], ['스쳐 지나갔다', 1], ['카드값이 먼저 가져갔다', 0]]],
    ['올해 새해 목표는 지금?', [['진행 중', 3], ['기억은 난다', 2], ['뭐였더라', 1], ['세운 적 없다', 0]]],
  ];
  var $ = function (id) { return document.getElementById(id); };
  var lvName = function (lv) { return 'Lv.' + lv + ' ' + window.FT.names[lv - 1]; };
  var validLv = function (v) { var n = num(v); return n !== null && n >= 1 && n <= 50 ? n : null; };

  // ── 시작·질문 ──
  if ($('quiz')) {
    var vs = validLv(params.get('vs'));
    var from = SHARE_RE.test(params.get('from') || '') ? params.get('from') : null;
    if (vs) { $('vsInvite').hidden = false; $('vsInvite').textContent = '친구는 ' + lvName(vs) + ', 너는?'; }
    if (from && !me()) { $('nick').hidden = false; $('nick').value = store('localStorage', 'ft_nick') || ''; } // 링크로 처음 온 사람만 이름 칸
    var i = 0, score = 0;
    var show = function () {
      var q = QUESTIONS[i];
      $('step').textContent = (i + 1) + ' / ' + QUESTIONS.length;
      $('bar').style.width = ((i / QUESTIONS.length) * 100) + '%';
      $('q').textContent = q[0];
      $('opts').innerHTML = '';
      q[1].forEach(function (o) {
        var b = document.createElement('button');
        b.textContent = o[0];
        b.onclick = function () { score += o[1]; i++; if (i < QUESTIONS.length) show(); else finish(); };
        $('opts').appendChild(b);
      });
    };
    var finish = function () {
      var lv = window.FT.map[score];
      track('done', { lv: lv, score: score });
      var nick = $('nick').hidden ? null : cleanName($('nick').value);
      if (nick) store('localStorage', 'ft_nick', nick);
      var go = function () { location.href = 'r/' + lv + '.html' + (vs ? '?vsr=' + vs : ''); };
      saveResult(lv, from, nick).then(go, go);
    };
    $('go').onclick = function () { track('start'); $('start').hidden = true; $('quiz').hidden = false; show(); };
    return;
  }

  // ── 결과 ──
  var lv = num(document.body.dataset.lv);
  var shareUrl = function (q) { var u = new URL(lv + '.html', location.href); u.search = q || ''; return u.toString(); };
  var toast = function (t) { $('toast').hidden = false; $('toast').textContent = t; };
  // 공유는 언제나 비교 링크 하나 — 내 share_id 가 있으면 붙인다(명령 #93 · #95)
  function share(url, title) {
    if (navigator.share) {
      navigator.share({ title: title, url: url }).then(function () { track('share', { m: 1 }); }).catch(function () {});
      return;
    }
    var done = function () { track('share', { m: 2 }); toast('링크를 복사했어요'); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('이 링크를 복사해 주세요', url); });
    else prompt('이 링크를 복사해 주세요', url);
  }
  var friend = validLv(params.get('vs'));   // 친구가 보낸 비교 링크로 들어옴
  var friendDone = validLv(params.get('vsr')); // 친구 링크로 테스트를 끝내고 온 내 결과
  if (friend) {
    track('compare_open', { vs: friend });
    var via = SHARE_RE.test(params.get('from') || '') ? '&from=' + params.get('from') : '';
    $('vs').hidden = false;
    $('vs').innerHTML = '친구의 결과예요. <a href="../index.html?vs=' + friend + via + '">나도 해 보기</a>';
  } else if (friendDone) {
    $('vs').hidden = false;
    $('vs').textContent = '친구는 ' + lvName(friendDone) + ', 나는 ' + lvName(lv);
  }

  function doShare() {
    var m = me();
    share(shareUrl('?vs=' + lv + (m ? '&from=' + m.share : '')), '나는 ' + lvName(lv) + '. 너는?');
  }
  $('share').onclick = function () {
    // 바로 들어온 사람: 처음 보낼 때 한 번만 이름을 묻는다(링크로 와서 이미 적었으면 묻지 않는다)
    if (me() && store('localStorage', 'ft_named') !== '1' && store('localStorage', 'ft_asked') !== '1') {
      $('nameAsk').hidden = false; $('share').hidden = true; $('askNick').focus(); return;
    }
    doShare();
  };
  $('askGo').onclick = function () {
    var n = cleanName($('askNick').value), m = me();
    store('localStorage', 'ft_asked', '1');
    if (n) store('localStorage', 'ft_named', '1');
    $('nameAsk').hidden = true; $('share').hidden = false;
    if (n && m && SHARED_ON) api('rpc/my_update', { p_key: m.view, p_lv: null, p_nickname: n }).then(loadBoard).catch(function () {});
    doShare();
  };
  $('app').onclick = function () {
    var ua = navigator.userAgent;
    var os = /iPhone|iPad|iPod/.test(ua) ? 1 : /Android/.test(ua) ? 2 : 3;
    track('app_click', { os: os });
    if (os === 1) { location.href = APP_STORE; return; }
    var box = $('stores');
    box.hidden = false;
    // 안드로이드는 지금 비공개 테스트 — 링크는 숨기고 안내만
    box.innerHTML = (os === 3 ? '<a href="' + APP_STORE + '" target="_blank" rel="noopener">iPhone: App Store에서 받기</a>' : '') + '<span>안드로이드는 곧 출시돼요</span>';
  };

  // ── 우리 순위(나 + 초대한 사람 + 내가 초대한 사람) ──
  function showBoard(rows) {
    if (!rows || rows.length < 2) return; // 나 혼자면 안 보인다
    var anon = 0;
    var list = rows.map(function (r) {
      var name = r.who === 'me' ? '나' : r.nickname || (r.who === 'inviter' ? '초대한 친구' : '익명' + (++anon));
      return { name: name, lv: r.lv, me: r.who === 'me', inviter: r.who === 'inviter' };
    });
    list.sort(function (a, b) { return b.lv - a.lv || (a.me ? -1 : b.me ? 1 : 0); });
    var box = $('board');
    box.innerHTML = '';
    var h = document.createElement('h3');
    h.textContent = '우리 순위 ' + list.length + '명 · 나는 ' + (list.findIndex(function (x) { return x.me; }) + 1) + '등';
    var ol = document.createElement('ol');
    list.forEach(function (x, k) {
      var li = document.createElement('li');
      if (x.me) li.className = 'me';
      var cells = [['rk', (k + 1) + ''], ['nm', x.name]];
      if (x.inviter && x.name !== '초대한 친구') cells.push(['tag', '초대']);
      cells.push(['lv', lvName(x.lv)]);
      cells.forEach(function (c) { var sp = document.createElement('span'); sp.className = c[0]; sp.textContent = c[1]; li.appendChild(sp); }); // 닉네임은 textContent 로만
      ol.appendChild(li);
    });
    var note = document.createElement('p');
    note.className = 'note'; note.textContent = '닉네임은 바로 연결된 친구들끼리만 보여요';
    box.appendChild(h); box.appendChild(ol); box.appendChild(note); box.hidden = false;
  }
  var DEMO = { // 화면 시안용 — A 가 B·C 를, B 가 E 를 초대
    A: [{ who: 'me', lv: 12, nickname: '지민' }, { who: 'invited', lv: 20, nickname: '수아' }, { who: 'invited', lv: 7, nickname: null }],
    B: [{ who: 'inviter', lv: 12, nickname: '지민' }, { who: 'me', lv: 20, nickname: '수아' }, { who: 'invited', lv: 9, nickname: '도윤' }],
    E: [{ who: 'inviter', lv: 20, nickname: '수아' }, { who: 'me', lv: 9, nickname: '도윤' }],
  };
  function loadBoard() {
    var m = me();
    if (!SHARED_ON || !m) return;
    api('rpc/board', { p_key: m.view }).then(function (r) { return r.ok ? r.json() : []; }).then(showBoard).catch(function () {});
  }
  if (!friend) {
    if (DEMO[params.get('demo')]) showBoard(DEMO[params.get('demo')]);
    else loadBoard();
  }
})();
