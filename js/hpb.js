// ============================================================
//  hpb.js — 逓信省符牒局 頁即席組立機 乙型（俗稱: ホームページビルダー）
//  附属 演出符牒集「賑ヤカシ甲類」
//
//  當局技手ガ舶來ノ「個人頁（ホームページ）」文化ヲ研究シタ所、
//  頁ト云フモノハ 賑ヤカデアレバアル程 文明的 デアルコトガ判明セリ。
//  依ツテ以下ノ演出ヲ謹製ス。
//    一、櫻吹雪（花瓣自動落下裝置）
//    二、鼠標軌跡（カーソルニ追従スル光ノ粉）
//    三、點滅（blink）復活術 — 近代閲覧機ハ點滅ヲ廢止セリ。不敬ナリ。
//    四、題名電光掲示（題名欄ヲ勝手ニ流レル文字）
//
//  全テ閲覧者ノ計算機上デ動ク。電信費ハ掛カラヌ（電氣代ハ掛カル）。
// ============================================================

(function () {
  'use strict';

  // --- 三、點滅復活術 ---------------------------------------
  // 曾テ blink ナル榮光ノ標識（タグ）存在セリ。近代閲覧機ハ
  // 「目ニ悪イ」トノ理由デ之ヲ廢止セリ。目ニ悪イノハ承知ノ上デ
  // 光ラセルノガ演出トイフモノデアル。茲ニ勅命ヲ以テ復活ス。
  var style = document.createElement('style');
  style.type = 'text/css';
  style.textContent =
    '@keyframes hpb-blink { 0%,49% { visibility: visible; } 50%,100% { visibility: hidden; } }\n' +
    'blink, .hpb-blink { animation: hpb-blink 1s step-start infinite; }\n' +
    '@keyframes hpb-fall { 0% { transform: translate(0,-40px) rotate(0deg); opacity:.95; }' +
    ' 100% { transform: translate(var(--hpb-sway,60px),105vh) rotate(340deg); opacity:.55; } }\n' +
    '.hpb-hana { position: fixed; top: 0; z-index: 9999; pointer-events: none;' +
    ' animation: hpb-fall linear forwards; user-select: none; }\n' +
    '@keyframes hpb-kira { 0% { opacity:1; transform: scale(1) rotate(0deg); }' +
    ' 100% { opacity:0; transform: scale(.2) rotate(90deg) translateY(14px); } }\n' +
    '.hpb-kira { position: fixed; z-index: 9999; pointer-events: none;' +
    ' animation: hpb-kira .9s ease-out forwards; user-select: none; }\n' +
    '@keyframes hpb-new { 0%,49% { color:#FF0000; } 50%,100% { color:#FFD700; } }\n' +
    '.hpb-new { font-weight: bold; font-size: 12px; animation: hpb-new .8s step-start infinite; }\n' +
    '.hpb-counter { display: inline-block; background:#000; border: 2px inset #888;' +
    ' padding: 2px 4px; letter-spacing: 2px; font-family: "Courier New", monospace;' +
    ' color:#33FF33; font-weight: bold; text-shadow: 0 0 4px #33FF33; }';
  document.getElementsByTagName('head')[0].appendChild(style);

  // --- 一、櫻吹雪 ---------------------------------------------
  // 花瓣ハ「❀」ヲ用フ。本物ノ櫻ヨリ經費節減。散ルコト自體ニ
  // 政治的含意ハ無イ（無イト云ッタラ無イ。特高警察 確認済）。
  var HANA = ['❀', '❀', '✿', '❁'];
  var IRO = ['#FFB7C5', '#FFC0CB', '#F8A8B8', '#FFD9E0'];
  function chiru() {
    if (document.hidden) return;
    var petals = document.getElementsByClassName('hpb-hana');
    if (petals.length > 14) return; // 花瓣過多ハ電氣ノ無駄遣ヒ（逓信省訓令）
    var p = document.createElement('span');
    p.className = 'hpb-hana';
    p.textContent = HANA[Math.floor(Math.random() * HANA.length)];
    p.style.left = Math.floor(Math.random() * 100) + 'vw';
    p.style.color = IRO[Math.floor(Math.random() * IRO.length)];
    p.style.fontSize = (12 + Math.floor(Math.random() * 12)) + 'px';
    p.style.setProperty('--hpb-sway', (Math.random() * 160 - 80) + 'px');
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    document.body.appendChild(p);
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 13000);
  }
  if (!window.HPB_NO_SAKURA) setInterval(chiru, 700);

  // --- 二、鼠標軌跡（光ノ粉） ---------------------------------
  // 鼠標（マウス）ノ通ッタ跡ニ金色ノ光ガ散ル。實用性: 皆無。
  // 文明度: 極大。之ゾ個人頁文化ノ精髄ナリ。
  var lastKira = 0;
  document.addEventListener('mousemove', function (e) {
    var now = (typeof performance !== 'undefined') ? performance.now() : 0;
    if (now - lastKira < 60) return; // 光ノ粉ニモ配給制限アリ（戰時ニ非ズトモ節約）
    lastKira = now;
    var k = document.createElement('span');
    k.className = 'hpb-kira';
    k.textContent = Math.random() < 0.2 ? '✧' : '✦';
    k.style.left = (e.clientX + 6) + 'px';
    k.style.top = (e.clientY + 8) + 'px';
    k.style.color = Math.random() < 0.15 ? '#FF6688' : '#FFD700';
    k.style.fontSize = (8 + Math.floor(Math.random() * 8)) + 'px';
    document.body.appendChild(k);
    setTimeout(function () { if (k.parentNode) k.parentNode.removeChild(k); }, 950);
  });

  // --- 四、題名電光掲示 ---------------------------------------
  // 題名欄（タイトルバー）ノ文字ガ右カラ左ヘ流レル。
  // 電光掲示板ハ銀座尾張町ニ在ルガ、之ハ貴方ノ閲覧機ニ在ル。
  // ※ 幀組（frameset）ノ場合、題名ハ親幀ノ所有物ナリ。
  //    依ツテ親幀（top）ニ上申シテ書換ヘテ貰フ。官僚制トハ斯クアルベシ。
  // --- 五、御國歌 自動奉奏ノ上申係 -----------------------------
  // 奉奏裝置ハ目録幀（menu）ニ常駐ス。然ルニ閲覧機ノ規約ニ依リ、
  // 音ハ「閲覧者ノ操作」ガ無クバ鳴ラセヌ。依ツテ何レノ幀デアレ、
  // 閲覧者ガ最初ニ何カヲ叩イタ瞬間、目録幀ニ「鳴ラセ」ト上申スル。
  // 幀ノ壁ヲ越エル報告書。之ゾ縦割リ行政ヲ超克セル模範事例ナリ。
  function bgmJousin() {
    try {
      var g = window.GAGAKU || (top.frames['menu'] && top.frames['menu'].GAGAKU);
      if (g) g.kickstart();
    } catch (e) { /* 上申却下。特高警察ニハ屆ケナイデオク。 */ }
  }
  ['click', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, bgmJousin, true);
  });

  var DENKO = '◆◇ 大日本帝國憲法 公式頁 ◇◆ 不磨ノ大典・本日モ正常稼働中 ◆◇ ';
  var denkoPos = 0;
  if (!window.HPB_NO_TICKER) {
    setInterval(function () {
      try {
        top.document.title = DENKO.slice(denkoPos) + DENKO.slice(0, denkoPos);
        denkoPos = (denkoPos + 1) % DENKO.length;
      } catch (e) { /* 上申却下。左樣ナ日モアル。 */ }
    }, 400);
  }
})();
