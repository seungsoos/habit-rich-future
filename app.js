// 습관부자 미래 테스트(명령 #84) — 시작·질문 7개(index.html)와 결과 페이지(r/N.html) 공용. 빌드 도구 없음.
(function () {
  'use strict';
  var APP_STORE = 'https://apps.apple.com/kr/app/id6820009070';
  // 계측(숫자만, 앱 events 와 분리된 web_events — 명령 #87 적용). 공개(publishable/anon) 키만 — 테이블은 insert 만 허용. 서비스 키 금지
  var EVENTS = { url: 'https://kmomnrmdfhhgkfiqskrp.supabase.co', key: 'sb_publishable_jQszQoPn-KTL14d3KvuqcQ_INczf2jG' };

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
    if (vs) { $('vsInvite').hidden = false; $('vsInvite').textContent = '친구는 ' + lvName(vs) + '. 나는 몇 칸일까요?'; }
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
      location.href = 'r/' + lv + '.html' + (vs ? '?vsr=' + vs : '');
    };
    $('go').onclick = function () { track('start'); $('start').hidden = true; $('quiz').hidden = false; show(); };
    return;
  }

  // ── 결과 ──
  var lv = num(document.body.dataset.lv);
  var shareUrl = function (q) { var u = new URL(lv + '.html', location.href); u.search = q || ''; return u.toString(); };
  var toast = function (t) { $('toast').hidden = false; $('toast').textContent = t; };
  // 공유는 언제나 비교 링크(r/N.html?vs=N) 하나 — 명령 #93
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
    $('vs').hidden = false;
    $('vs').innerHTML = '친구의 결과예요. <a href="../index.html?vs=' + friend + '">나도 해 보고 비교하기</a>';
  } else if (friendDone) {
    $('vs').hidden = false;
    $('vs').textContent = '친구는 ' + lvName(friendDone) + ', 나는 ' + lvName(lv);
  }

  $('share').onclick = function () { share(shareUrl('?vs=' + lv), '나는 ' + lvName(lv) + '. 너는?'); };
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
})();
