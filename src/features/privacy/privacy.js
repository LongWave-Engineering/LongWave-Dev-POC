/* features/privacy/privacy.js — LongWave's privacy policy, bilingual (rendered into
   #privacyBody, re-rendered on the language toggle like ARTICLES).
   The Japanese text is LongWave's OFFICIAL policy, kept verbatim; the English is a
   faithful reference translation. If the two differ, the Japanese version governs.
   The contact section reuses the site's existing enquiry form (data-contact → #ctOverlay). */
  var PRIVACY = {
    intro: {
      en: [
        "LongWave Inc. (the “Company”, “we”) recognizes the protection of your personal information as an important responsibility, and establishes this Privacy Policy (Personal Information Protection Policy) as set out below."
      ],
      ja: [
        "LongWave株式会社（以下「当社」といいます。）は、お客様の個人情報の保護を重要な責務と認識し、以下のとおりプライバシーポリシー（個人情報保護方針）を定めます。"
      ]
    },
    sections: [
      {
        h: { en: "Article 1 (General Provisions)", ja: "第1条（総則）" },
        p: {
          en: [
            "“LongWave” (the “Service”) recognizes the protection of personal information as an important social mission and responsibility. In order to build an environment and framework in which users of the Service (“Users”) can use it with confidence and safety, the Company establishes this Policy as the basic matters to be observed in order to appropriately manage and operate the personal information held by the Service."
          ],
          ja: [
            "「LongWave」（以下「本サービス」といいます。）は、個人情報保護を重要な社会的使命・責務と認識し、本サービスの利用者（以下「利用者」といいます。）が本サービスを安心・安全にご利用いただける環境・体制を構築するため、本サービスが保有する個人情報を適切に管理運用するために遵守するべき基本的事項として本保護方針を定めます。"
          ]
        }
      },
      {
        h: { en: "Article 2 (Information We Collect)", ja: "第2条（取得する情報）" },
        p: {
          en: ["When a User uses the Service, we may collect and use the following information."],
          ja: ["利用者が本サービスを利用する際に、以下の情報を取得および利用することがあります。"]
        },
        list: {
          en: [
            "Profile information: When you use the Service, we may collect information such as your name, age, gender, address, phone number, profile photo, educational background, qualifications, and email address.",
            "Third-party service registration information: If you link and connect your Service account with a third-party service account (such as Facebook, LINE, or Apple), we collect the linked third-party service's ID, profile information, and the like.",
            "Usage information: When you use the Service, we may collect information about your usage environment and activity that is automatically sent from your device (device identifier, advertising ID, IP address, cookie information, OS type, browser type, browser language, landing page, number of page views, number of clicks, browsing order, browsing time, search terms, etc.).",
            "Inquiry information: We may collect information about you (such as identity-verification information) through interactions with you via inquiry forms and the like.",
            "Other: We collect information about you that you provide through the Service."
          ],
          ja: [
            "プロフィール情報：利用者が本サービスをご利用いただく際に、氏名、年齢、性別、住所、電話番号、プロフィール写真、学歴、資格、メールアドレス等の情報を取得する場合があります。",
            "第三者サービス登録情報：利用者が本サービスのアカウントを第三者サービス（Facebook、LINE、Apple 等）のアカウントと連携および接続する場合、当社は、連携した第三者サービスのID、プロフィール情報等を取得いたします。",
            "利用状況に関する情報：利用者の本サービスのご利用に際して、利用者の端末から自動的に送信される利用環境や利用状況に関する情報（端末識別子、広告ID、IPアドレス、クッキー情報、OSの種類、ブラウザの種類、ブラウザの言語、ランディングページ、ページ閲覧数、クリック数、閲覧順序、閲覧時間、検索ワード等）を取得する場合があります。",
            "問い合わせ情報：お問い合わせフォーム等での利用者とのやりとり等を通じて、利用者に関する情報（本人確認情報等）を取得する場合があります。",
            "その他：利用者が本サービスで提供する、利用者に関する情報を取得します。"
          ]
        }
      },
      {
        h: { en: "Article 3 (Purposes of Collection and Use of Personal Information)", ja: "第3条（個人情報の取得・利用目的）" },
        p: {
          en: ["In the Service, we collect and use personal information by lawful and fair means for the following purposes. Except where the User has given consent, we do not use the collected personal information beyond the scope necessary to achieve the purposes below."],
          ja: ["本サービスにおいては、以下の目的のため、個人情報を適法かつ公正な手段で取得・利用させていただきます。本サイトでは、利用者本人の同意がある場合を除き、以下の目的達成に必要な範囲を超えて、取得した個人情報を利用しません。"]
        },
        list: {
          en: [
            "To provide the Service smoothly.",
            "To provide useful information related to the Service.",
            "To investigate and analyze usage of the Service and to improve, enhance, and develop its quality.",
            "To tailor (personalize) the content and advertisements displayed in the Service to each customer's interests and needs.",
            "To carry out necessary communications between the Service and Users.",
            "For other purposes agreed between the Service and the User.",
            "For purposes incidental to (1) through (6) above."
          ],
          ja: [
            "本サービスのサービスを円滑に提供するため",
            "本サービスに関連する有益な情報を提供するため",
            "本サービスの利用状況等を調査および分析し、本サービスの品質向上、改善、開発をおこなうため",
            "本サービスに表示するコンテンツや広告等を個別のお客様の興味やニーズに適したものとする（パーソナライズ）ため",
            "本サービスと利用者の間での必要な連絡を行うため",
            "その他本サイトと利用者の間で同意した目的のため",
            "上記（1）から（6）に附随する目的のため"
          ]
        }
      },
      {
        h: { en: "Article 4 (Security Management of Retained Personal Data, etc.)", ja: "第4条（保有個人データの安全管理措置等）" },
        p: {
          en: ["To prevent the loss, damage, leakage, or unauthorized use of retained personal data and to manage it securely, we take the following necessary measures. We also strive to keep personal information accurate and up to date within the scope of the purposes of use."],
          ja: ["保有個人データの滅失、毀損、漏洩及び不正利用等を防止し、その安全管理を行うために必要な以下の措置を講じ、個人情報を安全に管理します。また、個人情報を利用目的の範囲内において、正確かつ最新の状態で管理するように努めます。"]
        },
        list: {
          en: [
            "(1) Personnel security measures: Matters concerning the confidentiality of personal data are set out in our work rules.",
            "(2) Physical security measures: We take measures to prevent the theft or loss of devices, electronic media, and documents that handle personal data.",
            "(3) Technical security measures: We implement access controls to limit the personnel and the scope of the personal-information databases handled."
          ],
          ja: [
            "（1）人的安全管理措置：個人データについての秘密保持に関する事項を就業規則に記載",
            "（2）物理的安全管理措置：個人データを取り扱う機器、電子媒体及び書類等の盗難又は紛失等を防止するための措置を講じる",
            "（3）技術的安全管理措置：アクセス制御を実施して、担当者及び取り扱う個人情報データベース等の範囲を限定"
          ]
        }
      },
      {
        h: { en: "Article 5 (Provision to and Outsourcing to Third Parties)", ja: "第5条（個人情報の第三者への提供・委託）" },
        p: {
          en: ["In the Service, we may provide personal information to third parties only in cases falling under one of the following."],
          ja: ["本サービスでは、以下のいずれかに該当する場合に限り、個人情報を第三者に提供する場合があります。"]
        },
        list: {
          en: [
            "Where the member concerned has given consent.",
            "Where there is a risk to life or property and urgent disclosure is necessary, and it is difficult to obtain that member's consent.",
            "Where we outsource part or all of the operations necessary for running the Service to a third party, or where business is transferred.",
            "In other cases permitted by law."
          ],
          ja: [
            "会員本人の同意がある場合。",
            "生命や財産に危機が生じ、緊急に開示する必要があり、当該会員の同意を得るのが困難な場合。",
            "第三者に対し、本サービスの運営に必要な業務の一部もしくは一切を委託する場合または事業の移管を行う場合。",
            "その他法令で認められる場合。"
          ]
        }
      },
      {
        h: { en: "Article 6 (Disclosure, Correction, and Deletion of Personal Information)", ja: "第6条（個人情報の開示・訂正・削除）" },
        p: {
          en: [
            "When the individual requests disclosure, correction, addition, deletion, or suspension of use of their personal information, we will respond appropriately in accordance with the prescribed procedures after confirming their identity.",
            "Users may request the deletion of their personal information by email.",
            "【Personal Information Inquiry Desk】 LongWave Inc.",
            "For inquiries regarding the handling of personal information, please contact us using the form below."
          ],
          ja: [
            "本人から個人情報の開示、内容の訂正・追加・削除及び利用停止を求められた場合には、所定の手続により、本人であることを確認のうえ、適切にこれに対応します。",
            "利用者はメールより、個人情報の削除を依頼することができます。",
            "【個人情報相談窓口】LongWave株式会社",
            "個人情報の取り扱いに関するお問い合わせは、以下のフォームよりご連絡ください。"
          ]
        }
      }
    ],
    note: {
      en: "This English text is a reference translation of the Japanese privacy policy. In case of any discrepancy, the Japanese version governs.",
      ja: "本英語表記は日本語プライバシーポリシーの参考訳です。相違がある場合は日本語版が優先されます。"
    }
  };

  /* Render the policy into #privacyBody in the current language. Called by applyLang(),
     so it re-renders on the EN/JA toggle. All text is esc()'d; the enquiry button is built
     here (localized) and opens the shared contact modal via the delegated data-contact hook. */
  function renderPrivacy(){
    var box=$("#privacyBody"); if(!box) return;
    var L=lang, H="";
    PRIVACY.intro[L].forEach(function(p){ H+='<p>'+ esc(p) +'</p>'; });
    PRIVACY.sections.forEach(function(s){
      H+='<h2 class="pv-h">'+ esc(s.h[L]) +'</h2>';
      if(s.p && s.p[L]) s.p[L].forEach(function(p){ H+='<p>'+ esc(p) +'</p>'; });
      if(s.list && s.list[L] && s.list[L].length){
        H+='<ul class="pv-list">'+ s.list[L].map(function(li){ return '<li>'+ esc(li) +'</li>'; }).join("") +'</ul>';
      }
    });
    if(PRIVACY.note && PRIVACY.note[L]) H+='<p class="pv-note">'+ esc(PRIVACY.note[L]) +'</p>';
    var formLbl = t("pv_contact_cta");
    H+='<p class="pv-actions"><button class="btn btn--primary" type="button" data-contact>'+ esc(formLbl) +'</button></p>';
    box.innerHTML=H;
  }
