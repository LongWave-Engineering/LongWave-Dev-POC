/* core/i18n.js — i18n strings, t(), field helpers, HRMOS override, per-job enrichment */
  /* ---------------- i18n ---------------- */
  var I18N = {
    en:{
      nav_jobs:"Jobs", nav_companies:"Companies", nav_articles:"Articles", nav_post:"Post a job", nav_signup:"Sign up",
      partners_lab:"Hiring with us",
      su_title:"Sign up", su_intro:"One sign-up. We take it from there.", su_name:"Name", su_email:"Email", su_want:"I want to",
      su_opt_job:"Find a job", su_opt_hire:"Hire engineers", su_submit:"Sign up", su_success:"You're in. We'll be in touch shortly.",
      su_resume:"Resume / CV", su_resume_note:"Required · PDF, DOC or DOCX",
      su_linkedin:"LinkedIn URL (optional)", su_github:"GitHub URL (optional)",
      su_cv_q:"No Japanese CV yet?", su_cv_link:"Generate your rirekisho →",
      su_company:"Company (optional)", su_hire_hint:"Hiring? You can also post a job →",
      t_h1:"Bilingual talent, meet Japan's best teams.",
      t_sub:"LongWave is a Tokyo recruiting team that connects bilingual and international engineers with Japan's leading product companies, with salary and Japanese level clear from the start.",
      t_cta:"Browse jobs", t_cta2:"See companies",
      jobcount:"{n} open roles right now, hand-picked.",
      pts_h2:"Why work with us",
      pts_sub:"Our job is simple: get bilingual people into the roles that are right for them in Japan.",
      pt1_t:"Every agent is bilingual",
      pt1_b:"You work with recruiters fluent in English and Japanese, so nothing gets lost between you and the company.",
      pt2_t:"We talk tech, so you don't have to",
      pt2_b:"We understand stacks, roles, and what teams actually need. You never have to translate yourself into recruiter-speak.",
      pt3_t:"We match you to what's right",
      pt3_b:"Tell us what you're after. We learn your needs and bring you roles that genuinely fit, not whatever happens to be open.",
      hot_h2:"Roles hiring right now", hot_more:"See all jobs →",
      rev_h2:"Engineers we've helped",
      rev_sub:"Real people, real teams in Japan. (Photos and quotes are placeholders to swap for your own.)",
      hrv_h2:"HR voices",
      hrv_sub:"What hiring teams say about working with us. (Placeholder quotes to swap for your own.)",
      csu_h2:"Tell us what you're looking for",
      csu_sub:"Sign up and a bilingual recruiter brings you roles that fit, with salary and Japanese level up front. No spam, no cold lists.",
      csu_cta:"Sign up free", csu_trust:"Curated in Tokyo by the LongWave team.",
      post_h1:"Hire bilingual engineers in Japan.",
      post_sub:"Post a role with LongWave and a bilingual recruiter brings you matched candidates — pre-screened on stack and Japanese level. You only meet people who fit.",
      post_cta:"Post a job ↗", post_cta2:"Talk to us",
      jobs_h1:"Open roles",
      jobs_sub:"Hand-picked software roles at Japan's product companies. Salary and Japanese level shown on every listing.",
      f_grp_search:"Search", f_grp_jp:"Japanese level", f_grp_rem:"Work style", f_grp_spec:"Specialty", f_grp_stack:"Tech stack", f_grp_loc:"Location",
      filter_search_ph:"Role, company, or stack",
      filter_jp_all:"Any level", filter_jp_none:"No Japanese required", filter_jp_conv:"Conversational", filter_jp_biz:"Business",
      filter_rem_all:"Any work style", filter_rem_full:"Full remote", filter_rem_part:"Hybrid", filter_rem_no:"On-site",
      filter_spec_all:"All specialties", filter_stack_all:"Any tech", filter_loc_all:"Any location", filter_clear:"Clear filters",
      comp_h1:"Companies we work with",
      comp_sub:"The teams hiring through LongWave. (Live roles are shown for TechTouch; other partners are placeholders to confirm.)",
      comp_roles:"{n} open roles", comp_partner:"Hiring with LongWave", comp_view:"View roles →", comp_get:"Get matched →",
      comp_founded:"Founded", comp_size:"Team",
      art_h1:"Articles",
      art_sub:"Notes on being a bilingual engineer in Japan. (Placeholder posts to replace with your own.)",
      art_read:"Read →",
      cv_h1:"Japanese CV generator",
      cv_sub:"Fill in your details and we'll build your 履歴書 (rirekisho) and 職務経歴書 (shokumukeirekisho). They update live, then print or save as PDF.",
      cv_print:"Print / Save as PDF",
      cv_note_fill:"Fill your name, furigana and date of birth to generate.",
      foot_about:"Bilingual software jobs in Japan, run in Tokyo by LongWave株式会社. Every agent is bilingual and talks tech, so you don't have to.",
      foot_explore:"Explore", foot_jobs:"Jobs", foot_companies:"Companies", foot_articles:"Articles",
      foot_more_h:"More", foot_post:"Post a job", foot_resume:"Resume builder", foot_signup:"Sign up", foot_contact:"Contact us",
      foot_legal:"© 2026 LongWave Dev · Built in Tokyo", foot_linkedin:"LinkedIn", foot_longwave:"LongWave",
      m_about:"About the role", m_look:"What they're looking for", m_apply:"Sign up to apply", m_company:"Company site ↗",
      jd_bg:"Why they're hiring", jd_scope:"The role & scope", jd_required:"Must-have skills & experience", jd_nice:"Nice to have", jd_ideal:"Who they're looking for", jd_stack:"Tech stack", jd_team:"Team & org", jd_lang:"Language requirement", jd_office:"Office / location", jd_workstyle:"Work style", jd_hours:"Working hours", jd_comp:"Compensation details", jd_bonus:"Bonus", jd_benefits:"Benefits", jd_holiday:"Holidays & leave", jd_probation:"Probation", jd_selection:"Selection process", jd_notes:"Other notes", jd_na:"Not listed (N/A)", jd_flex:"Flex hours", jd_stock:"Stock options", jd_ot:"Incl. fixed overtime",
      lbl_remote_full:"Fully remote", lbl_remote_partial:"Partially remote", lbl_remote_no:"On-site",
      lbl_abroad:"Apply from abroad", lbl_visa:"Visa support", lbl_salary:"Salary band", salary_neg:"Negotiable",
      lbl_jp_none:"No Japanese required", lbl_jp_conversational:"Conversational JP", lbl_jp_business:"Business JP",
      hot:"Hot", result:"Showing {n} of {total} roles", viewrole:"View role →",
      result_pick:"Choose a filter to see matching roles", prompt_title:"Find the roles that fit you", prompt_sub:"Pick a specialty, tech stack, Japanese level, work style or location on the left — and matching roles appear here. {total} roles are open right now.", prompt_all:"Or browse all {total} roles →"
    },
    ja:{
      nav_jobs:"求人", nav_companies:"企業", nav_articles:"記事", nav_post:"求人を掲載", nav_signup:"登録する",
      partners_lab:"導入企業",
      su_title:"登録する", su_intro:"登録は1回だけ。あとはお任せください。", su_name:"お名前", su_email:"メールアドレス", su_want:"ご希望",
      su_opt_job:"仕事を探す", su_opt_hire:"エンジニアを採用", su_submit:"登録する", su_success:"登録ありがとうございます。すぐにご連絡します。",
      su_resume:"履歴書・職務経歴書", su_resume_note:"必須・PDF / DOC / DOCX",
      su_linkedin:"LinkedIn URL（任意）", su_github:"GitHub URL（任意）",
      su_cv_q:"日本語の履歴書がまだない方", su_cv_link:"履歴書・職務経歴書を作成 →",
      su_company:"会社名（任意）", su_hire_hint:"採用担当の方はこちら：求人を掲載 →",
      t_h1:"日本のトップチームと、バイリンガル人材を。",
      t_sub:"LongWaveは、バイリンガル・海外のエンジニアを日本の主要プロダクト企業につなぐ、東京のリクルーティングチームです。給与も日本語レベルも、最初から明確に。",
      t_cta:"求人を見る", t_cta2:"企業を見る",
      jobcount:"現在、厳選した求人が{n}件あります。",
      pts_h2:"選ばれる理由",
      pts_sub:"私たちの仕事はシンプルです。バイリンガル人材を、日本で本当に合う仕事へ。",
      pt1_t:"全員がバイリンガル",
      pt1_b:"英語と日本語に堪能なリクルーターが対応します。あなたと企業の間で、何も取りこぼしません。",
      pt2_t:"技術がわかるから、通訳はいりません",
      pt2_b:"技術スタックも職種も、チームが本当に必要としていることも理解しています。リクルーター向けに自分を翻訳する必要はありません。",
      pt3_t:"あなたに合う仕事へマッチング",
      pt3_b:"ご希望をお聞かせください。ニーズを理解し、ただ空いている求人ではなく、本当に合う求人をお持ちします。",
      hot_h2:"今、採用中の求人", hot_more:"すべての求人 →",
      rev_h2:"私たちが支援したエンジニア",
      rev_sub:"日本の実在のチームで活躍中の方々です。（写真とコメントは差し替え用のサンプルです。）",
      hrv_h2:"人事の声",
      hrv_sub:"採用チームからいただいた声です。（差し替え用のサンプルコメントです。）",
      csu_h2:"ご希望をお聞かせください",
      csu_sub:"登録すると、バイリンガルのリクルーターが、給与と日本語レベルを明示した上で合う求人をお届けします。スパムや一斉送信はありません。",
      csu_cta:"無料で登録", csu_trust:"東京のLongWaveチームが運営しています。",
      post_h1:"日本でバイリンガルエンジニアを採用。",
      post_sub:"LongWaveに求人を掲載すると、バイリンガルのリクルーターが、技術スタックと日本語レベルで事前選考したマッチ候補者をお届けします。合う人だけにお会いいただけます。",
      post_cta:"求人を掲載 ↗", post_cta2:"相談する",
      jobs_h1:"求人一覧",
      jobs_sub:"日本のプロダクト企業の厳選ソフトウェア求人。給与と日本語レベルを各求人に明示しています。",
      f_grp_search:"検索", f_grp_jp:"日本語レベル", f_grp_rem:"働き方", f_grp_spec:"職種", f_grp_stack:"技術スタック", f_grp_loc:"勤務地",
      filter_search_ph:"職種・企業・技術",
      filter_jp_all:"すべて", filter_jp_none:"日本語不問", filter_jp_conv:"日常会話", filter_jp_biz:"ビジネス",
      filter_rem_all:"すべて", filter_rem_full:"フルリモート", filter_rem_part:"ハイブリッド", filter_rem_no:"出社",
      filter_spec_all:"すべての職種", filter_stack_all:"すべての技術", filter_loc_all:"すべての勤務地", filter_clear:"フィルターをクリア",
      comp_h1:"取引企業",
      comp_sub:"LongWaveを通じて採用しているチームです。（TechTouchは現在募集中の求人を表示。他の企業は確認用のサンプルです。）",
      comp_roles:"募集中 {n}件", comp_partner:"LongWaveで採用中", comp_view:"求人を見る →", comp_get:"マッチングを受ける →",
      comp_founded:"設立", comp_size:"従業員",
      art_h1:"記事",
      art_sub:"日本でバイリンガルエンジニアとして働くためのノート。（差し替え用のサンプル記事です。）",
      art_read:"読む →",
      cv_h1:"履歴書・職務経歴書ジェネレーター",
      cv_sub:"情報を入力すると、履歴書と職務経歴書を作成します。入力に合わせてその場で更新され、印刷やPDF保存ができます。",
      cv_print:"印刷・PDFで保存",
      cv_note_fill:"氏名・ふりがな・生年月日を入力すると生成されます。",
      foot_about:"日本のバイリンガル向けソフトウェア求人。東京のLongWave株式会社が運営。全員がバイリンガルで、技術がわかるから、通訳はいりません。",
      foot_explore:"探す", foot_jobs:"求人", foot_companies:"企業", foot_articles:"記事",
      foot_more_h:"その他", foot_post:"求人を掲載", foot_resume:"履歴書作成", foot_signup:"登録する", foot_contact:"お問い合わせ",
      foot_legal:"© 2026 LongWave Dev · Built in Tokyo", foot_linkedin:"LinkedIn", foot_longwave:"LongWave",
      m_about:"求人について", m_look:"求める人物像", m_apply:"登録して応募", m_company:"企業サイト ↗",
      jd_bg:"募集背景", jd_scope:"業務内容・スコープ", jd_required:"求めるスキル・経験", jd_nice:"あると望ましい経験", jd_ideal:"求める人物像", jd_stack:"技術スタック", jd_team:"チーム・組織", jd_lang:"語学要件", jd_office:"勤務地", jd_workstyle:"働き方", jd_hours:"勤務時間", jd_comp:"給与・待遇の詳細", jd_bonus:"賞与", jd_benefits:"福利厚生", jd_holiday:"休日・休暇", jd_probation:"試用期間", jd_selection:"選考フロー", jd_notes:"備考", jd_na:"記載なし（N/A）", jd_flex:"フレックス", jd_stock:"ストックオプション", jd_ot:"固定残業代込み",
      lbl_remote_full:"フルリモート", lbl_remote_partial:"一部リモート", lbl_remote_no:"出社",
      lbl_abroad:"海外から応募可", lbl_visa:"ビザサポート", lbl_salary:"給与レンジ", salary_neg:"応相談",
      lbl_jp_none:"日本語不問", lbl_jp_conversational:"日常会話レベル", lbl_jp_business:"ビジネスレベル",
      hot:"注目", result:"{total}件中{n}件を表示", viewrole:"詳細を見る →",
      result_pick:"条件を選ぶと求人が表示されます", prompt_title:"あなたに合う求人を探す", prompt_sub:"左の職種・技術スタック・日本語レベル・働き方・勤務地から条件を選ぶと、合致する求人がここに表示されます。現在{total}件の求人があります。", prompt_all:"すべての求人（{total}件）を見る →"
    }
  };

  var lang="en";
  function t(k){ return (I18N[lang] && I18N[lang][k]!=null) ? I18N[lang][k] : (I18N.en[k]||k); }
  var $ = function(s,c){ return (c||document).querySelector(s); };
  function el(tag,cls,html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  /* pure helpers live in 05-logic.js (LW.*); alias the app-wide ones for brevity */
  var esc = LW.esc, salaryMax = LW.salaryMax;
  function nl2br(s){ return esc(s).replace(/\n/g,"<br>"); }

  function jpTag(level){ return '<span class="tag '+ LW.jpTagClass(level) +'">'+ esc(t("lbl_jp_"+level)) +'</span>'; }
  function remoteLabel(r){ return t("lbl_remote_"+r); }
  function roleL(j){ return (lang==="ja" && JOBS_JA[j.role]) ? JOBS_JA[j.role].role : j.role; }
  function bodyL(j){ return (lang==="ja" && JOBS_JA[j.role]) ? JOBS_JA[j.role].body : j.body; }
  function pointsL(j){ return (lang==="ja" && JOBS_JA[j.role]) ? JOBS_JA[j.role].points : j.points; }
  function locL(j){ return (lang==="ja" && j.loc==="Tokyo · Ginza") ? "東京・銀座" : j.loc; }
  /* company avatar: embedded logo when present, else the coloured monogram */
  function avatarHTML(c, cls){
    var k=' class="avatar'+(cls?" "+cls:"")+'"';
    if(c && c.logo) return '<span'+k+' style="background:#fff"><img src="'+c.logo+'" alt=""></span>';
    return '<span'+k+' style="background:'+((c&&c.color)||"#888")+'">'+ esc((c&&c.mono)||"?") +'</span>';
  }
  var BLURB = {
    "Data Engineer":{en:"Own the Snowflake / dbt pipelines behind a 10M-user DAP.", ja:"1,000万ユーザーのDAPを支えるSnowflake / dbt基盤を担当。"},
    "Senior Product Manager (Sr. PdM)":{en:"Discovery to delivery on a category-leading B2B SaaS.", ja:"カテゴリーをリードするB2B SaaSをディスカバリーからデリバリーまで。"},
    "SRE & Platform Specialist":{en:"Reliability, security and cost across a high-traffic platform.", ja:"高トラフィック基盤の信頼性・セキュリティ・コストを担当。"},
    "SRE & Platform Engineer":{en:"Grow into SRE on a 10M-MAU platform with Go and AWS.", ja:"10M MAUの基盤でSREへ成長。Go・AWS。"},
    "Analytics Engineer":{en:"Build the AI-ready data layer behind a live Text-to-SQL agent.", ja:"稼働中のText-to-SQL AIを支えるAI Readyなデータ基盤を構築。"},
    "SRE & Platform Manager (candidate)":{en:"Lead the SRE team through a multi-cloud, multi-AI shift.", ja:"マルチクラウド・マルチAIへの移行をSREチームでリード。"},
    "Software Engineer in Test (SET)":{en:"Drive Playwright E2E and CI/CD test strategy.", ja:"Playwright E2EとCI/CDのテスト戦略を推進。"},
    "QA Engineer":{en:"Own sprint quality, including non-deterministic AI features.", ja:"非決定的なAI機能を含むスプリント全体の品質を担当。"},
    "Customer Success Engineer (CSE)":{en:"Pre-sales to deep support for enterprise DAP customers.", ja:"エンタープライズDAP顧客をプリセールスから高度サポートまで支援。"}
  };
  /* ---- optional generated data from the HRMOS sync (jobs.js sets window.__HRMOS_DATA__) ----
     Falls back to the built-in lists above when no generated data is present. */
  if (window.__HRMOS_DATA__) {
    var _D = window.__HRMOS_DATA__;
    if (_D.COMPANIES) { for (var _k in _D.COMPANIES) COMPANIES[_k] = _D.COMPANIES[_k]; }
    if (_D.JOBS && _D.JOBS.length) { JOBS = _D.JOBS; }
    if (_D.JOBS_JA) { for (var _k2 in _D.JOBS_JA) JOBS_JA[_k2] = _D.JOBS_JA[_k2]; }
    if (_D.BLURB) { for (var _k3 in _D.BLURB) BLURB[_k3] = _D.BLURB[_k3]; }
  }
  function blurbL(j){ var b=BLURB[j.role]; return b ? (lang==="ja"?b.ja:b.en) : ""; }

  /* ---------------- enrich every loaded job (demo or HRMOS) ----------------
     classifySpec / locFromAddr now live in 05-logic.js (LW.*) so they are unit
     tested. Here we apply them once and precompute, per job:
       _i   = original index into JOBS (so render loops avoid O(n) indexOf)
       _hay = lowercased free-text search index (so filtering never rebuilds it) */
  for (var _ji=0; _ji<JOBS.length; _ji++){
    var _job = JOBS[_ji];
    _job._i = _ji;
    _job.spec = LW.classifySpec(_job);
    var _nl = LW.locFromAddr(_job.office || _job.loc);
    if(_nl) _job.loc = _nl;
    var _jaRole = JOBS_JA[_job.role] ? JOBS_JA[_job.role].role : "";
    _job._hay = LW.searchHay(_job, _jaRole, (COMPANIES[_job.co] || {}).name);
  }



