// ============================================================
//  gagaku.js — 宮内省式部職樂部 監修（自稱）
//  御國歌「君が代」電子奉奏裝置（俗稱: MIDI係）
//
//  曾テ個人頁ニハ必ズ MIDI ナル電子雅樂ガ流レテヰタ。
//  頁ヲ開イタ途端ニ音ガ鳴ル。之ゾ文明開化ノ音ナリ。
//  然ルニ近代閲覧機ハ「自動奉奏（autoplay）」ヲ禁ジタ。
//  御國歌ヲ勝手ニ止メルトハ不敬千萬ナレド、規約ニハ勝テヌ。
//  依ツテ臣民各自、釦ヲ押シテ奉奏サレタシ（一億總指揮者）。
//
//  音源ハ「音波自動生成術（Web Audio API）」ニ依ル。
//  外部檔案・外部樂團ヘノ依存: 零。樂士ノ人件費: 零。
//  正調 壱越調・全四十音・十一小節。出典: 明治十三年 宮内省雅樂課。
//  ※ 本物ノ MIDI 檔案（kimigayo.mid）モ配布中。骨董品トシテ御愛藏アレ。
// ============================================================

(function () {
  'use strict';

  // --- 樂譜（御雅樂課 記譜係 謹寫・正調） ---------------------
  // 準據: 明治二十六年八月十二日 文部省告示第三號別冊
  //       「祝日大祭日歌詞並樂譜」（官報第三千三十七號附録）
  // [MIDI音高, 拍數]。D4=62。壱越調（主音レ）。四分ノ四拍子・全十一小節。
  // 休符ハ無シ。息繼ギ（breathe）ハ奏者ノ裁量ナリ（機械ニ肺ハ無イガ）。
  // 先ノ版ハ「のー」「てー」ヲ一拍デ切ッテ居タ。記譜係ハ二度目ノ轉勤トナッタ。
  var GAKUFU = [
    [62, 1], [60, 1], [62, 1], [64, 1],           // き み が(〜ミ)
    [67, 1], [64, 1], [62, 2],                    // よ(〜ミ) はー
    [64, 1], [67, 1], [69, 1], [67, 0.5], [69, 0.5], // ち よ に(〜ソラ)
    [74, 1], [71, 1], [69, 1], [67, 1],           // や ち よ に
    [64, 1], [67, 1], [69, 2],                    // さ ざ れー
    [74, 1], [72, 1], [74, 2],                    // い し のー（高ク歌フ所ナリ）
    [64, 1], [67, 1], [69, 1], [67, 1],           // い わ お と
    [64, 1.5], [67, 0.5], [62, 2],                // なー り てー
    [69, 1], [72, 1], [74, 2],                    // こ け のー
    [72, 1], [74, 1],                             // む(〜レ)
    [69, 1], [67, 1],                             // す(〜ソ)
    [69, 1], [67, 0.5], [64, 0.5], [62, 2]        // ま(〜ソミ) でー
  ];
  var HAKU = 60 / 69;   // 一拍ノ長サ（毎分六十九拍。エッケルト版ハ七十、之ハ官廳ラシク一分引ク）
  var MA = 3.0;         // 奏了後ノ「間」。雅樂ハ間ガ九割（樂部談）

  var ctx = null;       // 音波發生器（初回奉奏時ニ點火ス）
  var master = null;
  var playing = false;
  var loopTimer = null;

  function hertz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  // --- 一音ノ發音（笙風・廉價 GM 音源ノ趣） -------------------
  function hitoRoto(when, midi, beats) {
    var dur = beats * HAKU;
    var f = hertz(midi);
    var o1 = ctx.createOscillator();      // 主聲部
    var o2 = ctx.createOscillator();      // 副聲部（微カニ調子ヲ外シ厚ミヲ出ス）
    o1.type = 'triangle';
    o2.type = 'sawtooth';
    o1.frequency.value = f;
    o2.frequency.value = f;
    o2.detune.value = 6;

    var vib = ctx.createOscillator();     // 顫音（ビブラート）係
    var vibGain = ctx.createGain();
    vib.frequency.value = 5.2;
    vibGain.gain.value = 3.5;
    vib.connect(vibGain);
    vibGain.connect(o1.detune);
    vibGain.connect(o2.detune);

    var lp = ctx.createBiquadFilter();    // 濾波器（角ヲ取ル。音ニモ礼儀）
    lp.type = 'lowpass';
    lp.frequency.value = 2100;
    lp.Q.value = 0.6;

    var g = ctx.createGain();             // 音量封筒（envelope）
    var v = 0.14;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(v, when + 0.05);
    g.gain.setValueAtTime(v, when + dur - 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.22);

    var g2 = ctx.createGain();
    g2.gain.value = 0.35;                 // 副聲部ハ控ヘ目ニ（分ヲ辨ヘヨ)
    o1.connect(lp);
    o2.connect(g2);
    g2.connect(lp);
    lp.connect(g);
    g.connect(master);
    o1.start(when); o2.start(when); vib.start(when);
    o1.stop(when + dur + 0.3); o2.stop(when + dur + 0.3); vib.stop(when + dur + 0.3);
  }

  // --- 通奏低音（主音レノ持續音。雅樂ノ「調子」） -------------
  function jiOto(when, totalDur) {
    var o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = hertz(50);        // D3。地ノ底カラ國體ヲ支ヘル音
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.035, when + 1.2);
    g.gain.setValueAtTime(0.035, when + totalDur - 1.0);
    g.gain.exponentialRampToValueAtTime(0.0001, when + totalDur + 0.4);
    o.connect(g);
    g.connect(master);
    o.start(when);
    o.stop(when + totalDur + 0.5);
  }

  function issou(startAt) {               // 一奏（全曲一回分ノ豫約）
    var t = startAt;
    var total = 0;
    var i;
    for (i = 0; i < GAKUFU.length; i++) total += GAKUFU[i][1] * HAKU;
    jiOto(t, total);
    for (i = 0; i < GAKUFU.length; i++) {
      if (GAKUFU[i][0] > 0) hitoRoto(t, GAKUFU[i][0], GAKUFU[i][1]); // 0ハ休符。音ヲ出サヌノモ奉奏ノ内
      t += GAKUFU[i][1] * HAKU;
    }
    return total;
  }

  function ensou() {                      // 奉奏（輪奏。止メルマデ續ク）
    if (!playing) return;
    var total = issou(ctx.currentTime + 0.15);
    loopTimer = setTimeout(ensou, (total + MA) * 1000);
  }

  // --- 奉奏開始／停止 ---------------------------------------
  var userStopped = false;  // 臣民ガ自ラ停止セシ場合、勝手ニ再開セヌ（temporary な思想ノ自由）

  function hajime() {                     // 實際ニ音ヲ出ス係
    if (playing) return;
    playing = true;
    ensou();
    sirase('on');
  }

  function housou() {
    if (playing) return;
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        alert('御使用ノ閲覧機ハ音波自動生成術ニ對應シテ居リマセヌ。\n各自、心ノ中デ奉唱サレタシ。');
        return;
      }
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'running') { hajime(); return; }
    // 自動奉奏ヲ閲覧機ニ拒否サレタ場合（不敬ナレド規約ナリ）、
    // 閲覧者ノ最初ノ一擧手一投足ヲ以テ「奉奏ノ御意思アリ」ト見做シ開始ス。
    ctx.resume().then(function () {
      if (ctx && ctx.state === 'running') hajime();
      else sirase('wait');
    }).catch(function () { sirase('wait'); });
    if (ctx.state !== 'running') sirase('wait');
  }

  function teisi() {
    playing = false;
    if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
    if (ctx) ctx.close().catch(function () {});
    ctx = null; master = null;
    sirase('off');
  }

  // --- 表示係 -------------------------------------------------
  function sirase(mode) {
    var b = document.getElementById('bgm-button');
    var s = document.getElementById('bgm-state');
    if (b) b.value = (mode === 'on') ? '■ 停止（不敬）' : '♪ 奉奏';
    if (s) {
      if (mode === 'on') s.innerHTML = '<blink>♪</blink> 御國歌 奉奏中 <blink>♪</blink><br>（謹ンデ拜聽セヨ）';
      else if (mode === 'wait') s.innerHTML = '奉奏待機中……<br>（頁ノ何處カヲ一度<br>叩カレタシ。閲覧機ノ<br>規約ニテ候）';
      else s.innerHTML = '停止中<br>（釦ヲ押シテ奉奏）';
    }
  }

  // --- 結線係 -------------------------------------------------
  // 釦（menu.html）、及ビ 他幀カラノ上申（hpb.js 經由）ヲ受ケ付ケル。
  window.GAGAKU = {
    toggle: function () {
      if (playing) { userStopped = true; teisi(); }
      else { userStopped = false; housou(); }
    },
    // 自動奉奏ノ蹴リ出シ。臣民ガ自ラ止メタ場合ハ何モセヌ。
    kickstart: function () { if (!playing && !userStopped) housou(); }
  };

  // --- 自動奉奏（頁ヲ開イタラ鳴ル。之ゾ個人頁ノ正調） --------
  // 一度デモ當域（サイト）ト遣リ取リシタ閲覧機ナラバ即座ニ鳴ル。
  // 初見ノ閲覧機ハ「待機」トナリ、最初ノ操作デ鳴ル。規約ニハ勝テヌ。
  housou();
  ['click', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function () { window.GAGAKU.kickstart(); }, true);
  });
})();
