// 습관부자 갓생 테스트(명령 #84 → #96 심리테스트형) — 시작·질문 7개(index.html)와 유형 결과(t/1~8.html) 공용. 빌드 도구 없음.
(function () {
  'use strict';
  var APP_STORE = 'https://apps.apple.com/kr/app/id6820009070';
  // 계측(숫자만, 앱 events 와 분리된 web_events — 명령 #87 적용). 공개(publishable/anon) 키만 — 테이블은 insert 만 허용. 서비스 키 금지
  var EVENTS = { url: 'https://kmomnrmdfhhgkfiqskrp.supabase.co', key: 'sb_publishable_jQszQoPn-KTL14d3KvuqcQ_INczf2jG' };
  // 친구 순위표(명령 #95). #96 시안: 서버에 type 칸(tools/shared_results_type.sql)이 아직 없어 꺼 둔다 — ?demo=1 로 화면만
  var SHARED_ON = true; // 명령 #97: shared_results.type 서버 적용(2026-10-22)

  var store = function (s, k, v) { try { if (v === undefined) return window[s].getItem(k); window[s].setItem(k, v); } catch (e) { return null; } };
  var params = new URLSearchParams(location.search);
  var num = function (v) { var n = parseInt(v, 10); return isNaN(n) ? null : n; };
  var FT = window.FT;

  // 유입: ?src=1 스레드 · 2 카톡 · 3 커뮤니티 · 4 블로그 · 9 광고 — 이 탭에서 처음 본 값을 계속 붙인다
  if (num(params.get('src')) !== null) store('sessionStorage', 'ft_src', String(num(params.get('src'))));
  var SRC = num(store('sessionStorage', 'ft_src'));
  var wid = store('localStorage', 'ft_wid');
  if (!wid) { wid = Math.random().toString(36).slice(2) + Date.now().toString(36); store('localStorage', 'ft_wid', wid); }
  function track(ev, props) {
    var p = Object.assign({}, props || {}, { src: SRC });
    try {
      fetch(EVENTS.url + '/rest/v1/web_events', {
        method: 'POST', keepalive: true,
        headers: { apikey: EVENTS.key, Authorization: 'Bearer ' + EVENTS.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ wid: wid, ev: ev, props: p }),
      }).catch(function () {});
    } catch (e) { /* 계측 실패는 버린다 */ }
  }

  // ── 이름(1~8자, 욕설이면 안 받음) · 조사 ──
  var BAD = ['시발', '씨발', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '븅신', '좆', '존나', 'ㅈㄴ', '개새', '새끼', '지랄', '염병', '미친', '닥쳐', 'fuck', 'shit', 'bitch'];
  var isBad = function (n) { var f = n.toLowerCase().replace(/[\s\d._\-~!@#$%^&*()]+/g, ''); return BAD.some(function (w) { return f.indexOf(w) >= 0; }); };
  var cleanName = function (v) { var n = (v || '').trim().slice(0, 8); return n && !isBad(n) ? n : null; };
  // 받침 있음? 한글은 글자로, 숫자·영문은 읽는 소리로(1 일·L 엘…). 그 밖(기호 등)은 null → 두 조사를 같이 쓴다
  var batchim = function (w) {
    var ch = (w || '').trim().slice(-1), c = ch.charCodeAt(0);
    if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 > 0;
    if (/[0-9]/.test(ch)) return '013678'.indexOf(ch) >= 0;
    if (/[a-z]/i.test(ch)) return 'lmnr'.indexOf(ch.toLowerCase()) >= 0;
    return null;
  };
  var josa = function (w, yes, no) { var b = batchim(w); return w + (b === null ? yes + '(' + no + ')' : b ? yes : no); };
  window.__josa = josa; // 확인용
  var typeName = function (k) { return FT.types[k] ? FT.types[k].name : ''; };
  var lvName = function (lv) { return 'Lv.' + lv + ' ' + FT.names[lv - 1]; };
  var validLv = function (v) { var n = num(v); return n !== null && n >= 1 && n <= 50 ? n : null; };
  var validType = function (v) { var n = num(v); return n !== null && n >= 1 && n <= 8 ? n : null; };
  var $ = function (id) { return document.getElementById(id); };

  // ── 친구 순위표 저장·조회(명령 #95 그대로 + type) ──
  var SHARE_RE = /^[a-f0-9]{24}$/, KEY_RE = /^[a-f0-9]{32}$/;
  var hex = function (n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); };
  var me = function () { var s = store('localStorage', 'ft_share'), k = store('localStorage', 'ft_view'); return SHARE_RE.test(s || '') && KEY_RE.test(k || '') ? { share: s, view: k } : null; };
  function api(path, body) {
    var h = { apikey: EVENTS.key, Authorization: 'Bearer ' + EVENTS.key, 'Content-Type': 'application/json' };
    if (path.indexOf('rpc/') !== 0) h.Prefer = 'return=minimal';
    return fetch(EVENTS.url + '/rest/v1/' + path, { method: 'POST', headers: h, body: JSON.stringify(body) });
  }
  function saveResult(lv, type, parent, name) {
    if (!SHARED_ON) return Promise.resolve();
    var m = me();
    if (m) return api('rpc/my_update', { p_key: m.view, p_lv: lv, p_type: type, p_nickname: name }).catch(function () {});
    var row = { share_id: hex(12), view_key: hex(16), parent_id: parent && SHARE_RE.test(parent) ? parent : null, lv: lv, type: type, nickname: name };
    return api('shared_results', row).then(function (r) {
      if (r.ok) { store('localStorage', 'ft_share', row.share_id); store('localStorage', 'ft_view', row.view_key); }
    }).catch(function () {});
  }
  var DEMO = [ // ?demo=1 — 순위표 시안(나 + 초대한 사람 + 내가 초대한 사람)
    { who: 'inviter', lv: 12, type: 4, nickname: '지민' }, { who: 'me', lv: 20, type: 1, nickname: null },
    { who: 'invited', lv: 9, type: 2, nickname: '도윤' }, { who: 'invited', lv: 6, type: 7, nickname: '하린' },
  ];
  function fetchBoard() {
    if (params.get('demo') === '1') return Promise.resolve(DEMO);
    var m = me();
    if (!SHARED_ON || !m) return Promise.resolve([]);
    return api('rpc/board', { p_key: m.view }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
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
  /** 유형(대표 확정 규칙): 총점 ≥ 18 → 1 · 1~6번 최고-최저 ≤ 1 → 8 · 그 외 1~6번 중 가장 낮은 문항(동점은 앞 번호) → 2~7. 7번은 총점에만 */
  function typeOf(items) {
    var total = items.reduce(function (a, b) { return a + b; }, 0);
    if (total >= 18) return 1;
    var six = items.slice(0, 6);
    if (Math.max.apply(null, six) - Math.min.apply(null, six) <= 1) return 8;
    return six.indexOf(Math.min.apply(null, six)) + 2;
  }
  window.__typeOf = typeOf; // 확인용

  // ── 시작·질문 ──
  if ($('quiz')) {
    var from = SHARE_RE.test(params.get('from') || '') ? params.get('from') : null;
    var fName = cleanName(params.get('n')), fType = validType(params.get('t'));
    if (fType) { // 친구 링크: 맨 위 한 줄, 그림은 작게(이름 칸·버튼이 첫 화면에 보이게)
      $('invite').hidden = false;
      $('invite').textContent = fName ? '친구 ' + josa(fName, '은', '는') + ' ' + typeName(fType) + ', 너는?' : '친구는 ' + typeName(fType) + ', 너는?';
      document.body.classList.add('invited');
    }
    var mine = null;
    try { mine = JSON.parse(store('localStorage', 'ft_result') || 'null'); } catch (e) { mine = null; }
    if (mine && validType(mine.type) && validLv(mine.lv)) { // 다시 방문: 내 결과 보기 · 친구 N명 참여
      $('mine').hidden = false;
      $('mine').href = 't/' + mine.type + '.html?lv=' + mine.lv + '&me=1';
      $('mine').textContent = '내 결과 보기';
      fetchBoard().then(function (rows) {
        var n = rows.filter(function (r) { return r.who === 'invited'; }).length;
        if (n) $('mine').textContent = '내 결과 보기 · 친구 ' + n + '명 참여';
      });
    }
    var input = $('name');
    input.value = store('localStorage', 'ft_name') || '';
    var check = function () {
      var raw = input.value.trim();
      var ok = !!cleanName(raw);
      $('go').disabled = !ok;
      $('nameErr').hidden = !(raw && !ok);
    };
    input.addEventListener('input', check); check();

    var i = 0, items = [];
    var show = function () {
      var q = QUESTIONS[i];
      $('step').textContent = (i + 1) + ' / ' + QUESTIONS.length;
      $('bar').style.width = ((i / QUESTIONS.length) * 100) + '%';
      $('q').textContent = q[0];
      $('opts').innerHTML = '';
      q[1].forEach(function (o) {
        var b = document.createElement('button');
        b.textContent = o[0];
        b.onclick = function () { items.push(o[1]); i++; if (i < QUESTIONS.length) show(); else finish(); };
        $('opts').appendChild(b);
      });
    };
    var finish = function () {
      var score = items.reduce(function (a, b) { return a + b; }, 0);
      var lv = FT.map[score], type = typeOf(items), name = cleanName(input.value);
      track('done', { lv: lv, score: score, type: type });
      store('localStorage', 'ft_name', name);
      store('localStorage', 'ft_result', JSON.stringify({ type: type, lv: lv }));
      var go = function () { location.href = 't/' + type + '.html?lv=' + lv + '&me=1'; };
      saveResult(lv, type, from, name).then(go, go);
    };
    $('go').onclick = function () { if ($('go').disabled) return; track('start'); $('start').hidden = true; $('quiz').hidden = false; show(); };
    return;
  }

  // ── 유형 결과(t/N.html) ──
  var type = validType(document.body.dataset.type);
  var lv = validLv(params.get('lv'));
  var from = SHARE_RE.test(params.get('from') || '') ? params.get('from') : null;
  var isMine = params.get('me') === '1' && !from;
  var who = isMine ? cleanName(store('localStorage', 'ft_name')) : cleanName(params.get('n'));
  if (who) { $('who').hidden = false; $('who').textContent = who + '님은'; }

  if (lv) { // ④ 이대로 10년 뒤 → Lv.N + 미래의 나 + 주 3번만 지켜도
    var goal = Math.min(lv + 15, 50), f = $('future');
    f.innerHTML = '';
    var h = document.createElement('p'); h.className = 'futurehead'; h.textContent = '이대로 10년 뒤 → ' + lvName(lv);
    var b = document.createElement('p'); b.className = 'bubble'; var bb = document.createElement('b'); bb.textContent = '미래의 나'; b.appendChild(bb); b.appendChild(document.createTextNode(' ' + FT.lines[lv - 1]));
    f.appendChild(h); f.appendChild(b);
    if (lv < 50) { var g = document.createElement('p'); g.className = 'goalline'; g.textContent = '주 3번만 지켜도 → ' + lvName(goal); f.appendChild(g); }
    f.hidden = false;
  }

  if (isMine) { // 내 결과: 순위표 + 보내기·앱
    $('mineActions').hidden = false; $('try').hidden = true; $('again').hidden = false;
  } else if (from || validType(params.get('t'))) { // 친구가 보낸 링크: 나도 해 보기(초대 정보 그대로)
    track('compare_open', { vs: lv || 0 });
    $('try').href = '../index.html?t=' + type + '&from=' + (from || '') + (who ? '&n=' + encodeURIComponent(who) : '');
  }

  var toast = function (t) { $('toast').hidden = false; $('toast').textContent = t; };
  function share(url, title) {
    if (navigator.share) {
      navigator.share({ title: title, url: url }).then(function () { track('share', { m: 1 }); }).catch(function () {});
      return;
    }
    var done = function () { track('share', { m: 2 }); toast('링크를 복사했어요'); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('이 링크를 복사해 주세요', url); });
    else prompt('이 링크를 복사해 주세요', url);
  }
  $('share').onclick = function () { // 언제나 내 유형 페이지 + 레벨·이름·내 share_id
    var m = me(), u = new URL(type + '.html', location.href), q = new URLSearchParams();
    if (lv) q.set('lv', lv);
    if (who) q.set('n', who);
    q.set('t', type);
    if (m) q.set('from', m.share);
    u.search = q.toString();
    share(u.toString(), '나는 ' + josa(typeName(type), '이래', '래').replace('(래)', '') + 'ㅋㅋ 너는?');
  };
  $('app').onclick = function () {
    var ua = navigator.userAgent;
    var os = /iPhone|iPad|iPod/.test(ua) ? 1 : /Android/.test(ua) ? 2 : 3;
    track('app_click', { os: os });
    if (os === 1) { location.href = APP_STORE; return; }
    var box = $('stores');
    box.hidden = false;
    box.innerHTML = (os === 3 ? '<a href="' + APP_STORE + '" target="_blank" rel="noopener">iPhone: App Store에서 받기</a>' : '') + '<span>안드로이드는 곧 출시돼요</span>';
  };

  // ⑥ 우리 순위(이름 · 유형 · Lv) — 열 때마다 새로 불러온다
  function showBoard(rows) {
    if (!rows || rows.length < 2) return;
    var anon = 0;
    var list = rows.map(function (r) {
      var name = r.who === 'me' ? '나' : r.nickname || (r.who === 'inviter' ? '초대한 친구' : '익명' + (++anon));
      return { name: name, lv: r.lv, type: r.type, me: r.who === 'me', inviter: r.who === 'inviter' };
    });
    list.sort(function (a, c) { return c.lv - a.lv || (a.me ? -1 : c.me ? 1 : 0); });
    var box = $('board');
    box.innerHTML = '';
    var hh = document.createElement('h3');
    hh.textContent = '우리 순위 ' + list.length + '명 · 나는 ' + (list.findIndex(function (x) { return x.me; }) + 1) + '등';
    var ol = document.createElement('ol');
    list.forEach(function (x, k) {
      var li = document.createElement('li');
      if (x.me) li.className = 'me';
      var cells = [['rk', (k + 1) + ''], ['nm', x.name]];
      if (x.inviter && x.name !== '초대한 친구') cells.push(['tag', '초대']);
      cells.push(['ty', typeName(x.type) || '']);
      cells.push(['lv', 'Lv.' + x.lv]);
      cells.forEach(function (c) { var sp = document.createElement('span'); sp.className = c[0]; sp.textContent = c[1]; li.appendChild(sp); }); // 이름은 textContent 로만
      ol.appendChild(li);
    });
    var note = document.createElement('p');
    note.className = 'note'; note.textContent = '닉네임은 바로 연결된 친구들끼리만 보여요';
    box.appendChild(hh); box.appendChild(ol); box.appendChild(note); box.hidden = false;
  }
  if (isMine || params.get('demo') === '1') fetchBoard().then(showBoard);
})();
