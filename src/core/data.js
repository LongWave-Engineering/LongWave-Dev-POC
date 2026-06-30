/* core/data.js — built-in demo fallback data + SPECS */
  /* ---------------- data ---------------- */
  var COMPANIES = {
    tt:{name:"TechTouch", color:"#0ea5a4", mono:"TT", site:"https://techtouch.jp/",
        sector:{en:"Digital Adoption (DAP) · SaaS", ja:"デジタルアダプション（DAP）・SaaS"}}
  };
  var SPECS = LW.SPECS;   /* single source of truth — defined in core/logic.js */

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

  var ARTICLES = [
    {cat:{en:"Language", ja:"言語"}, title:{en:"How much Japanese do you actually need as a developer in Tokyo", ja:"東京のエンジニア職に、実際どれくらいの日本語が必要か"}},
    {cat:{en:"Job hunting", ja:"転職"}, title:{en:"Decoding a Japanese job posting: salary, levels, and what's negotiable", ja:"日本の求人票を読み解く：給与・レベル・交渉できる範囲"}},
    {cat:{en:"Culture", ja:"カルチャー"}, title:{en:"Working at a Japanese product company as a foreign engineer", ja:"外国人エンジニアとして日本のプロダクト企業で働く"}},
    {cat:{en:"Visa", ja:"ビザ"}, title:{en:"The engineer's guide to work visas and relocation to Japan", ja:"エンジニアのための就労ビザと日本への移住ガイド"}},
    {cat:{en:"Interviews", ja:"面接"}, title:{en:"What Japanese tech interviews look like, and how to prepare", ja:"日本の技術面接はどんな流れか、どう準備するか"}},
    {cat:{en:"Career", ja:"キャリア"}, title:{en:"From manual QA to SET: making the jump in Japan", ja:"手動QAからSETへ：日本でのキャリアの広げ方"}}
  ];



