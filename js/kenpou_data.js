// kenpou_data.js — 大日本帝國憲法 全文データ（帝國コンソール檢索用）
// 全七章七十六條、符牒局ノ技手ガ最先端ノ自動演算符牒（JavaScript）デ一字一句手書キシタ。
// 内容ヘノ質問ハ受ケ付ケナイ。ウチハ寫シタダケデアル。
var KENPOU = {
 "title": "大日本帝國憲法",
 "promulgated": "明治二十二年二月十一日",
 "enforced": "明治二十三年十一月二十九日",
 "preamble": [
  {
   "title": "告文（コウモン）",
   "text": "皇朕レ謹ミ畏ミ皇祖皇宗ノ神靈ニ誥ケ白サク皇朕レ天壌無窮ノ宏謨ニ循ヒ惟神ノ宝祚ヲ承繼シ舊圖ヲ保持シテ敢テ失墜スルコト無シ顧ミルニ世局ノ進運ニ膺リ人文ノ發達ニ随ヒ宜ク皇祖皇宗ノ遺訓ヲ明徵ニシ典憲ヲ成立シ條章ヲ昭示シ内ハ以テ子孫ノ率由スル所ト為シ外ハ以テ臣民翼贊ノ道ヲ廣メ永遠ニ遵行セシメ益々國家ノ丕基ヲ鞏固ニシ八洲民生ノ慶福ヲ增進スヘシ茲ニ皇室典範及憲法ヲ制定ス惟フニ此レ皆皇祖皇宗ノ後裔ニ貽シタマヘル統治ノ洪範ヲ紹述スルニ外ナラス而シテ朕カ躬ニ逮テ時ト倶ニ擧行スルコトヲ得ルハ洵ニ皇祖皇宗及我カ皇考ノ威靈ニ倚藉スルニ由ラサルハ無シ皇朕レ仰テ皇祖皇宗ノ神祐ヲ祷リ併セテ朕カ現在及將来ニ臣民ニ率先シ此ノ憲章ヲ履行シテ愆ラサラムコトヲ誓フ庶幾クハ神靈此レヲ鑒ミタマヘ",
   "_comment": "README冒頭に置かれたinit commit message。神々へのmerge request。返信は期待していないが、宛先が皇祖皇宗なので形式だけは最重要である。"
  },
  {
   "title": "憲法發布勅語",
   "text": "朕國家ノ隆昌ト臣民ノ慶福トヲ以テ中心ノ欣榮トシ朕カ祖宗ニ承クルノ大權ニ依リ現在及將来ノ臣民ニ對シ此ノ不磨ノ大典ヲ宣布ス\n惟フニ我カ祖我カ宗ハ我カ臣民ノ祖先ノ協力輔翼ニ倚リ我カ帝國ヲ肇造シ以テ無窮ニ垂レタリ此レ我カ神聖ナル祖宗ノ威德ト並ニ臣民ノ忠實勇武ニシテ國ヲ愛シ公ニ殉ヒ以テ此ノ光輝アル國史ノ成跡ヲ貽シタルニ由ラサルハ無シ朕我カ臣民ハ即チ祖宗ノ忠良ナル臣民ノ子孫ナルヲ回想シ其ノ朕カ意ヲ奉體シ朕カ事ヲ奬順シ相與ニ和衷協同シ益々我カ帝國ノ光榮ヲ中外ニ宣揚シ祖宗ノ遺業ヲ永久ニ鞏固ナラシムルノ希望ヲ同クシ此ノ負擔ヲ分ツニ堪フルコトヲ疑ハサルナリ",
   "_comment": "Production deployの布告。「不磨の大典」=immutable deployment宣言。hotfix不可と高らかに謳った。この宣言が後々どれだけ運用を縛るかは、この時点では誰も知らない。"
  },
  {
   "title": "上諭（ジョウユ）",
   "text": "朕祖宗ノ遺烈ヲ承ケ萬世一系ノ帝位ヲ踐ミ朕カ親愛スル所ノ臣民ハ即チ朕カ祖宗ノ恵撫慈養シタマヒシ所ノ臣民ナルヲ念ヒ其ノ康福ヲ增進シ其ノ懿德良能ヲ發達セシメムコトヲ願ヒ又其ノ翼贊ニ依リ與ニ倶ニ國家ノ進運ヲ扶持セムコトヲ望ミ乃チ明治十四年十月十二日ノ詔命ヲ履踐シ茲ニ大憲ヲ制定シ朕カ率由スル所ヲ示シ朕カ後嗣及臣民及臣民ノ子孫タル者ヲシテ永遠ニ循行スル所ヲ知ラシム\n國家統治ノ大權ハ朕カ之ヲ祖宗ニ承ケテ之ヲ子孫ニ伝フル所ナリ朕及朕カ子孫ハ將来此ノ憲法ノ條章ニ循ヒ之ヲ行フコトヲ愆ラサルヘシ\n朕ハ我カ臣民ノ權利及財産ノ安全ヲ貴重シ及之ヲ保護シ此ノ憲法及法律ノ範囲内ニ於テ其ノ享有ヲ完全ナラシムヘキコトヲ宣言ス\n帝國議會ハ明治二十三年ヲ以テ之ヲ召集シ議會開會ノ時ヲ以テ此ノ憲法ヲシテ有效ナラシムルノ期トスヘシ\n將来若此ノ憲法ノ或ル條章ヲ改定スルノ必要ナル時宜ヲ見ルニ至ラハ朕及朕カ繼統ノ子孫ハ發議ノ權ヲ執リ之ヲ議會ニ付シ議會ハ此ノ憲法ニ定メタル要件ニ依リ之ヲ議決スルノ外朕カ子孫及臣民ハ敢テ之カ紛更ヲ試ミルコトヲ得サルヘシ\n朕カ在廷ノ大臣ハ朕カ為ニ此ノ憲法ヲ施行スルノ責ニ任スヘク朕カ現在及將来ノ臣民ハ此ノ憲法ニ對シ永遠ニ從順ノ義務ヲ負フヘシ",
   "_comment": "EULA。「永遠ニ従順ノ義務ヲ負フヘシ」——Terms of Serviceにagreeしなければ国に住めない。Declineボタンはない。改正の発議権はRoot only(第73條)も、ここで宣言済み。"
  }
 ],
 "chapters": [
  {
   "number": 1,
   "title": "天皇",
   "articles": [
    {
     "number": 1,
     "text": "大日本帝國ハ萬世一系ノ天皇之ヲ統治ス",
     "_comment": "萬世一系のtype declaration。forkもrebaseも不可。なお南北朝という大規模なブランチ分岐インシデントが史上一度だけあったが、どちらがmasterだったかの裁定が確定したのは明治44年。conflictの解決に550年かかった。"
    },
    {
     "number": 2,
     "text": "皇位ハ皇室典範ノ定ムル所ニ依リ皇男子孫之ヲ繼承ス",
     "_comment": "継承規則は別典(皇室典範)で管理。male-line male only。PRはauto-close。詳細は宮内省別館を参照。"
    },
    {
     "number": 3,
     "text": "天皇ハ神聖ニシテ侵スヘカラス",
     "_comment": "Object.freeze(emperor)。immutableかつdelete不可。触ると不敬罪という例外が飛ぶ。例外ハンドラは特高警察。"
    },
    {
     "number": 4,
     "text": "天皇ハ國ノ元首ニシテ統治權ヲ總攬シ此ノ憲法ノ條規ニ依リ之ヲ行フ",
     "_comment": "God Object宣言。全権限がここに集中。SRP? 知らない子ですね。ただし実運用では輔弼(第55條)経由なので、Godが直接手を動かすことは稀。設計と運用の乖離はここから始まる。"
    },
    {
     "number": 5,
     "text": "天皇ハ帝國議會ノ協贊ヲ以テ立法權ヲ行フ",
     "_comment": "sudo権限で立法。「協賛」はあくまでadvisory。final approveはRoot。"
    },
    {
     "number": 6,
     "text": "天皇ハ法律ヲ裁可シ其ノ公布及執行ヲ命ス",
     "_comment": "CI/CDパイプラインのfinal approver。merge権限はRoot only。"
    },
    {
     "number": 7,
     "text": "天皇ハ帝國議會ヲ召集シ其ノ開會閉會停會及衆議院ノ解散ヲ命ス",
     "_comment": "議会のstart/stop/kill権限。SIGKILLもSIGTERMも自由自在。初期議会では予算で揉めるたびに解散が飛び、衆議院の平均uptimeは2年を切っていた。"
    },
    {
     "number": 8,
     "text": "天皇ハ公共ノ安全ヲ保持シ又ハ其ノ災厄ヲ避クル為緊急ノ必要ニ由リ帝國議會閉會ノ場合ニ於テ法律ニ代ルヘキ勅令ヲ發ス\n此ノ勅令ハ次ノ會期ニ於テ帝國議會ニ提出スヘシ若議會ニ於テ承諾セサルトキハ政府ハ將来ニ向テ其ノ效力ヲ失フコトヲ公布スヘシ",
     "_comment": "緊急hotfix権限。reviewer(議会)不在でもmasterにdirect push可。次の会期で承諾されなければ「将来に向かって」効力を失うだけなので、実はやり得である。"
    },
    {
     "number": 9,
     "text": "天皇ハ法律ヲ執行スル為ニ又ハ公共ノ安寧秩序ヲ保持シ及臣民ノ幸福ヲ增進スル為ニ必要ナル命令ヲ發シ又ハ發セシム但シ命令ヲ以テ法律ヲ變更スルコトヲ得ス",
     "_comment": "実行権限はあるがconfigを書き換える権限はない…はず。でも緊急勅令(第8條)でbypass可能。"
    },
    {
     "number": 10,
     "text": "天皇ハ行政各部ノ官制及文武官ノ俸給ヲ定メ及文武官ヲ任免ス但シ此ノ憲法又ハ他ノ法律ニ特例ヲ掲ケタルモノハ各々其ノ條項ニ依ル",
     "_comment": "HR権限。hire/fire/salary全てRoot。kubectl apply -f ministers.yaml。"
    },
    {
     "number": 11,
     "text": "天皇ハ陸海軍ヲ統帥ス",
     "_comment": "⚑ CRITICAL: 統帥権の独立。MilitaryがCabinetを迂回する法的根拠。CVE-1931-0918、CVE-1936-0226、CVE-1941-1208の元凶。たった10文字で帝国を滅ぼした最凶の1行。レビューで誰も指摘しなかったのかと思うだろうが、指摘できる者がいない設計にしたのが本條である。"
    },
    {
     "number": 12,
     "text": "天皇ハ陸海軍ノ編制及常備兵額ヲ定ム",
     "_comment": "MilitaryリソースのCPU/memory allocation。上限なし。auto-scalingが暴走する原因。編制も統帥事項と解釈され、内閣の手が届かない領域が静かに広がっていった。"
    },
    {
     "number": 13,
     "text": "天皇ハ戰ヲ宣シ和ヲ講シ及諸般ノ條約ヲ締結ス",
     "_comment": "外部API連携の全権限。declare_war()もmake_peace()もtreaty.sign()もRoot only。"
    },
    {
     "number": 14,
     "text": "天皇ハ戒厳ヲ宣告ス\n戒厳ノ要件及效力ハ法律ヲ以テ之ヲ定ム",
     "_comment": "lockdown mode。対外戦争用のはずが、発動実績は日比谷焼打(1905)、関東大震災(1923)、二・二六(1936)——全部国内向けである。"
    },
    {
     "number": 15,
     "text": "天皇ハ爵位勳章及其ノ他ノ榮典ヲ授與ス",
     "_comment": "臣民の位階勲等・記章の下賜。GitHubのStarみたいなもの…ただしrevoke権限もある。"
    },
    {
     "number": 16,
     "text": "天皇ハ大赦特赦減刑及復權ヲ命ス",
     "_comment": "Undo権限。unban、account restore全てRootの裁量。司法のrollbackも可能。"
    },
    {
     "number": 17,
     "text": "攝政ヲ置クハ皇室典範ノ定ムル所ニ依ル\n攝政ハ天皇ノ名ニ於テ大權ヲ行フ",
     "_comment": "sudo delegate。Root不在でもsudo -u emperorでproxy実行可能。摂政の詳細は皇室典範(別config)参照。"
    }
   ]
  },
  {
   "number": 2,
   "title": "臣民權利義務",
   "articles": [
    {
     "number": 18,
     "text": "日本臣民タルノ要件ハ法律ノ定ムル所ニ依ル",
     "_comment": "臣民registrationの要件はTerms of Serviceで定める。国民ではなく「臣民」。CustomerではなくSubject。"
    },
    {
     "number": 19,
     "text": "日本臣民ハ法律命令ノ定ムル所ノ資格ニ應シ均ク文武官ニ任セラレ及其ノ他ノ公務ニ就クコトヲ得",
     "_comment": "採用要件を満たせば公務員になれる…はず。実際は身分・性別・思想でfilterにかけられる。"
    },
    {
     "number": 20,
     "text": "日本臣民ハ法律ノ定ムル所ニ從ヒ兵役ノ義務ヲ有ス",
     "_comment": "強制task。cron jobで呼び出される。拒否すると懲役。mandatory background service。徴兵逃れのハックは各種試みられたが、どれもpatch済み。"
    },
    {
     "number": 21,
     "text": "日本臣民ハ法律ノ定ムル所ニ從ヒ納税ノ義務ヲ有ス",
     "_comment": "課金形式。Free Tierは存在しない。全臣民paid plan強制。"
    },
    {
     "number": 22,
     "text": "日本臣民ハ法律ノ範囲内ニ於テ居住及移轉ノ自由ヲ有ス",
     "_comment": "移動の自由…「法律ノ範囲内」。within_the_limits_of_law()でwrapped済み。"
    },
    {
     "number": 23,
     "text": "日本臣民ハ法律ニ依ルニ非スシテ逮捕監禁審問處罰ヲ受クルコトナシ",
     "_comment": "令状のない逮捕は違法…のはず。でも治安維持法という「法律」を作ればlegitimateになる。exploitはコードではなく立法で行うのが帝国流。"
    },
    {
     "number": 24,
     "text": "日本臣民ハ法律ニ定メタル裁判官ノ裁判ヲ受クルノ權ヲ奪ハルルコトナシ",
     "_comment": "裁判を受ける権利。ただし軍法会議は別pipeline。judicial serviceが2系統走っている。"
    },
    {
     "number": 25,
     "text": "日本臣民ハ法律ニ定メタル場合ヲ除ク外其ノ許諾ナクシテ住所ニ侵入セラレ及搜索セラルルコトナシ",
     "_comment": "住居不可侵…「法律ニ定メタル場合ヲ除ク」。特高警察「法律で定めましたー!」でbypass。"
    },
    {
     "number": 26,
     "text": "日本臣民ハ法律ニ定メタル場合ヲ除ク外信書ノ秘密ヲ侵サルルコトナシ",
     "_comment": "通信の秘密。ただし特高DPI(Deep Packet Inspection)は「法律ニ定メタル場合」に該当。全通信intercepted。"
    },
    {
     "number": 27,
     "text": "日本臣民ハ其ノ所有權ヲ侵サルルコトナシ\n公益ノ為必要ナル處分ハ法律ノ定ムル所ニ依ル",
     "_comment": "私有財産の保護…「公益ノ為」なら収用可。Eminent Domain as a Service。"
    },
    {
     "number": 28,
     "text": "日本臣民ハ安寧秩序ヲ妨ケス及臣民タルノ義務ニ背カサル限ニ於テ信教ノ自由ヲ有ス",
     "_comment": "信教の自由…「安寧秩序ヲ妨ケス」「臣民タルノ義務ニ背カサル」=国家神道以外は実質blocked。double firewall。なお政府見解では神社は宗教ではない(神社非宗教論)ため、参拝の強制はこの條に抵触しない。定義の書き換えは仕様変更より速い。"
    },
    {
     "number": 29,
     "text": "日本臣民ハ法律ノ範囲内ニ於テ言論著作印行集會及結社ノ自由ヲ有ス",
     "_comment": "言論・出版・集会・結社の自由。ただし新聞紙条例、保安条例、治安警察法、治安維持法で全部blocked。isBlocked = true。自由を定めた条文は1行、制限する法律は4本。"
    },
    {
     "number": 30,
     "text": "日本臣民ハ相當ノ敬禮ニ從ヒ請願ヲ為スコトヲ得",
     "_comment": "Issueを立てる権利…「相当ノ敬礼ニ従ヒ」=proper templateで。どうせ@tokko-police-botにbanされるが。"
    },
    {
     "number": 31,
     "text": "本章ニ掲ケタル條規ハ戰時又ハ國家事變ノ場合ニ於テ天皇大權ノ施行ヲ妨クルコトナシ",
     "_comment": "⚠ OVERRIDE CLAUSE: 有事には本章の権利が全て無効になる。emergency modeで全臣民のpermissions revoke。"
    },
    {
     "number": 32,
     "text": "本章ニ掲ケタル條規ハ陸海軍ノ法令又ハ紀律ニ牴触セサルモノニ限リ軍人ニ準行ス",
     "_comment": "軍人は別のACLが適用される。military rules > constitution。namespace: militaryは独自policy。"
    }
   ]
  },
  {
   "number": 3,
   "title": "帝國議會",
   "articles": [
    {
     "number": 33,
     "text": "帝國議會ハ貴族院衆議院ノ兩院ヲ以テ成立ス",
     "_comment": "二院制。貴族院=Enterprise Tier、衆議院=Basic Tier。どちらもpaid。"
    },
    {
     "number": 34,
     "text": "貴族院ハ貴族院令ノ定ムル所ニ依リ皇族華族及勅任セラレタル議員ヲ以テ組織ス",
     "_comment": "invite-onlyのclosed beta。public registration不可。VIP only。"
    },
    {
     "number": 35,
     "text": "衆議院ハ選擧法ノ定ムル所ニ依リ公選セラレタル議員ヲ以テ組織ス",
     "_comment": "公選…のはず。ただし選挙権は直接国税15円以上の25歳以上男性のみ=全人口の1.1%。1.1%を「公」と呼ぶセンスは注目に値する。"
    },
    {
     "number": 36,
     "text": "何人モ同時ニ兩議院ノ議員タルコトヲ得ス",
     "_comment": "dual role禁止。multi-tenancy violation。"
    },
    {
     "number": 37,
     "text": "凡テ法律ハ帝國議會ノ協贊ヲ經ルヲ要ス",
     "_comment": "code review必須…と見せかけてRootは第8條でbypass可能。"
    },
    {
     "number": 38,
     "text": "兩議院ハ政府ノ提出スル法律案ヲ議決シ及各々法律案ヲ提出スルコトヲ得",
     "_comment": "PRを出す権利はある。ただしmerge権限はEmperor only。"
    },
    {
     "number": 39,
     "text": "兩議院ノ一ニ於テ否決シタル法律案ハ同會期中ニ於テ再ヒ提出スルコトヲ得ス",
     "_comment": "closedされたPRは同じsprint内でreopen不可。retryは次のsprintで。"
    },
    {
     "number": 40,
     "text": "兩議院ハ法律又ハ其ノ他ノ事件ニ付各々其ノ意見ヲ政府ニ建議スルコトヲ得",
     "_comment": "Feature requestは出せる。ただし対応するかはRoot次第。backlog priorityはEmperorが決める。"
    },
    {
     "number": 41,
     "text": "帝國議會ハ毎年之ヲ召集ス",
     "_comment": "年次standup。年1回、会期3ヶ月。残りの9ヶ月、政府はノーレビューで走る。"
    },
    {
     "number": 42,
     "text": "帝國議會ハ三箇月ヲ以テ會期トス必要アル場合ニ於テハ勅命ヲ以テ之ヲ延長スルコトアルヘシ",
     "_comment": "sprint期間は3ヶ月。延長はRootの勅命で可能。"
    },
    {
     "number": 43,
     "text": "臨時緊急ノ必要アル場合ニ於テ常會ノ外臨時會ヲ召集スヘシ\n臨時會ノ會期ヲ定ムルハ勅命ニ依ル",
     "_comment": "緊急hotfix standup。召集も期間もRootが決定。"
    },
    {
     "number": 44,
     "text": "帝國議會ノ開會閉會會期ノ延長及停會ハ兩院同時ニ之ヲ行フヘシ\n衆議院解散ヲ命セラレタルトキハ貴族院ハ同時ニ停會セラルヘシ",
     "_comment": "両機構のsync実行。衆議院にSIGKILL送ると貴族院もSIGSTOPされる。"
    },
    {
     "number": 45,
     "text": "衆議院解散ヲ命セラレタルトキハ勅命ヲ以テ新ニ議員ヲ選擧セシメ解散ノ日ヨリ五箇月以内ニ之ヲ召集スヘシ",
     "_comment": "process kill後のrestart猶予は5ヶ月。auto-restart with delay。"
    },
    {
     "number": 46,
     "text": "兩議院ハ各々其ノ總議員三分ノ一以上出席スルニ非サレハ議事ヲ開キ議決ヲ為スコトヲ得ス",
     "_comment": "quorum = 1/3。distributed consensusにおけるminimum threshold。"
    },
    {
     "number": 47,
     "text": "兩議院ノ議事ハ過半數ヲ以テ決ス可否同數ナルトキハ議長ノ決スル所ニ依ル",
     "_comment": "majority vote。tie-breakはchair。merge conflictのresolution rule。"
    },
    {
     "number": 48,
     "text": "兩議院ノ會議ハ公開ス但シ政府ノ要求又ハ其ノ院ノ決議ニ依リ秘密會ト為スコトヲ得",
     "_comment": "default: public repo。要求あればprivateにvisibility切り替え可能。"
    },
    {
     "number": 49,
     "text": "兩議院ハ各々天皇ニ上奏スルコトヲ得",
     "_comment": "Rootへのdirect mention権限。ただし読まれるかは不明。"
    },
    {
     "number": 50,
     "text": "兩議院ハ臣民ヨリ呈出スル請願書ヲ受クルコトヲ得",
     "_comment": "臣民からのfeedbackを受け付ける…受け付けるだけ。"
    },
    {
     "number": 51,
     "text": "兩議院ハ此ノ憲法及議院法ニ掲クルモノノ外内部ノ整理ニ必要ナル諸規則ヲ定ムルコトヲ得",
     "_comment": "内部規則策定権限。.editorconfigは自分たちで保持できる。"
    },
    {
     "number": 52,
     "text": "兩議院ノ議員ハ議院ニ於テ發言シタル意見及表決ニ付院外ニ於テ責ヲ負フコトナシ但シ議員自ラ其ノ言論ヲ演説刊行筆記又ハ其ノ他ノ方法ヲ以テ公布シタルトキハ一般ノ法律ニ依リ處分セラルヘシ",
     "_comment": "議場内の発言はimmunity(免責条項)。ただし議場外で同じことを言うとviolation。Slackでの発言はOKだがTwitterはNG。"
    },
    {
     "number": 53,
     "text": "兩議院ノ議員ハ現行犯罪又ハ内乱外患ニ關ル罪ヲ除ク外會期中其ノ院ノ許諾ナクシテ逮捕セラルルコトナシ",
     "_comment": "会期中の不逮捕特権。ただし内乱罪は例外。session有効期間中のban protection…critical incidentは除く。"
    },
    {
     "number": 54,
     "text": "國務大臣及政府委員ハ何時タリトモ各議院ニ出席シ及發言スルコトヲ得",
     "_comment": "adminはいつでもchannelにjoinして発言できる。read-only userを横目に。"
    }
   ]
  },
  {
   "number": 4,
   "title": "國務大臣及樞密顧問",
   "articles": [
    {
     "number": 55,
     "text": "國務各大臣ハ天皇ヲ輔弼シ其ノ責ニ任ス\n凡テ法律勅令其ノ他國務ニ關ル詔勅ハ國務大臣ノ副署ヲ要ス",
     "_comment": "大臣=middleware。Rootのoutputにco-signを付与。ただしreject権限はない。always-approve middleware。ところで「内閣」はこの憲法のどこにも書かれていない。内閣は憲法より先(1885)に官制で存在していたので、憲法は内閣を知らないまま運用された。"
    },
    {
     "number": 56,
     "text": "樞密顧問ハ樞密院官制ノ定ムル所ニ依リ天皇ノ諮詢ニ應ヘ重要ノ國務ヲ審議ス",
     "_comment": "review committee。Rootからの相談には答えるが、final decision権はない。advisory-only pattern…のはずが、実際は条約や緊急勅令に事実上のveto的影響力を持った。advisoryが強くなりすぎる問題は、どの組織にもある。"
    }
   ]
  },
  {
   "number": 5,
   "title": "司法",
   "articles": [
    {
     "number": 57,
     "text": "司法權ハ天皇ノ名ニ於テ法律ニ依リ裁判所之ヲ行フ\n裁判所ノ構成ハ法律ヲ以テ之ヲ定ム",
     "_comment": "司法は「天皇ノ名ニ於テ」実行。namespace: judiciary。独立性が実際に試されたのが大津事件(1891)。政府は死刑を求めたが、大審院は通常の謀殺未遂で裁いた。司法権の独立が守られた美談とされる。守るために院長が担当判事へ直々に働きかけたのはご愛嬌。"
    },
    {
     "number": 58,
     "text": "裁判官ハ法律ニ定メタル資格ヲ具フル者ヲ以テ之ニ任ス\n裁判官ハ刑法ノ宣告又ハ懲戒ノ處分ニ由ルノ外其ノ職ヲ免セラルルコトナシ\n懲戒ノ條規ハ法律ヲ以テ之ヲ定ム",
     "_comment": "裁判官の身分保障。正当な理由なしのterminateは不可…一応。"
    },
    {
     "number": 59,
     "text": "裁判ノ對審判決ハ之ヲ公開ス但シ安寧秩序又ハ風俗ヲ害スルノ虞アルトキハ法律ニ依リ又ハ裁判所ノ決議ヲ以テ對審ノ公開ヲ停ムルコトヲ得",
     "_comment": "裁判は原則public。ただし都合が悪ければprivateにvisibility切り替え可能。"
    },
    {
     "number": 60,
     "text": "特別裁判所ノ管轄ニ屬スヘキモノハ別ニ法律ヲ以テ之ヲ定ム",
     "_comment": "特別裁判所(軍法会議など)。別namespaceで動くindependent judicial service。"
    },
    {
     "number": 61,
     "text": "行政官廳ノ違法處分ニ由リ權利ヲ傷害セラレタリトスル訴訟ニシテ別ニ法律ヲ以テ定メタル行政裁判所ノ裁判ニ屬スヘキモノハ司法裁判所ニ於テ受理スルノ限ニ在ラス",
     "_comment": "行政訴訟は通常の司法にrouteできない。別のindependent serviceにredirect。行政裁判所方式(大陸法式)。"
    }
   ]
  },
  {
   "number": 6,
   "title": "會計",
   "articles": [
    {
     "number": 62,
     "text": "新ニ租税ヲ課シ及税率ヲ變更スルハ法律ヲ以テ之ヲ定ムヘシ\n但シ報償ニ屬スル行政上ノ手數料及其ノ他ノ收納金ハ前項ノ限ニ在ラス\n國債ヲ起シ及豫算ニ定メタルモノヲ除ク外國庫ノ負擔トナルヘキ契約ヲ為スハ帝國議會ノ協贊ヲ經ヘシ",
     "_comment": "課金制度変更は議会approveが必要。ただし手数料は別。国債発行も議会通す…はず。"
    },
    {
     "number": 63,
     "text": "現行ノ租税ハ更ニ法律ヲ以テ之ヲ改メサル限ハ舊ニ依リ之ヲ徵收ス",
     "_comment": "既存の課金制度は変更しない限りそのままauto-renew。subscription auto-renewal。"
    },
    {
     "number": 64,
     "text": "國家ノ歲出歲入ハ毎年豫算ヲ以テ帝國議會ノ協贊ヲ經ヘシ\n豫算ノ款項ニ超過シ又ハ豫算ノ外ニ生シタル支出アルトキハ後日帝國議會ノ承諾ヲ求ムルヲ要ス",
     "_comment": "年間budgetは議会approve制。budget overrunはpost-hoc report…先に使って後で許可をもらう形式。"
    },
    {
     "number": 65,
     "text": "豫算ハ前ニ衆議院ニ提出スヘシ",
     "_comment": "budget案は衆議院が先。衆議院優越の数少ない権限の一つ。first-come rule。"
    },
    {
     "number": 66,
     "text": "皇室經費ハ現在ノ定額ニ依リ毎年國庫ヨリ之ヲ支出シ將来增額ヲ要スル場合ヲ除ク外帝國議會ノ協贊ヲ要セス",
     "_comment": "Root userのmonthly quotaはfixed。increaseしない限り議会approve不要。budget: sacred。"
    },
    {
     "number": 67,
     "text": "憲法上ノ大權ニ基ツケル既定ノ歲出及法律ノ結果ニ由リ又ハ法律上政府ノ義務ニ屬スル歲出ハ政府ノ同意ナクシテ帝國議會之ヲ廢除シ又ハ削減スルコトヲ得ス",
     "_comment": "固定費は議会が勝手に削れない。protected budget。憲法上の大権に基づく歳出は聖域——つまり軍事費の大半が審議の外にある。"
    },
    {
     "number": 68,
     "text": "特別ノ須要ニ因リ政府ハ豫メ年限ヲ定メ繼續費トシテ帝國議會ノ協贊ヲ求ムルコトヲ得",
     "_comment": "multi-year budget。long-term subscription plan。"
    },
    {
     "number": 69,
     "text": "避クヘカラサル豫算ノ不足ヲ補フ為ニ又ハ豫算ノ外ニ生シタル必要ノ費用ニ充ツル為ニ豫備費ヲ設クヘシ",
     "_comment": "reserve fund = contingency buffer。unexpected expenseへのpadding。"
    },
    {
     "number": 70,
     "text": "公共ノ安全ヲ保持スル為緊急ノ需用アル場合ニ於テ内外ノ情形ニ因リ政府ハ帝國議會ヲ召集スルコト能ハサルトキハ勅令ニ依リ財政上必要ノ處分ヲ為スコトヲ得\n前項ノ場合ニ於テハ次ノ會期ニ於テ帝國議會ニ提出シ其ノ承諾ヲ求ムルヲ要ス",
     "_comment": "emergency budget。議会がdownしている時はRoot権限でspend実行。post-hoc reportでOK。"
    },
    {
     "number": 71,
     "text": "帝國議會ニ於テ豫算ヲ議定セス又ハ豫算成立ニ至ラサルトキハ政府ハ前年度ノ豫算ヲ施行スヘシ",
     "_comment": "budgetが通らなかったら前年度のを使う。fallback to last known good config。government shutdownは起きない設計。つまり議会は予算を人質に取れない。審議権は与えたが、拒否しても意味がない作りになっている。設計者の勝ちである。"
    },
    {
     "number": 72,
     "text": "國家ノ歲出歲入ノ決算ハ會計檢査院之ヲ檢査確定シ政府ハ其ノ檢査報告ト倶ニ之ヲ帝國議會ニ提出スヘシ\n會計檢査院ノ組織及職權ハ法律ヲ以テ之ヲ定ム",
     "_comment": "audit log。会計検査院=internal audit team。reportは出す。remediationされるとは言っていない。"
    }
   ]
  },
  {
   "number": 7,
   "title": "補則",
   "articles": [
    {
     "number": 73,
     "text": "將来此ノ憲法ノ條項ヲ改正スルノ必要アルトキハ勅命ヲ以テ議案ヲ帝國議會ノ議ニ付スヘシ\n此ノ場合ニ於テ兩議院ハ各々其ノ總員三分ノ二以上出席スルニ非サレハ議事ヲ開クコトヲ得ス出席議員三分ノ二以上ノ多數ヲ得ルニ非サレハ改正ノ議決ヲ為スコトヲ得ス",
     "_comment": "amendment procedure。proposeはRoot only。voteは2/3 supermajority。事実上のimmutable design。この手続きが動いたことは、v1.0.0の運用期間中、一度もない。"
    },
    {
     "number": 74,
     "text": "皇室典範ノ改正ハ帝國議會ノ議ヲ經ルヲ要セス\n皇室典範ヲ以テ此ノ憲法ノ條規ヲ變更スルコトヲ得ス",
     "_comment": "皇室典範は議会のreview不要。ただし憲法をoverrideもできない。別repositoryのindependent config。正本は宮内省別館にある。"
    },
    {
     "number": 75,
     "text": "憲法及皇室典範ハ攝政ヲ置クノ間之ヲ變更スルコトヲ得ス",
     "_comment": "sudoユーザー実行中はconfig変更禁止。摂政は代行であってownerではないので、契約書には触れない。"
    },
    {
     "number": 76,
     "text": "法律規則命令又ハ何等ノ名稱ヲ用ヰタルニ拘ラス此ノ憲法ニ矛盾セサル現行ノ法令ハ總テ遵由ノ效力ヲ有ス\n從来ノ契約又ハ命令ニシテ後来此ノ憲法ニ掲クル大權ニ關ル者ハ總テ第一條ノ例ニ依ル",
     "_comment": "backwards compatibility clause。既存の法令は憲法に矛盾しない限り有効。legacy codeは動く。太政官布告のかなりの部分がこの條で生き残った。"
    }
   ]
  }
 ],
 "totalArticles": 76
};
