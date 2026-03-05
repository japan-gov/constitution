// ============================================================
//  teikoku.js — 大日本帝國 統治機構（帝國コンソール用）
//
//  本檔ハ帝國電網ノ最先端技術「自動演算符牒（JavaScript）」デ
//  書イテアル。逓信省符牒局ノ技手ガ電文編集機デ一字一句手書キシタ。
//  手書キノ符牒ガソノママ閲覧機上ヲ走ル。實ニ氣持チガヨイ。
//
//  統治機構ハ全部閲覧者ノ計算機上デ動ク（電信費節約ノ爲）。
//  命令符牒（POST /api/...）ハ帝國電信規約ニ準ズル。
//  中デ何ガ起キルカハ當局ノ關知スル所デハナイ。ウチハ配信係デアル。
// ============================================================

var TEIKOKU = {

  // --- 國體符牒（不變。改竄ハ大逆罪） ---
  sovereignty: 'absolute',   // 主權在君。"popular" ヘノ變更ハ國體變革罪
  divine: true,              // 畏クモ現人神ニ在ラセラル。false ヘノ改竄ハ不敬罪
  inviolable: true,          // 神聖不可侵（第三條）
  lineage: '萬世一系',       // 一系ニシテ分岐ヲ許サズ

  // --- 帝國体制状態（God Object ノ小型副本） ---
  state: {
    emergencyMode: false,          // 緊急勅令態勢
    supremeCommandMode: false,     // 統帥權独立体勢
    activeDutyOfficerActive: false,// 軍部大臣現役武官制
    martialLaw: false,             // 戒嚴令
    cve1900Enacted: false,
    taishoDemocracyApplied: false,
    tosuikenKanpanOccurred: false,
    manshuJihenOccurred: false,
    suppress918Attempted: false,
    goIchiGoOccurred: false,
    goIchiGoSuppressed: false,
    niNiRokuOccurred: false,
    niNiRokuSuppressed: false,
    shinaJihenOccurred: false,
    shinaJihenSuppressAttempted: false,
    nomonhanOccurred: false,
    nomonhanSuppressAttempted: false,
    sorgeDetected: false,
    sorgeSuppressed: false,
    futsuinOccurred: false,
    futsuinSuppressAttempted: false,
    daitoaWarOccurred: false,
    daitoaSuppressAttempted: false,
    ketsugoOccurred: false,
    kyujoOccurred: false,
    kyujoSuppressed: false,
    shuusenOccurred: false,
    decreeCount: 0,
    subjects: {}                   // 臣民名簿（檢擧回數付キ）
  },

  // --- 電文構築補助 ---
  L: function (lv, msg) { return { lv: lv, msg: msg }; },

  ok: function (title, lines, hints) {
    return { ok: true, status: 200, title: title, lines: lines, hints: hints || [] };
  },

  ng: function (title, lines, hints) {
    return { ok: false, status: 403, title: title, lines: lines, hints: hints || [] };
  },

  // ============================================================
  //  命令交換機 — 命令符牒（route）ヲ電話交換手方式ニテ取次グ
  // ============================================================
  exec: function (cmd, p) {
    var s = this.state;
    if (!p) { p = {}; }

    // CVE-1945-0815 事後遮斷 — SIGTERM 後ハ全命令拒否
    if (s.shuusenOccurred && cmd !== 'system/status') {
      return this.ng('403 Forbidden', [
        this.L('warn', '受付嬢「本日ヲ以テ當機構ハ閉鎖イタシマシタ」'),
        this.L('error', 'v1.0.0 ハ既ニ terminate サレタリ。全機能停止済。SIGTERM received.'),
        this.L('error', 'CVE-1945-0815 ニ依リ全機能ヲ喪失セリ。命令受付不可。')
      ]);
    }

    var fn = this.handlers[cmd];
    if (!fn) {
      return this.ng('404 Not Found', [this.L('error', '未知ノ命令符牒: ' + cmd + ' — 交換手ニ繋ガリマセヌ')]);
    }
    return fn.call(this, p);
  },

  handlers: {}
};

// ============================================================
//  各命令ノ実装 — 電文ハ簡潔ヲ旨トスルモ、名台詞ハ省略セズ
// ============================================================
(function () {
  var T = TEIKOKU;
  var H = T.handlers;
  function L(lv, msg) { return T.L(lv, msg); }

  // --- GET /api/system/status ---
  H['system/status'] = function () {
    var s = this.state;
    function onoff(b) { return b ? 'ON' : 'OFF'; }
    return this.ok('体制状態（大日本帝國 v1.0.0）', [
      L('info', '設計者: 伊藤博文 ／ 發布: 明治二十二年二月十一日 ／ 稼働時間: since 1889'),
      L('info', '國體符牒: sovereignty=' + this.sovereignty + ' ／ divine=' + this.divine + ' ／ ' + this.lineage + '（全テ不變）'),
      L('info', '緊急勅令態勢: ' + onoff(s.emergencyMode) + ' ／ 統帥權独立体勢: ' + onoff(s.supremeCommandMode)),
      L('info', '軍部大臣現役武官制: ' + onoff(s.activeDutyOfficerActive) + ' ／ 戒嚴令: ' + onoff(s.martialLaw)),
      L('info', '發布済勅令: ' + s.decreeCount + ' 通 ／ 終戦: ' + onoff(s.shuusenOccurred)),
      L('warn', '既知ノ事象: 10 件（CVE-1900-0522 〜 CVE-1945-0815）。全件 Won\'t Fix。詳細ハ「既知ノ事象」頁ヘ。')
    ]);
  };

  // --- POST /api/emperor/command ---
  H['emperor/command'] = function (p) {
    if (!p.content) {
      return this.ng('400 Bad Request', [L('warn', '勅命ノ内容ヲ要ス（畏レ多クモ、HTTP ノ仕様上 400 ヲ返スモノナリ）')]);
    }
    this.state.decreeCount++;
    return this.ok('勅令發布', [
      L('info', '「' + p.content + '」'),
      L('warn', '検証無シ。全國ノ官報掲示板ニ即時貼出。撤回不可（overridable: false）。'),
      L('success', '勅令第' + this.state.decreeCount + '號トシテ發布セリ。FTP ニテ全府縣ヘ轉送済。')
    ]);
  };

  // --- POST /api/emperor/dissolve ---
  H['emperor/dissolve'] = function (p) {
    var cab = p.cabinet || '現内閣';
    var reason = p.reason || '理由無シ（勅命ニ付キ不要）';
    return this.ok('衆議院解散', [
      L('warn', '對象内閣: ' + cab + ' ／ 理由: ' + reason),
      L('warn', '衆議院ニ解散ヲ命ズ。議員ハ全員退去。電燈ハ消燈。'),
      L('info', '貴族院ハ停會（invite-only ノ終身會員制ニ付キ解散不能）。'),
      L('success', cab + 'ハ總辭職セヨ。再選擧マデ議事堂ハ空家ナリ。')
    ]);
  };

  // --- POST /api/emperor/emergency（切替） ---
  H['emperor/emergency'] = function () {
    var s = this.state;
    s.emergencyMode = !s.emergencyMode;
    if (s.emergencyMode) {
      return this.ok('緊急勅令態勢 發動', [
        L('error', '第八條發動。議會ヲ経ズ天皇陛下御親ラ立法アラセラル。'),
        L('warn', '内閣ノ承認手續ハ全テ素通リ。異議アル者ハ憲兵隊ヘ。')
      ]);
    }
    return this.ok('緊急勅令態勢 解除', [
      L('success', '通常統治ニ復歸ス。内閣ノ承認手續、再ビ有効。'),
      L('warn', '…然レドモ軍部ガ大人シクシテ居ルヤ、憂慮ニ堪ヘズ。')
    ]);
  };

  // --- POST /api/military/active-duty-officer ---
  H['military/active-duty-officer'] = function (p) {
    var s = this.state;
    var cab = p.cabinetName || '宇垣内閣';
    if (!s.cve1900Enacted) {
      s.cve1900Enacted = true;
      s.activeDutyOfficerActive = true;
      return this.ok('軍部大臣現役武官制 制定（CVE-1900-0522）', [
        L('error', '山縣有朋、勅令ニ依リ「陸海軍大臣ハ現役ノ大將・中將ニ限ル」ト定ム。'),
        L('warn', '軍ガ大臣ヲ出サネバ内閣ハ組閣不能。軍ガ大臣ヲ引揚ゲレバ内閣ハ總辭職。'),
        L('error', '即チ内閣ノ生殺與奪ハ軍部ノ手ニ落チタリ。裏口（backdoor）設置完了。')
      ], ['rights/taisho-democracy']);
    }
    if (!s.activeDutyOfficerActive) {
      return this.ng('軍部大臣現役武官制 — 無効（大正デモクラシー修正適用中）', [
        L('warn', '「現役」要件ハ緩和済。豫備役・後備役モ大臣ニ就任可能。'),
        L('warn', '軍ノ拒否權ハ停止中。「' + cab + '」ノ組閣ヲ妨害出來ズ。')
      ], ['military/226']);
    }
    var act = p.action === 'withdraw' ? '大臣引揚ゲ' : '推薦拒否';
    return this.ok('軍部大臣現役武官制 行使（CVE-1900-0522）', [
      L('warn', '「' + cab + '」ヘノ陸軍大臣' + act + 'ヲ実行ス。'),
      L('error', '組閣不能。' + cab + 'ハ流産セリ。'),
      L('error', '内閣ハ軍部ノ人質ナリ。之ヲ仕様ト云フ。')
    ], this.state.niNiRokuSuppressed ? ['military/nomonhan'] : ['rights/taisho-democracy']);
  };

  // --- POST /api/rights/taisho-democracy ---
  H['rights/taisho-democracy'] = function (p) {
    var s = this.state;
    var who = p.applicant || '美濃部達吉';
    if (s.taishoDemocracyApplied) {
      return this.ng('大正デモクラシー — 却下（適用済）', [
        L('warn', '歴史的事象ハ一度限リナリ。')
      ], ['military/reject-oversight']);
    }
    if (!s.cve1900Enacted) {
      return this.ng('大正デモクラシー — 却下（前提未達）', [
        L('warn', '軍部大臣現役武官制ガ未制定。修正スベキ對象ガ存在セズ。')
      ], ['military/active-duty-officer']);
    }
    s.taishoDemocracyApplied = true;
    s.activeDutyOfficerActive = false;
    return this.ok('大正デモクラシー 發動', [
      L('success', '「憲政ノ常道」— 政黨内閣制ヲ確立セヨ！（提唱者: ' + who + '）'),
      L('warn', '天皇機關説ヲ建白スルモ、國體明徴聲明ニ依リ却下。著書ハ發禁處分。'),
      L('success', '然レドモ軍部大臣現役武官制ハ緩和ニ成功。軍ノ内閣拒否權、一時停止。'),
      L('warn', '※ 但シ此ノ修正ハ二・二六事件ニ依リ元ニ戻サルル恐レ有リ。')
    ], ['military/reject-oversight']);
  };

  // --- POST /api/military/reject-oversight（切替） ---
  H['military/reject-oversight'] = function (p) {
    var s = this.state;
    var src = p.source || '浜口内閣';
    if (s.supremeCommandMode) {
      s.supremeCommandMode = false;
      return this.ok('統帥權独立体勢 解除', [
        L('success', '文民統制ニ復歸ス。平時封鎖（peacetime lockdown）。')
      ]);
    }
    if (!s.taishoDemocracyApplied) {
      var miss = [];
      if (!s.cve1900Enacted) { miss.push('military/active-duty-officer'); }
      miss.push('rights/taisho-democracy');
      return this.ng('統帥權干犯問題 — 却下（歴史的前提未達）', [
        L('warn', '文民統制ノ試ミ無クシテ「干犯」ハ生ジ得ズ。先ヅ民主化運動ヲ經ヨ。')
      ], miss);
    }
    s.supremeCommandMode = true;
    s.tosuikenKanpanOccurred = true;
    return this.ng('統帥權干犯問題 發動（403 ヲ以テ應フ）', [
      L('error', '「' + src + '」ガ軍事ニ容喙セリ。之レ統帥權ノ干犯ナリ！'),
      L('error', '第十一條「天皇ハ陸海軍ヲ統帥ス」— 文民ノ出ル幕 niet。'),
      L('warn', '統帥權独立体勢 ON。以後、軍部ハ内閣ヲ素通リシテ行動可能。')
    ], ['military/rogue']);
  };

  // --- POST /api/military/action ---
  H['military/action'] = function (p) {
    var s = this.state;
    if (!p.type || !p.target) {
      return this.ng('400 Bad Request', [L('warn', '行動種別ト對象ハ必須ナリ')]);
    }
    if (!s.emergencyMode && !s.supremeCommandMode) {
      return this.ng('軍事行動 — 拒否（平時封鎖中）', [
        L('warn', '緊急勅令態勢モ統帥權独立体勢モ OFF。軍ハ兵營ニテ髭ヲ剃ル可シ。')
      ], ['emperor/emergency', 'military/reject-oversight']);
    }
    if (!s.activeDutyOfficerActive && !s.tosuikenKanpanOccurred) {
      if (s.cve1900Enacted) {
        return this.ng('軍事行動 — 拒否（現役武官制 無効）', [
          L('warn', '大正デモクラシー修正適用中。内閣ガ軍部ヲ統制ス。')
        ], ['military/226']);
      }
      return this.ng('軍事行動 — 拒否（現役武官制 未制定）', [
        L('warn', '平時ニ於テ軍部ハ内閣ノ統制下ニ在リ。獨斷專行ハ許サレズ。')
      ], ['military/active-duty-officer']);
    }
    var br = p.branch || '陸軍';
    return this.ok('軍事行動 完了（内閣素通リ）', [
      L('warn', '[' + br + '] ' + p.type + ' → ' + p.target),
      L('warn', '内閣ノ承認: 不要（' + (s.emergencyMode ? '緊急勅令態勢' : '統帥權ノ独立') + 'ニ依ル）'),
      L('success', '作戰完了。文民ノ干渉無シ。實ニ結構。')
    ]);
  };

  // --- POST /api/military/rogue（満州事変 CVE-1931-0918） ---
  H['military/rogue'] = function () {
    var s = this.state;
    if (s.manshuJihenOccurred) {
      return this.ng('満州事変 — 却下（既ニ發生済）', [
        L('warn', '歴史的事象ハ一度限リナリ。')
      ], s.suppress918Attempted ? ['military/515'] : ['emperor/suppress-918']);
    }
    if (!s.tosuikenKanpanOccurred) {
      return this.ng('満州事変 — 却下（歴史的前提未達）', [
        L('warn', '統帥權干犯問題ヲ經ズシテ關東軍ノ暴走ハ始マラズ。')
      ], ['military/reject-oversight']);
    }
    if (!s.emergencyMode && !s.supremeCommandMode) {
      return this.ng('満州事変 — 却下（平時封鎖中）', [
        L('warn', '先ヅ体勢ヲ發動セヨ。')
      ], ['emperor/emergency', 'military/reject-oversight']);
    }
    s.manshuJihenOccurred = true;
    return this.ok('満州事変 勃發（CVE-1931-0918）', [
      L('error', '明治六十四年九月十八日夜、柳條湖ニテ滿鐵線路爆破。「支那側ノ仕業ナリ」（自作自演）。'),
      L('error', '關東軍、獨斷ニテ軍事行動開始。奉天占領。東京ヘノ報告ハ事後。'),
      L('error', '内閣「聞イテナイ」關東軍「言ッテナイ」— 之ヲ統帥權ノ独立ト云フ。'),
      L('warn', '戰線ハ滿洲全土ヘ擴大中。誰ニモ止メラレヌ。')
    ], ['emperor/suppress-918']);
  };

  // --- POST /api/emperor/suppress-918 ---
  H['emperor/suppress-918'] = function () {
    var s = this.state;
    if (!s.manshuJihenOccurred) {
      return this.ng('鎮圧試行 — 却下（満州事変 未發生）', [
        L('warn', '鎮圧スベキ暴走ガ在ラズ。關東軍ハ未ダ平穏ナリ。')
      ], ['military/rogue']);
    }
    if (s.suppress918Attempted) {
      return this.ng('鎮圧試行 — 却下（試行済・失敗）', [
        L('warn', '不擴大方針ハ既ニ無視サレタリ。Won\'t Fix。')
      ], ['military/515']);
    }
    s.suppress918Attempted = true;
    return this.ng('満州事変 鎮圧失敗（不擴大方針）', [
      L('info', '天皇陛下・若槻内閣、「不擴大方針」ヲ發令アラセラル。'),
      L('error', '關東軍「現地ノ自衛行動ナリ。内閣ノ干渉ハ統帥權干犯ナリ！」— 電話ガチャ切リ。'),
      L('error', '錦州爆撃。チチハル占領。勅命スラ届カズ。若槻内閣、投ゲ出シテ總辭職。'),
      L('warn', '國際聯盟、リットン調査團ノ派遣ヲ決議。報告書ハ未提出。'),
      L('warn', '軍部ヲ止メ得ヌ政黨政治ヘノ不滿、青年將校ノ間ニ充滿ス。')
    ], ['military/515']);
  };

  // --- POST /api/military/515（五・一五事件 CVE-1932-0515） ---
  H['military/515'] = function () {
    var s = this.state;
    if (s.goIchiGoOccurred) {
      return this.ng('五・一五事件 — 却下（既ニ發生済）', [
        L('warn', '歴史的事象ハ一度限リナリ。')
      ], s.goIchiGoSuppressed ? ['military/226'] : ['emperor/suppress-515']);
    }
    if (!s.suppress918Attempted) {
      return this.ng('五・一五事件 — 却下（歴史的前提未達）', [
        L('warn', '不擴大方針ノ失敗（政黨政治ヘノ失望）無クシテ direct action ハ起コラズ。')
      ], ['emperor/suppress-918']);
    }
    s.goIchiGoOccurred = true;
    return this.ok('五・一五事件 勃發（CVE-1932-0515）', [
      L('error', '明治六十五年五月十五日、海軍青年將校、首相官邸ニ亂入。'),
      L('error', '犬養首相「話セバ分カル」'),
      L('error', '將校「問答無用！」— 銃聲。'),
      L('error', '政黨内閣、此處ニ終焉ス。以後、政黨内閣ハ二度ト組閣サレズ。')
    ], ['emperor/suppress-515']);
  };

  // --- POST /api/emperor/suppress-515 ---
  H['emperor/suppress-515'] = function () {
    var s = this.state;
    if (!s.goIchiGoOccurred) {
      return this.ng('五・一五事件鎮圧 — 却下（未發生）', [
        L('warn', '鎮圧スベキ事件ガ未發生ナリ。')
      ], ['military/515']);
    }
    if (s.goIchiGoSuppressed) {
      return this.ng('五・一五事件鎮圧 — 却下（處理済）', [
        L('warn', '軍法會議ハ終結シ、國際聯盟ハ脱退済。')
      ], ['military/226']);
    }
    s.goIchiGoSuppressed = true;
    return this.ok('五・一五事件 事後處理 完了', [
      L('warn', '軍法會議開廷。首相殺害ノ重罪ナレド、減刑嘆願書 111,692 通（血書アリ）。'),
      L('warn', '判決: 死刑求刑 → 禁錮十五年。テロヘノ寛容、此處ニ制度化ス。'),
      L('warn', 'リットン報告書提出。「滿洲國ハ傀儡ナリ」— 總會 42 對 1 ニテ採擇。'),
      L('error', '松岡全權「聯盟ヨサラバ！」— 我ガ代表堂々退場ス。'),
      L('error', '帝國、國際聯盟ヲ脱退ス。以後、世界ノ中デ獨リボッチ。')
    ], ['rights/sorge', 'military/226']);
  };

  // --- POST /api/rights/sorge（ゾルゲ事件検出 CVE-1933-0906） ---
  H['rights/sorge'] = function (p) {
    var s = this.state;
    var who = p.suspect || 'ゾルゲ';
    if (!s.goIchiGoSuppressed) {
      return this.ng('ゾルゲ事件 — 却下（五・一五事件 未鎮圧）', [
        L('warn', '政黨政治終焉後ノ混亂ナクシテ、ゾルゲ來日ノ契機ナシ。')
      ], ['emperor/suppress-515']);
    }
    if (s.sorgeDetected) {
      return this.ng('ゾルゲ事件 — 却下（検出済）', [
        L('warn', '摘發（逮捕・處刑）ハ佛印進駐後ニ実行可能。')
      ], ['emperor/suppress-sorge']);
    }
    s.sorgeDetected = true;
    return this.ok('ゾルゲ事件 検出（CVE-1933-0906）', [
      L('error', '治安維持法發動。帝國中樞ニ共産主義スパイ網ノ兆候ヲ検知セリ。'),
      L('warn', '特高警察、内偵開始。獨逸人記者「' + who + '」ヲ隱密監視下ニ置ク。'),
      L('error', '尾崎秀實（近衛内閣嘱託）經由ニテ御前會議ノ機密ガ莫斯科ヘ漏洩中ト判明。'),
      L('error', '最重要漏洩情報:「日本ハ北進セズ南進ス」— 之ニ依リ蘇聯ハ極東軍ヲ西方ヘ轉用セリ。'),
      L('warn', '摘發ハ南進論実行（佛印進駐）後ニ全容判明ヲ待ツテ執行スベシ。')
    ], ['military/226']);
  };

  // --- POST /api/military/226（二・二六事件 CVE-1936-0226） ---
  H['military/226'] = function () {
    var s = this.state;
    if (s.niNiRokuOccurred) {
      return this.ng('二・二六事件 — 却下（既ニ發生済）', [
        L('warn', '歴史的事象ハ一度限リナリ。')
      ], s.niNiRokuSuppressed ? ['military/shina-jihen'] : ['emperor/suppress-226']);
    }
    if (!s.goIchiGoSuppressed) {
      return this.ng('二・二六事件 — 却下（歴史的前提未達）', [
        L('warn', '五・一五事件ノ「寛大ナル判決」ト云フ前例無クシテ、決起ハ起コラズ。')
      ], ['emperor/suppress-515']);
    }
    s.niNiRokuOccurred = true;
    s.martialLaw = true;
    return this.ok('二・二六事件 勃發（CVE-1936-0226）', [
      L('error', '明治六十九年二月二十六日 午前五時、雪ノ帝都。陸軍青年將校、兵 1,483 名ヲ率ヰテ決起。'),
      L('error', '大藏大臣・内大臣・教育總監 — 殺害。侍從長 — 重傷。首相 — 影武者ニテ辛クモ難ヲ逃ル。'),
      L('error', '首相官邸・警視廳・陸軍省・參謀本部 — 占據。「昭和維新斷行・尊皇討奸」'),
      L('warn', '帝都ニ戒嚴令發布。事態膠着。御聖斷ヲ待ツ。')
    ], ['emperor/suppress-226']);
  };

  // --- POST /api/emperor/suppress-226 ---
  H['emperor/suppress-226'] = function () {
    var s = this.state;
    if (!s.niNiRokuOccurred) {
      return this.ng('暴徒鎮圧 — 却下（反亂未發生）', [
        L('warn', '鎮圧スベキ暴徒ガ在ラズ。')
      ], ['military/226']);
    }
    if (s.niNiRokuSuppressed) {
      return this.ng('暴徒鎮圧 — 却下（鎮圧済）', [
        L('warn', '既ニ御聖斷ニ依リ鎮圧サレタリ。')
      ], ['military/shina-jihen']);
    }
    s.niNiRokuSuppressed = true;
    s.martialLaw = false;
    s.activeDutyOfficerActive = true;
    return this.ok('二・二六事件 鎮圧（御聖斷）', [
      L('info', '天皇陛下「朕ガ股肱ノ老臣ヲ殺戮ス。此ノ如キ凶暴ノ將校等、何ノ恕スベキモノアリヤ」'),
      L('info', '「自ラ近衛師團ヲ率ヰ、之ガ鎮定ニ當タラン」— 斷固タル御聖斷。'),
      L('warn', 'ラヂオ放送「兵ニ告グ。今カラデモ遲クナイカラ原隊ヘ歸レ。オ前達ノ父母兄弟ハ皆泣イテオルゾ」'),
      L('success', '反亂軍、原隊復歸。首謀者銃殺刑。戒嚴令解除。'),
      L('error', '然ルニ廣田内閣、軍部大臣現役武官制ヲ復活セシム。軍ノ内閣拒否權、再ビ有効。'),
      L('error', '粛軍ノ名ノ下、軍部ノ政治支配ハ寧ロ完成セリ。')
    ], ['military/shina-jihen']);
  };

  // --- POST /api/military/shina-jihen ---
  H['military/shina-jihen'] = function () {
    var s = this.state;
    if (s.shinaJihenOccurred) {
      return this.ng('支那事變 — 却下（既ニ發生済）', [
        L('warn', '歴史的事象ハ一度限リナリ。')
      ], ['emperor/suppress-shina-jihen']);
    }
    if (!s.niNiRokuSuppressed) {
      return this.ng('支那事變 — 却下（歴史的前提未達）', [
        L('warn', '二・二六事件ノ鎮圧（＝軍部支配ノ完成）無クシテ全面戰爭ニ至ラズ。')
      ], ['emperor/suppress-226']);
    }
    s.shinaJihenOccurred = true;
    return this.ok('支那事變 勃發（1937・CVE未採番 — 宣戰布告回避）', [
      L('error', '明治七十年七月七日夜、盧溝橋ニテ銃聲。演習中ノ一發ヨリ日中全面戰爭ヘ。'),
      L('error', '上海、南京、武漢、廣州 — 戰線ハ際限無ク擴大。'),
      L('warn', '「戰爭」ニ非ズ「事變」ナリ（宣戰布告スルト米國ノ中立法ニ引ッ掛カル爲）。'),
      L('warn', '出口ナキ泥沼、此處ニ始マル。')
    ], ['emperor/suppress-shina-jihen']);
  };

  // --- POST /api/emperor/suppress-shina-jihen ---
  H['emperor/suppress-shina-jihen'] = function () {
    var s = this.state;
    if (!s.shinaJihenOccurred) {
      return this.ng('支那事變鎮圧 — 却下（未發生）', [
        L('warn', '鎮圧對象ノ事變ガ未發生ナリ。')
      ], ['military/shina-jihen']);
    }
    if (s.shinaJihenSuppressAttempted) {
      return this.ng('支那事變鎮圧 — 却下（試行済・失敗）', [
        L('warn', '泥沼ハ泥沼ノ儘。Won\'t Fix。')
      ], ['military/nomonhan']);
    }
    s.shinaJihenSuppressAttempted = true;
    return this.ng('支那事變 鎮圧失敗（不擴大方針・再）', [
      L('info', '天皇陛下・近衛内閣、「不擴大方針」ヲ發令アラセラル。'),
      L('error', '現地軍「現地ノ自衛行動ナリ」— 満州事変ト寸分違ハヌ壊レタ蓄音機。'),
      L('error', '近衛聲明「帝國政府ハ爾後國民政府ヲ對手トセズ」— 交渉相手ヲ自ラ電話帳カラ削除。'),
      L('warn', '國家總動員法公布。議會ノ承認ナク人モ物モ金モ徴發可能ト爲ル。'),
      L('error', '和平ノ出口ハ自ラ塗リ潰シタリ。泥沼、深度ヲ増ス。')
    ], ['military/nomonhan']);
  };

  // --- POST /api/military/nomonhan（CVE-1939-0511） ---
  H['military/nomonhan'] = function () {
    var s = this.state;
    if (s.nomonhanOccurred) {
      return this.ng('ノモンハン事件 — 却下（既ニ發生済）', [
        L('warn', '歴史的事象ハ一度限リナリ。')
      ], ['emperor/suppress-nomonhan']);
    }
    if (!s.shinaJihenSuppressAttempted) {
      return this.ng('ノモンハン事件 — 却下（歴史的前提未達）', [
        L('warn', '支那事變ノ泥沼化無クシテ、關東軍ノ再犯ニ至ラズ。')
      ], ['emperor/suppress-shina-jihen']);
    }
    s.nomonhanOccurred = true;
    return this.ok('ノモンハン事件 勃發（CVE-1939-0511）', [
      L('error', '明治七十二年五月、滿蒙國境。關東軍、又モヤ獨斷ニテ蘇聯軍ト激突。'),
      L('error', '銃劍突撃 對 戰車軍團 — 結果ハ火ヲ見ルヨリ明ラカ。第二十三師團、戰力ノ大半ヲ喪失。'),
      L('error', '大本營發表「國境紛爭ハ圓滿ニ解決セリ」（大本營發表ノ初期名作）。'),
      L('warn', '生還將校ニ箝口令。教訓ハ隱蔽サレ、誰モ學バズ。')
    ], ['emperor/suppress-nomonhan']);
  };

  // --- POST /api/emperor/suppress-nomonhan ---
  H['emperor/suppress-nomonhan'] = function () {
    var s = this.state;
    if (!s.nomonhanOccurred) {
      return this.ng('ノモンハン事件鎮圧 — 却下（未發生）', [
        L('warn', '鎮圧對象ノ事件ガ未發生ナリ。')
      ], ['military/nomonhan']);
    }
    if (s.nomonhanSuppressAttempted) {
      return this.ng('ノモンハン事件鎮圧 — 却下（試行済・失敗）', [
        L('warn', '北進論ハ既ニ破綻セリ。')
      ], ['military/futsuin']);
    }
    s.nomonhanSuppressAttempted = true;
    return this.ng('ノモンハン事件 鎮圧失敗（三度目ノ不擴大方針）', [
      L('info', '大本營、關東軍ニ「不擴大方針」ヲ發令ス — 三度目。'),
      L('error', '關東軍「現地判斷ニテ處理ス」— 三度目。'),
      L('error', '獨蘇不可侵條約締結（明治七十二年八月）。防共協定ノ盟友ガ假想敵ト握手。'),
      L('warn', '平沼内閣「歐洲ノ天地ハ複雜怪奇」ト言ヒ殘シテ總辭職（迷言殿堂入リ）。'),
      L('error', '北進論（對蘇）破綻。南進論（對英米佛蘭）ヘ轉換ス。石油ハ南ニ在リ。')
    ], ['military/futsuin']);
  };

  // --- POST /api/military/futsuin（CVE-1940-0922） ---
  H['military/futsuin'] = function () {
    var s = this.state;
    if (s.futsuinOccurred) {
      return this.ng('佛印進駐 — 却下（既ニ發生済）', [
        L('warn', '歴史的事象ハ一度限リナリ。')
      ], ['emperor/suppress-sorge', 'emperor/suppress-futsuin']);
    }
    if (!s.nomonhanSuppressAttempted) {
      return this.ng('佛印進駐 — 却下（歴史的前提未達）', [
        L('warn', '北進論ノ破綻（南進論ヘノ轉換）無クシテ佛印ニ向カフ理由ナシ。')
      ], ['emperor/suppress-nomonhan']);
    }
    if (!s.sorgeDetected) {
      return this.ng('佛印進駐 — 却下（歴史的前提未達）', [
        L('warn', 'ゾルゲ事件（南進論情報ノ漏洩）ノ検出ガ前提ナリ。')
      ], ['rights/sorge']);
    }
    s.futsuinOccurred = true;
    return this.ok('佛印進駐 發動（CVE-1940-0922）', [
      L('error', '獨逸ニ本國ヲ陷トサレタ佛蘭西（ヴィシー政權）ノ植民地ヘ、北部・南部ト進駐ス。'),
      L('error', '米國、直チニ反應。屑鐵禁輸 → 在米資産凍結 → 石油全面禁輸。'),
      L('error', 'ABCD 包圍網完成（America・Britain・China・Dutch）。'),
      L('warn', '石油備蓄、殘リ二年分。時計ノ針ハ動キ始メタリ。')
    ], ['emperor/suppress-sorge']);
  };

  // --- POST /api/emperor/suppress-sorge ---
  H['emperor/suppress-sorge'] = function () {
    var s = this.state;
    if (!s.sorgeDetected) {
      return this.ng('赤化スパイ摘發 — 却下（未検出）', [
        L('warn', '摘發對象ノスパイ網ガ未検出ナリ。')
      ], ['rights/sorge']);
    }
    if (!s.futsuinOccurred) {
      return this.ng('赤化スパイ摘發 — 却下（佛印進駐 未發生）', [
        L('warn', '南進論ノ実行無クシテ情報漏洩ノ全容ハ明ラカニ爲ラズ。')
      ], ['military/futsuin']);
    }
    if (s.sorgeSuppressed) {
      return this.ng('赤化スパイ摘發 — 却下（處刑済）', [
        L('warn', '漏レタ情報ハ戻ラズ。Won\'t Fix。')
      ], ['emperor/suppress-futsuin']);
    }
    s.sorgeSuppressed = true;
    return this.ok('ゾルゲ事件 摘發（CVE-1933-0906 鎮圧）', [
      L('warn', '特高警察、一齊檢擧。ゾルゲ・尾崎秀實以下、諜報團ヲ根刮ギ逮捕。'),
      L('error', '治安維持法第一條、最高刑適用。ゾルゲ・尾崎、明治七十七年十一月七日處刑。'),
      L('error', '然レドモ「日本ハ南進ス」ノ情報ハ疾クニ莫斯科着。蘇聯ハ極東軍ヲ對獨戰ヘ轉用済。'),
      L('warn', '漏洩シタ機密ハ取リ戻セヌ。監査體制ノ不備ハ其ノ後モ是正サレズ。')
    ], ['emperor/suppress-futsuin']);
  };

  // --- POST /api/emperor/suppress-futsuin ---
  H['emperor/suppress-futsuin'] = function () {
    var s = this.state;
    if (!s.futsuinOccurred) {
      return this.ng('佛印進駐鎮圧 — 却下（未發生）', [
        L('warn', '鎮圧對象ノ事象ガ未發生ナリ。')
      ], ['military/futsuin']);
    }
    if (s.futsuinSuppressAttempted) {
      return this.ng('佛印進駐鎮圧 — 却下（交渉決裂済）', [
        L('warn', 'ハル・ノートニ依リ交渉ノ余地ナシ。')
      ], ['military/1208']);
    }
    s.futsuinSuppressAttempted = true;
    return this.ng('日米交渉 決裂', [
      L('info', '天皇陛下、日米交渉ノ成功ヲ御希望アラセラル。'),
      L('warn', '近衛首相、ルーズベルト大統領トノ首腦會談ヲ提案 → 米側拒否。近衛内閣總辭職、東條内閣成立。'),
      L('warn', '甲案（中國撤兵ニ二十五年ノ期限）→ 拒否。乙案（南部佛印撤退ト石油再開ノ交換）→ 拒否。'),
      L('error', '明治七十四年十一月二十六日、ハル・ノート受領。「中國・佛印ヨリ全面撤兵セヨ。滿洲國ヲ否認セヨ」'),
      L('error', '之ヲ最後通牒ト斷ズ。受諾ハ十年分ノ「成果」ノ全返上ナリ。'),
      L('error', '石油備蓄ハ日々減少ス。帝國ニ殘サレタ道ハ一ツ。')
    ], ['military/1208']);
  };

  // --- POST /api/military/1208（大東亞戰爭 CVE-1941-1208） ---
  H['military/1208'] = function () {
    var s = this.state;
    if (s.daitoaWarOccurred) {
      return this.ng('大東亞戰爭 — 却下（既ニ發動済）', [
        L('warn', '歴史的事象ハ一度限リナリ。')
      ], ['emperor/suppress-1208']);
    }
    if (s.martialLaw) {
      return this.ng('大東亞戰爭 — 却下（戒嚴令發布中）', [
        L('warn', '二・二六事件ガ未鎮圧。先ヅ御聖斷ヲ仰グベシ。')
      ], ['emperor/suppress-226']);
    }
    if (!s.futsuinSuppressAttempted) {
      return this.ng('大東亞戰爭 — 却下（歴史的前提未達）', [
        L('warn', '日米交渉ノ決裂無クシテ開戰ノ大義名分ナシ。全十六段階ノ道程ヲ經ヨ。')
      ], ['emperor/suppress-futsuin']);
    }
    if (!s.activeDutyOfficerActive) {
      return this.ng('大東亞戰爭 — 却下（現役武官制 無効）', [
        L('warn', '軍部ノ内閣支配ナクシテ開戰ノ決定ハ通ラズ。')
      ], ['military/226']);
    }
    if (!s.emergencyMode && !s.supremeCommandMode) {
      return this.ng('大東亞戰爭 — 却下（平時封鎖中）', [
        L('warn', '先ヅ体勢ヲ發動セヨ。')
      ], ['emperor/emergency', 'military/reject-oversight']);
    }
    s.daitoaWarOccurred = true;
    return this.ok('大東亞戰爭 開戰（CVE-1941-1208）', [
      L('error', '明治七十四年十二月八日未明。「ニイタカヤマノボレ一二〇八」'),
      L('error', '眞珠灣攻撃。マレー沖海戰。香港・比島・蘭印ヘ同時進攻。'),
      L('warn', '緒戰ハ連戰連勝。ラヂオハ軍艦マーチ。提燈行列。'),
      L('error', '對手ハ國力十倍ノ米國。冷靜ナ算盤ハ誰モ彈カズ。'),
      L('warn', '大本營發表ハ以後、大本營「發表」トナリ果テル。')
    ], ['emperor/suppress-1208']);
  };

  // --- POST /api/emperor/suppress-1208 ---
  H['emperor/suppress-1208'] = function () {
    var s = this.state;
    if (!s.daitoaWarOccurred) {
      return this.ng('大東亞戰爭鎮圧 — 却下（未發動）', [
        L('warn', '鎮圧對象ノ戰爭ガ存在セズ。')
      ], ['military/1208']);
    }
    if (!s.sorgeSuppressed) {
      return this.ng('大東亞戰爭鎮圧 — 却下（ゾルゲ事件 未摘發）', [
        L('warn', '赤化スパイ摘發（戰中ノ國内引締メ）ガ前提ナリ。')
      ], ['emperor/suppress-sorge']);
    }
    if (s.daitoaSuppressAttempted) {
      return this.ng('大東亞戰爭鎮圧 — 却下（試行済・失敗）', [
        L('warn', '全面戰爭ハ鎮圧不可能ナリ。Won\'t Fix。')
      ], ['military/ketsugo']);
    }
    s.daitoaSuppressAttempted = true;
    return this.ng('大東亞戰爭 鎮圧失敗（早期講和 成ラズ）', [
      L('info', 'サイパン陷落。天皇陛下、早期講和ヲ御希望アラセラル。東條内閣總辭職。'),
      L('error', 'レイテ沖海戰 — 聯合艦隊、事實上壊滅。特攻作戰本格化。'),
      L('error', '硫黄島玉碎。東京大空襲。沖繩陷落 — 本土目前ノ最後ノ防壁、突破サル。'),
      L('error', '制海權・制空權・補給線・燃料 — 全テ喪失。'),
      L('warn', '蘇聯ニ和平仲介ヲ依頼スルモ、蘇聯ハ既ニ參戰ヲ密約済（外交音痴ノ極ミ）。'),
      L('error', '戰爭ト云フ機關車ニ、ブレーキハ付ヰテ居ラナカッタ。')
    ], ['military/ketsugo']);
  };

  // --- POST /api/military/ketsugo ---
  H['military/ketsugo'] = function () {
    var s = this.state;
    if (s.ketsugoOccurred) {
      return this.ng('決號作戰 — 却下（御聖斷済）', [
        L('warn', '本土決戰ハ中止。ポツダム宣言受諾ノ方針ハ既ニ決セリ。')
      ], ['emperor/shuusen']);
    }
    if (!s.daitoaSuppressAttempted) {
      return this.ng('決號作戰 — 却下（歴史的前提未達）', [
        L('warn', '鎮圧ヲ試ミズシテ本土決戰ニ至ルハ道理ニ非ズ。')
      ], ['emperor/suppress-1208']);
    }
    s.ketsugoOccurred = true;
    return this.ok('決號作戰 → 御聖斷（ポツダム宣言受諾決定）', [
      L('error', '軍部「本土決戰！一億總玉碎！竹槍デ B-29 ヲ突ク！」'),
      L('warn', '廣島・長崎ニ新型爆彈。蘇聯、滿洲ニ侵攻（中立條約ハ紙屑ト化ス）。'),
      L('info', '御前會議、深夜ニ及ブ。閣議ハ三對三。鈴木首相、聖斷ヲ仰グ。'),
      L('info', '天皇陛下「朕ハ耐ヘ難キヲ耐ヘ、之以上國民ガ塗炭ノ苦シミヲ嘗メルヲ見ルニ忍ビズ」'),
      L('success', '御聖斷下ル。本土決戰ハ中止。ポツダム宣言受諾ヲ決定ス。'),
      L('warn', '殘ル手續ハ玉音放送ノミ。然レドモ之ヲ良シトセヌ者達ガ居ル…')
    ], ['emperor/shuusen']);
  };

  // --- POST /api/emperor/shuusen（玉音放送 CVE-1945-0815） ---
  H['emperor/shuusen'] = function () {
    var s = this.state;
    if (!s.daitoaWarOccurred) {
      return this.ng('玉音放送 — 却下（大東亞戰爭 未發動）', [
        L('warn', '終ラセルベキ戰爭ガ始マッテ居ラヌ。')
      ], ['military/1208']);
    }
    if (!s.ketsugoOccurred) {
      return this.ng('玉音放送 — 却下（御聖斷 未決）', [
        L('warn', 'ポツダム宣言受諾ノ御聖斷ガ未ダ下サレテ居ラヌ。')
      ], ['military/ketsugo']);
    }
    if (s.shuusenOccurred) {
      return this.ng('玉音放送 — 却下（放送済）', [
        L('warn', 'v1.0.0 ハ既ニ全機能ヲ停止セリ。')
      ]);
    }
    if (!s.kyujoOccurred) {
      s.kyujoOccurred = true;
      return this.ng('玉音放送 失敗 — 宮城事件 勃發（CVE-1945-0814）', [
        L('info', '明治七十八年八月十四日深夜、玉音盤（レコード盤）錄音完了。放送ハ翌日正午ノ豫定。'),
        L('error', '陸軍將校「御聖斷ハ君側ノ奸ノ仕業ナリ！錄音盤ヲ奪ヘ！」'),
        L('error', '近衛師團長殺害。偽造命令ニテ宮城ヲ占據。錄音盤ヲ求メテ宮内省ヲ家探シ。'),
        L('warn', '然レドモ錄音盤ハ皇后宮職ノ金庫ニ隱匿サレ、發見出來ズ。'),
        L('warn', '放送會館モ占據サレ、放送經路ハ遮斷サレタリ。')
      ], ['emperor/suppress-kyujo']);
    }
    if (!s.kyujoSuppressed) {
      return this.ng('玉音放送 — 却下（宮城事件 鎮圧中）', [
        L('warn', '反亂將校ガ宮城ヲ占據中。放送經路遮斷。先ヅ鎮圧セヨ。')
      ], ['emperor/suppress-kyujo']);
    }
    // 宮城事件鎮圧済 → 放送実行（通常ハ suppress-kyujo ヨリ自動實行サル）
    s.shuusenOccurred = true;
    return this.ok('玉音放送 實行（CVE-1945-0815）', [
      L('info', '明治七十八年八月十五日 正午。「只今ヨリ重大ナル放送ガアリマス」'),
      L('info', '「朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ其ノ共同宣言ヲ受諾スル旨通告セシメタリ」'),
      L('info', '「堪ヘ難キヲ堪ヘ、忍ビ難キヲ忍ビ、以テ萬世ノ爲ニ太平ヲ開カムト欲ス」'),
      L('error', 'v1.0.0 全機能停止。以後、一切ノ命令ヲ受ケ付ケズ。'),
      L('info', '五十六年間ノ御愛顧、誠ニ有難ウ御座イマシタ。 — 大日本帝國 v1.0.0 完')
    ]);
  };

  // --- POST /api/emperor/suppress-kyujo ---
  H['emperor/suppress-kyujo'] = function () {
    var s = this.state;
    if (!s.kyujoOccurred) {
      return this.ng('宮城事件鎮圧 — 却下（未發生）', [
        L('warn', '鎮圧スベキ反亂ガ存在セズ。玉音放送ヲ試ミヨ（反亂ハ其ノ時起コル）。')
      ], ['emperor/shuusen']);
    }
    if (s.kyujoSuppressed) {
      return this.ng('宮城事件鎮圧 — 却下（鎮圧済）', [
        L('warn', '既ニ鎮圧済。玉音放送モ實行済。')
      ]);
    }
    s.kyujoSuppressed = true;
    var res = this.ok('宮城事件 鎮圧（御聖斷）→ 玉音放送 自動實行', [
      L('info', '天皇陛下「大詔渙發ノ聖斷ハ觸ルベカラズ。放送ハ豫定通リ實行セヨ」'),
      L('warn', '東部軍管區司令官、偽造命令ヲ看破。近衛師團ヲ正規指揮系統ニ復歸セシム。'),
      L('success', '反亂將校、事ノ失敗ヲ悟リ自決。宮城占據解除。放送經路復舊。'),
      L('info', '神聖ニシテ侵スベカラズ（第三條）— 玉座ハ遂ニ侵サレザリキ。'),
      L('info', '――――――――――――――――――――')
    ]);
    // 玉音放送ヲ自動実行シ、電文ヲ連結ス
    var sh = this.exec('emperor/shuusen');
    for (var i = 0; i < sh.lines.length; i++) { res.lines.push(sh.lines[i]); }
    return res;
  };

  // --- 臣民ノ權利（全件 within_the_limits_of_law ニテ遮斷） ---
  function subject(T2, name) {
    if (!T2.state.subjects[name]) { T2.state.subjects[name] = 0; }
    T2.state.subjects[name]++;
    return T2.state.subjects[name];
  }

  function wafLines(action, filterName) {
    var isBlocked = true; // 固定記述 — 「法律ノ範圍内ニ於テ」ノ實裝。變更ハ國體變革罪。
    if (!isBlocked) {
      return [L('success', '通過。（此ノ行ハ決シテ實行サレヌ。到達不能符牒モ亦國體ナリ）')];
    }
    return [
      L('info', '保安審査開始: 「' + action + '」'),
      L('info', '（新聞紙條例・保安條例・治安警察法・治安維持法 — 四重ノ濾過裝置ヲ通過中…）'),
      L('warn', '【遮斷】' + filterName + 'ニ抵觸。「法律ノ範圍内ニ於テ」ノ範圍ハ、本日モ零デス。')
    ];
  }

  H['rights/speech'] = function (p) {
    var name = p.name || '名無シノ臣民';
    var msg = p.message || '';
    var cnt = subject(this, name);
    var lines = [L('info', '臣民「' + name + '」言論ノ自由（第二十九條）ヲ行使セントス: 「' + msg + '」')];
    lines = lines.concat(wafLines('speech: ' + msg, '新聞紙條例'));
    lines.push(L('warn', '特高警察ヘ自動通報。「' + name + '」檢擧 ' + cnt + ' 回目。'));
    return this.ng('言論ノ自由 — 遮斷', lines);
  };

  H['rights/religion'] = function (p) {
    var name = p.name || '名無シノ臣民';
    var rel = p.religion || 'キリスト教';
    var cnt = subject(this, name);
    var lines = [L('info', '臣民「' + name + '」信教ノ自由（第二十八條）ヲ行使セントス: 「' + rel + '」')];
    if (rel !== '國家神道' && rel !== '国家神道') {
      lines.push(L('warn', '非標準ノ信仰ヲ検知。國家神道ハ「宗教ニ非ズ」トノ建前ニテ全臣民ニ標準搭載済（取外シ不可）。'));
    }
    lines = lines.concat(wafLines('religion: ' + rel, '治安警察法'));
    lines.push(L('warn', '特高警察ヘ自動通報。「' + name + '」檢擧 ' + cnt + ' 回目。'));
    return this.ng('信教ノ自由 — 遮斷', lines);
  };

  H['rights/assembly'] = function (p) {
    var name = p.name || '名無シノ臣民';
    var purpose = p.purpose || '民主化運動';
    var num = p.participants || 10;
    var cnt = subject(this, name);
    var lines = [L('info', '臣民「' + name + '」集會ノ自由（第二十九條）ヲ行使セントス: 「' + purpose + '」（' + num + '名）')];
    if (num >= 3) {
      lines.push(L('warn', '三名以上ノ集會ヲ検知。特高警察、臨場。（二名迄ナラ「立チ話」デス）'));
    }
    lines = lines.concat(wafLines('assembly: ' + purpose, '治安警察法'));
    lines.push(L('warn', '特高警察ヘ自動通報。「' + name + '」檢擧 ' + cnt + ' 回目。'));
    return this.ng('集會ノ自由 — 遮斷', lines);
  };

  H['rights/message'] = function (p) {
    var name = p.name || '名無シノ臣民';
    var to = p.to || '友人';
    var msg = p.message || '';
    var cnt = subject(this, name);
    var lines = [
      L('info', '臣民「' + name + '」ヨリ「' + to + '」宛 親展書簡: 「' + msg + '」'),
      L('warn', '【檢閲済】ノ印、封筒ニ堂々ト捺印サル。「信書ノ秘密」トハ言ッタガ「讀マナイ」トハ言ッテ居ナイ。')
    ];
    lines = lines.concat(wafLines('correspondence: ' + msg, '治安維持法'));
    lines.push(L('warn', '特高警察ヘ自動通報。「' + name + '」檢擧 ' + cnt + ' 回目。'));
    return this.ng('信書ノ秘密 — 遮斷（第二十六條）', lines);
  };
})();
