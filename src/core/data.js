/* core/data.js — built-in demo fallback data + SPECS */
  /* ---------------- data ---------------- */
  var COMPANIES = {
    tt:{name:"TechTouch", color:"#0ea5a4", mono:"TT", site:"https://techtouch.jp/",
        sector:{en:"Digital Adoption (DAP) · SaaS", ja:"デジタルアダプション（DAP）・SaaS"}}
  };
  var SPECS = LW.SPECS;   /* single source of truth — defined in shared/logic.js */

  var JOBS = [
    {co:"tt", role:"Data Engineer", salary:"¥8M – ¥13M", jp:"business", remote:"partial", abroad:false, visa:false, hot:true, loc:"Tokyo · Ginza", stack:["Python","Snowflake","dbt","AWS"],
     body:"Design, build and run the data pipelines and infrastructure behind TechTouch's Digital Adoption Platform. You'll own ETL, monitoring and internal data products on a modern Snowflake / dbt / Dagster stack, and partner with business and product teams to turn data into value.",
     points:["Built and run a data warehouse (Snowflake, BigQuery, or Databricks)","CI/CD for data infrastructure","Orchestration tools (Airflow, Dagster, or similar)","Business-level Japanese"]},
    {co:"tt", role:"Senior Product Manager (Sr. PdM)", salary:"¥6.5M – ¥12M", jp:"business", remote:"partial", abroad:false, visa:false, hot:true, loc:"Tokyo · Ginza", stack:["B2B SaaS","Product Discovery","Roadmapping"],
     body:"Own discovery-through-delivery for a category-leading B2B SaaS used by 10M+ users. You'll run user research and data analysis, prioritise the roadmap, bridge product and business teams, and help shape new AI-driven products as a core member of a fast-growing startup.",
     points:["B2B software or IT-services background","Turned customer problems into shipped value","Data-driven strategy and planning","Stakeholder alignment; business-level Japanese"]},
    {co:"tt", role:"SRE & Platform Specialist", salary:"¥8M – ¥13M", jp:"business", remote:"partial", abroad:false, visa:false, hot:true, loc:"Tokyo · Ginza", stack:["Go","AWS","Terraform","Security"],
     body:"Own reliability, security and cost across a high-traffic B2B platform end to end, from web app to cloud infra to build pipelines. You'll tackle multi-cloud governance, observability and architecture for demanding enterprise and public-sector customers.",
     points:["Web app or numerically-intensive programming","Hands-on cloud infrastructure operation","Web fundamentals (HTTP, TLS, TCP/IP, networking, security)","Business-level Japanese"]},
    {co:"tt", role:"SRE & Platform Engineer", salary:"¥6M – ¥8.4M", jp:"business", remote:"partial", abroad:false, visa:false, hot:true, loc:"Tokyo · Ginza", stack:["Go","AWS","Terraform"],
     body:"Join the SRE & Platform team building secure, reliable, cost-efficient infrastructure for a 10M-MAU DAP. Open to strong engineers newer to SRE: bring web app or cloud-infra experience and grow across both. Suits SRE- or Platform-Engineer-leaning profiles alike.",
     points:["2+ yrs in web app dev/ops or cloud infrastructure","Web fundamentals (HTTP, TLS, networking, security)","Interest in Go and microservices a plus","Business-level Japanese"]},
    {co:"tt", role:"Analytics Engineer", salary:"¥7M – ¥10M", jp:"business", remote:"partial", abroad:false, visa:false, hot:false, loc:"Tokyo · Ginza", stack:["dbt","SQL","Snowflake","Python"],
     body:"Lead data modelling and build the AI-ready data foundation powering TechTouch's live Text-to-SQL analytics agent. You'll design dbt models, manage data catalogs and metadata, and tune data structures so an in-production AI agent can read and reason over them accurately.",
     points:["Advanced data modelling with dbt and SQL","Data-mart build/run on a DWH (Snowflake, BigQuery, Databricks)","Translate business needs into data architecture","Git-based team development; business-level Japanese"]},
    {co:"tt", role:"SRE & Platform Manager (candidate)", salary:"¥9.5M – ¥13M", jp:"business", remote:"partial", abroad:false, visa:false, hot:false, loc:"Tokyo · Ginza", stack:["Go","AWS","Terraform","Leadership"],
     body:"Lead the SRE & Platform team through TechTouch's shift to a multi-product, multi-cloud, multi-AI-model platform. A playing-manager role: people management and technical strategy alongside hands-on infrastructure work, with a path toward a VPoE-style remit.",
     points:["Web application programming experience","Cloud infrastructure design and governance","Team lead, tech lead, or management experience (any size)","Business-level Japanese"]},
    {co:"tt", role:"Software Engineer in Test (SET)", salary:"¥6M – ¥12M", jp:"business", remote:"partial", abroad:false, visa:false, hot:false, loc:"Tokyo · Ginza", stack:["Playwright","TypeScript","Go","CI/CD"],
     body:"Drive test automation strategy for an enterprise DAP, centred on Playwright E2E plus API and unit tests. You'll optimise the test pyramid with developers, build test infrastructure and CI/CD, and help define quality assurance for new AI / LLM features.",
     points:["E2E automation: build, run, and 3+ yrs implementing","Test design and execution","Playwright / Selenium / Puppeteer; TypeScript, Go","Business-level Japanese"]},
    {co:"tt", role:"QA Engineer", salary:"¥5M – ¥8.5M", jp:"business", remote:"partial", abroad:false, visa:false, hot:false, loc:"Tokyo · Ginza", stack:["Test Design","Qase","BrowserStack"],
     body:"Own quality across the sprint for an enterprise DAP: test analysis, design and execution, regression, and process improvement. You'll also help define quality standards and evaluation for new AI-powered features, where output is non-deterministic.",
     points:["3+ yrs test design and execution","3+ yrs Scrum / agile delivery","3+ yrs testing business SaaS","Business-level Japanese (JSTQB a plus)"]},
    {co:"tt", role:"Customer Success Engineer (CSE)", salary:"¥5.5M – ¥9.5M", jp:"business", remote:"partial", abroad:false, visa:false, hot:false, loc:"Tokyo · Ginza", stack:["JavaScript","Python","AWS"],
     body:"Support enterprise customers end to end, from pre-sales technical design to advanced post-deployment support, on TechTouch's DAP. You'll troubleshoot complex web and front-end issues, shape integrations, and feed real customer insight back into the product alongside engineering and PdM.",
     points:["Front-end (HTML/JS/CSS) or browser DevTools debugging","Web fundamentals (browser, web apps, APIs)","Technical support, pre-sales, or web dev experience","High hospitality; business-level Japanese"]}
  ];

  var JOBS_JA = {
    "Data Engineer":{role:"データエンジニア",
      body:"テックタッチのDAPを支えるデータパイプラインと基盤の設計・構築・運用を担います。Snowflake / dbt / Dagster を中心としたモダンな環境で、ETL・監視・社内向けデータプロダクトをオーナーシップを持って担当し、ビジネス・プロダクトチームと連携してデータを価値に変えます。",
      points:["DWH（Snowflake / BigQuery / Databricks）の構築・運用経験","データ基盤のCI/CD運用経験","オーケストレーションツール（Airflow / Dagster など）の運用経験","ビジネスレベルの日本語"]},
    "Senior Product Manager (Sr. PdM)":{role:"シニアプロダクトマネージャー（Sr. PdM）",
      body:"1,000万人以上が利用するB2B SaaSのプロダクトマネジメントを、ディスカバリーからデリバリーまで一気通貫で担当。ユーザーリサーチと定量分析、ロードマップの優先順位付け、プロダクトとビジネスの橋渡し、生成AIを活用した新プロダクトの企画まで、急成長スタートアップのコアメンバーとして関わります。",
      points:["BtoBソフトウェアまたはITサービスでのご経験","顧客課題を理解し付加価値を形にしたご経験","データ分析に基づく戦略立案のご経験","関係者調整・合意形成／ビジネスレベルの日本語"]},
    "SRE & Platform Specialist":{role:"SRE & Platform スペシャリスト",
      body:"高トラフィックなB2Bプラットフォームの信頼性・セキュリティ・コストを、Webアプリからクラウドインフラ、ビルド／開発環境まで一気通貫で担います。エンタープライズや公共機関の厳しい要件に応えるマルチクラウドのガバナンス、オブザーバビリティ、アーキテクチャに取り組みます。",
      points:["Webアプリまたは数値計算など比較的高度なプログラミング経験","クラウドインフラの開発・運用経験","Web技術要素（HTTP / TLS / TCP-IP / ネットワーク / セキュリティ）の基礎知識","ビジネスレベルの日本語"]},
    "SRE & Platform Engineer":{role:"SRE & Platform エンジニア",
      body:"1,000万MAUのDAPを支える、セキュアで信頼性が高くコスト最適なインフラを構築するSRE&Platformチームに参加。SRE未経験でもポテンシャル重視で歓迎します。Webアプリまたはクラウドインフラの経験を活かし、両領域へ成長できます。SRE志向・Platform Engineer志向のどちらにもフィットします。",
      points:["Webアプリ開発運用またはクラウドインフラの実務2年以上","Web技術要素（HTTP / TLS / ネットワーク / セキュリティ）の基礎知識","Go・マイクロサービスへの興味歓迎","ビジネスレベルの日本語"]},
    "Analytics Engineer":{role:"アナリティクスエンジニア",
      body:"テックタッチで実稼働するText-to-SQL分析AIエージェントを支える、AI Readyなデータ基盤の構築とデータモデリングをリードします。dbtモデルの設計、データカタログ／メタデータ管理、AIエージェントが正確に解釈できるデータ構造の最適化に取り組みます。",
      points:["dbtとSQLによる高度なデータモデリングの実務経験","DWH（Snowflake / BigQuery / Databricks）でのデータマート構築・運用","ビジネス要件をデータ設計に落とし込む力","Gitによるチーム開発／ビジネスレベルの日本語"]},
    "SRE & Platform Manager (candidate)":{role:"SRE & Platform マネージャー候補",
      body:"マルチプロダクト・マルチクラウド・マルチAIモデルへ進化するテックタッチのSRE&Platformチームを率いるリーダー候補。手を動かしつつ、ピープルマネジメントと技術戦略を担うプレイングマネージャーで、将来的にVPoE的な役割も視野に入ります。",
      points:["Webアプリケーションのプログラミング経験","クラウドインフラの設計・ガバナンス構築","チームリーダー／テックリード／マネジメント経験（規模不問）","ビジネスレベルの日本語"]},
    "Software Engineer in Test (SET)":{role:"SET（Software Engineer in Test）",
      body:"エンタープライズDAPのテスト自動化戦略を、Playwrightによる E2E を中心にAPI・ユニットテストまで含めて推進します。開発者と協働してテストピラミッドを最適化し、テスト基盤とCI/CDを整備。AI／LLM機能の品質保証の仕組みづくりにも挑戦します。",
      points:["E2E自動テストの導入・運用、および実装3年以上","テスト設計・実行の経験","Playwright / Selenium / Puppeteer、TypeScript・Go","ビジネスレベルの日本語"]},
    "QA Engineer":{role:"QAエンジニア",
      body:"エンタープライズDAPの品質をスプリント全体で担います。テスト分析・設計・実行、リグレッション、プロセス改善に加え、出力が非決定的なAI活用機能の品質基準策定と評価プロセス構築にも携わります。",
      points:["テスト設計・実行の経験3年以上","スクラムなどアジャイル開発の経験3年以上","業務系SaaSの検証経験3年以上","ビジネスレベルの日本語（JSTQB歓迎）"]},
    "Customer Success Engineer (CSE)":{role:"カスタマーサクセスエンジニア（CSE）",
      body:"テックタッチのDAPで、プリセールスの技術提案から導入設計、導入後の高度な技術サポートまで、お客様を一気通貫で支援します。複雑なWeb・フロントエンドの課題解決やインテグレーションを担い、現場で得た顧客インサイトを開発・PdMと共にプロダクトへ還元します。",
      points:["フロントエンド（HTML / JS / CSS）またはDevToolsでのデバッグ経験","Web基礎知識（ブラウザ / Webアプリ / API）","テクニカルサポート・プリセールス・Web開発のいずれかの経験","高いホスピタリティ／ビジネスレベルの日本語"]}
  };

  /* companies we work with — TechTouch has live roles; others are partner placeholders */
  var COMPANY_LIST = [
    {mono:"TT", color:"#0ea5a4", name:"TechTouch", site:"https://techtouch.jp/", roleCo:"tt",
     sector:{en:"Digital Adoption Platform · SaaS", ja:"デジタルアダプション（DAP）・SaaS"}, loc:"Tokyo · Ginza"},
    {mono:"MF", color:"#0b8457", name:"Money Forward", sector:{en:"Fintech · SaaS", ja:"フィンテック・SaaS"}, loc:"Tokyo"},
    {mono:"en", color:"#1f6f5c", name:"enechain", sector:{en:"Energy · Marketplace", ja:"エネルギー・マーケットプレイス"}, loc:"Tokyo"},
    {mono:"Hu", color:"#3056d3", name:"Hubble", sector:{en:"Legal Tech · SaaS", ja:"リーガルテック・SaaS"}, loc:"Tokyo"},
    {mono:"GO", color:"#111827", name:"GO Inc.", sector:{en:"Mobility", ja:"モビリティ"}, loc:"Tokyo"},
    {mono:"CB", color:"#d4762a", name:"CBcloud", sector:{en:"Logistics · SaaS", ja:"物流・SaaS"}, loc:"Tokyo"},
    {mono:"Da", color:"#5b3df5", name:"Datachain", sector:{en:"Web3 · Interoperability", ja:"Web3・インターオペラビリティ"}, loc:"Tokyo"},
    {mono:"Pk", color:"#e0552b", name:"Pocketalk", sector:{en:"AI Translation", ja:"AI翻訳"}, loc:"Tokyo"}
  ];

  var REVIEWS = [
    {init:"RK", color:"#0b8457", name:"Ren K.", role:{en:"Backend Engineer, Fintech", ja:"バックエンドエンジニア（フィンテック）"},
     q:{en:"LongWave understood the stack I wanted to work in and only sent roles that actually fit. I had an offer in three weeks.", ja:"触りたい技術スタックを理解してくれて、本当に合う求人だけを紹介してくれました。3週間で内定が出ました。"}},
    {init:"MT", color:"#5b3df5", name:"Marisa T.", role:{en:"QA Engineer, SaaS", ja:"QAエンジニア（SaaS）"},
     q:{en:"They prepped me for interviews in both English and Japanese. That made all the difference.", ja:"英語でも日本語でも面接対策をしてくれて、それが大きな違いになりました。"}},
    {init:"DO", color:"#d4762a", name:"Daniel O.", role:{en:"SRE, Mobility", ja:"SRE（モビリティ）"},
     q:{en:"I relocated from abroad. They walked me through the visa and the whole process, step by step.", ja:"海外からの移住でしたが、ビザや全体の流れを一つずつ丁寧にサポートしてくれました。"}}
  ];

  /* HR / hiring-side testimonials shown on the Post-a-job page (placeholders to swap) */
  var HR_VOICES = [
    {init:"AN", color:"#3056d3", name:"Aya N.", role:{en:"Head of Talent, SaaS", ja:"人事責任者（SaaS）"},
     q:{en:"LongWave only sent us candidates who fit our stack and our team. We made two hires in a month.", ja:"私たちの技術スタックとチームに合う候補者だけを紹介してくれました。1か月で2名採用できました。"}},
    {init:"KS", color:"#0ea5a4", name:"Kenji S.", role:{en:"HR Manager, Fintech", ja:"採用マネージャー（フィンテック）"},
     q:{en:"They handled the English–Japanese back-and-forth, so our engineers could focus on the technical interview.", ja:"英語と日本語のやり取りを巻き取ってくれたので、エンジニアは技術面接に集中できました。"}},
    {init:"ML", color:"#b3471b", name:"Marie L.", role:{en:"Engineering Director (hiring)", ja:"エンジニアリングディレクター（採用担当）"},
     q:{en:"Every candidate arrived pre-screened on Japanese level. No more mismatched first interviews.", ja:"候補者は全員、日本語レベルを事前確認済みで来てくれました。ミスマッチな一次面接がなくなりました。"}}
  ];

  /* Each article carries a one-line `dek` and a `body` (array of paragraphs) per language,
     shown in the in-app reading modal (openArticle → #artOverlay). Bodies are placeholder
     editorial to swap for real posts before launch. */
  var ARTICLES = [
    {cat:{en:"Language", ja:"言語"}, title:{en:"How much Japanese do you actually need as a developer in Tokyo", ja:"東京のエンジニア職に、実際どれくらいの日本語が必要か"},
     dek:{en:"The real language bar varies by team. Here's how to read it before you apply.", ja:"求められる日本語のレベルはチーム次第。応募前に見極めるコツ。"},
     body:{en:[
       "A “business-level Japanese” line on a posting is a starting point, not a verdict. Plenty of infrastructure, data, and platform teams at Japanese product companies run day-to-day work in English, while customer-facing and domain-heavy roles lean more on Japanese.",
       "Before you rule a role in or out, ask a simple question: what language do code review, design docs, and incident channels actually happen in? That tells you far more than the headline requirement.",
       "If you're still studying, conversational Japanese plus strong written English is enough to thrive on many teams, and a company serious about hiring bilingual engineers will have a plan to support you."
     ], ja:[
       "求人票の「ビジネスレベルの日本語」は出発点であって結論ではありません。日本のプロダクト企業でも、インフラ・データ・プラットフォーム系のチームは日常業務を英語で進めることが多く、一方で顧客対応やドメイン知識が重い職種は日本語比重が高くなります。",
       "応募を判断する前に、コードレビュー・設計ドキュメント・障害対応のチャンネルが実際に何語で回っているかを聞いてみましょう。見出しの要件よりずっと多くのことが分かります。",
       "学習中でも、日常会話レベルの日本語と確かな英語のライティングがあれば、多くのチームで活躍できます。バイリンガル採用に本気の企業なら、あなたを支える仕組みを用意しています。"
     ]}},
    {cat:{en:"Job hunting", ja:"転職"}, title:{en:"Decoding a Japanese job posting: salary, levels, and what's negotiable", ja:"日本の求人票を読み解く：給与・レベル・交渉できる範囲"},
     dek:{en:"Salary bands, Japanese levels, and what's actually negotiable.", ja:"給与レンジ・日本語レベル・本当に交渉できる項目の読み方。"},
     body:{en:[
       "Japanese postings often show a wide salary band with a note that the final figure depends on experience. The top of the band is usually reachable, but expect it to map to a specific level ladder. Ask where the role sits and what the next rung looks like.",
       "Beyond base pay, clarify remote policy, overtime treatment, and stock or bonus structure early. These are frequently more negotiable than the headline number, especially for bilingual engineers in demand."
     ], ja:[
       "日本の求人票では、幅のある給与レンジに「経験による」と添えられていることがよくあります。上限には届き得ますが、多くの場合は等級（グレード）に対応しています。このポジションがどの等級で、次の等級はどうなるかを確認しましょう。",
       "基本給以外に、リモート方針・残業の扱い・ストックやボーナスの仕組みも早めに確認を。特に需要の高いバイリンガルエンジニアにとっては、見出しの金額より交渉の余地が大きいことが多い項目です。"
     ]}},
    {cat:{en:"Culture", ja:"カルチャー"}, title:{en:"Working at a Japanese product company as a foreign engineer", ja:"外国人エンジニアとして日本のプロダクト企業で働く"},
     dek:{en:"What changes, what doesn't, and how to ramp up fast.", ja:"変わること・変わらないこと、そして早く立ち上がるコツ。"},
     body:{en:[
       "Modern Japanese product companies look a lot like their global peers: Git-based workflows, agile ceremonies, and English-friendly tooling. What differs is often the emphasis on consensus and written context: decisions may take an extra step, but they tend to stick.",
       "The fastest way to ramp is to over-communicate in writing and build a couple of internal allies early. Most teams are glad to explain the “why” behind a process if you ask."
     ], ja:[
       "いまどきの日本のプロダクト企業は、Gitベースのワークフローやアジャイルのセレモニー、英語対応のツールなど、海外の同業とよく似ています。違いはむしろ、合意形成と文書での背景共有を重視する点にあります。意思決定に一手間かかることはありますが、決まったことは定着しやすい傾向です。",
       "早く立ち上がるコツは、文章で多めにコミュニケーションを取り、早い段階で社内に味方を2人ほど作ること。プロセスの「なぜ」を尋ねれば、たいていのチームは喜んで説明してくれます。"
     ]}},
    {cat:{en:"Visa", ja:"ビザ"}, title:{en:"The engineer's guide to work visas and relocation to Japan", ja:"エンジニアのための就労ビザと日本への移住ガイド"},
     dek:{en:"The common visa paths for engineers, and what employers handle.", ja:"エンジニア向けの主な就労ビザと、企業が対応してくれる範囲。"},
     body:{en:[
       "Most engineers come in on the Engineer / Specialist in Humanities visa, and a growing number qualify for the Highly Skilled Professional route, which can speed up permanent residency. Your employer typically sponsors the paperwork; you supply documents and a bit of patience.",
       "Relocation support varies widely: some companies cover flights, temporary housing, and a settling-in allowance, others don't. It's a fair thing to ask about during offer discussions."
     ], ja:[
       "多くのエンジニアは「技術・人文知識・国際業務」の在留資格で来日し、近年は永住申請を早められる可能性がある「高度専門職」に該当する人も増えています。書類手続きは基本的に企業側がスポンサーとなり、あなたは必要書類の準備と少しの忍耐を用意します。",
       "リロケーション支援は企業によってさまざまで、渡航費・一時的な住居・着任手当をカバーするところもあれば、そうでないところもあります。オファー面談の際に確認して問題ない項目です。"
     ]}},
    {cat:{en:"Interviews", ja:"面接"}, title:{en:"What Japanese tech interviews look like, and how to prepare", ja:"日本の技術面接はどんな流れか、どう準備するか"},
     dek:{en:"The formats you'll see, and how they differ from the US/EU.", ja:"遭遇する選考フォーマットと、欧米との違い。"},
     body:{en:[
       "Expect a mix that's familiar and local: a coding or system-design round, plus one or more conversational interviews that probe motivation, team fit, and your reasons for choosing Japan. Take-home tasks are common; whiteboard trivia less so.",
       "Prepare a clear, structured story of your experience and why this company. Interviewers here tend to value concrete examples and calm reasoning over raw speed."
     ], ja:[
       "見慣れたものとローカルなものが混在します。コーディングやシステム設計のラウンドに加えて、志望動機・チームとの相性・日本を選ぶ理由を掘り下げる会話型の面接が1回以上あります。持ち帰り課題はよくありますが、ホワイトボードでの難問クイズは比較的少なめです。",
       "自分の経験と「なぜこの会社か」を、構造立てて明確に語れるよう準備しましょう。面接官は、速さよりも具体的な事例と落ち着いた思考を評価する傾向があります。"
     ]}},
    {cat:{en:"Career", ja:"キャリア"}, title:{en:"From manual QA to SET: making the jump in Japan", ja:"手動QAからSETへ：日本でのキャリアの広げ方"},
     dek:{en:"A realistic path from manual testing into automation roles.", ja:"手動テストから自動化職種への、現実的な移行ルート。"},
     body:{en:[
       "The move from manual QA to Software Engineer in Test is very doable in Japan, where demand for automation skills outstrips supply. Start by automating the tests you already run (Playwright or Cypress on a real feature) and build a small portfolio.",
       "Framing matters: position yourself as a quality engineer who codes, not a tester learning to program. Bilingual candidates who can bridge QA and dev teams are especially sought after."
     ], ja:[
       "手動QAからSET（Software Engineer in Test）への移行は、自動化スキルの需要が供給を上回る日本では十分に現実的です。まずは今実行しているテストを自動化することから始めましょう。実際の機能に対してPlaywrightやCypressで書き、小さなポートフォリオを作ります。",
       "見せ方も重要です。「プログラミングを学んでいるテスター」ではなく、「コードを書く品質エンジニア」として自分を位置づけましょう。QAと開発の橋渡しができるバイリンガル人材は特に求められています。"
     ]}}
  ];



