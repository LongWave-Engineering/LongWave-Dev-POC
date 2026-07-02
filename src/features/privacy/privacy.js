/* features/privacy/privacy.js — bilingual privacy policy (rendered into #privacyBody).
   Content lives here as data (like ARTICLES) so it switches language with applyLang().
   NOTE: this is a plain-language TEMPLATE modelled on bilingual JP job boards
   (TokyoDev / JapanDev). Have it reviewed by legal counsel and confirm the contact
   address / company details before relying on it. Update PRIVACY.updated on any change. */
  var PRIVACY = {
    updated: { en: "Last updated: 2 July 2026", ja: "最終更新日：2026年7月2日" },
    intro: {
      en: [
        "LongWave Dev (“LongWave”, “we”, “us”) is a Tokyo-based recruiting service that connects bilingual and international engineers with product companies in Japan. This Privacy Policy explains what personal information we collect, how we use and share it, and the choices you have.",
        "We handle personal information in accordance with Japan’s Act on the Protection of Personal Information (APPI / 個人情報保護法). By signing up, applying to a role, or contacting us through this site, you agree to the practices described here."
      ],
      ja: [
        "LongWave Dev（以下「LongWave」「当社」）は、バイリンガル・海外のエンジニアと日本のプロダクト企業をつなぐ、東京のリクルーティングサービスです。本プライバシーポリシーは、当社が取得する個人情報の種類、その利用・共有の方法、そしてお客様の選択肢について説明します。",
        "当社は「個人情報の保護に関する法律（個人情報保護法・APPI）」に従って個人情報を取り扱います。本サイトでの登録・応募・お問い合わせをもって、本ポリシーに記載の取り扱いに同意いただいたものとみなします。"
      ]
    },
    sections: [
      {
        h: { en: "Information we collect", ja: "取得する情報" },
        p: {
          en: [
            "Information you give us. When you sign up or apply, we collect your name, email address, and résumé/CV, and — if you provide them — your LinkedIn and GitHub URLs, your Japanese level, years of experience, and your current location and work-eligibility status. If you contact us or post a job, we also collect the details you enter (such as company name, your role, phone number, website, and your message).",
            "Information stored only on your device. The résumé builder (rirekisho / shokumukeirekisho) and the roles you save or apply to are stored in your browser’s local storage. This information stays on your device and is not sent to us unless you choose to submit it.",
            "Information collected automatically. This site is a static page and does not use advertising or cross-site tracking cookies. Our web fonts are served by Google Fonts, which may receive your IP address when the page loads; see Google’s privacy policy for details."
          ],
          ja: [
            "お客様からご提供いただく情報。登録・応募の際に、お名前・メールアドレス・履歴書／職務経歴書を取得します。また、ご入力いただいた場合は、LinkedIn・GitHubのURL、日本語レベル、実務経験年数、現在の居住地・就労資格の状況も取得します。お問い合わせや求人掲載の際は、ご入力いただいた内容（会社名、ご担当者の役職、電話番号、ウェブサイト、メッセージなど）も取得します。",
            "お客様の端末にのみ保存される情報。履歴書・職務経歴書ジェネレーターの入力内容、および保存・応募した求人は、ブラウザのローカルストレージに保存されます。これらはお客様の端末内にとどまり、送信を選択されない限り当社には送信されません。",
            "自動的に取得される情報。本サイトは静的なページであり、広告目的やサイト横断的なトラッキングのためのCookieは使用していません。ウェブフォントはGoogle Fontsから配信されるため、ページ読み込み時にお客様のIPアドレスがGoogleに送信される場合があります。詳細はGoogleのプライバシーポリシーをご確認ください。"
          ]
        }
      },
      {
        h: { en: "How we use your information", ja: "情報の利用目的" },
        p: {
          en: [
            "We use your information to: match you with roles that fit your skills and preferences; contact you as your recruiter about opportunities and next steps; share your profile with prospective employers where relevant (see below); respond to your enquiries; and operate and improve our service."
          ],
          ja: [
            "当社は取得した情報を、次の目的で利用します。お客様のスキルや希望に合う求人とのマッチング、リクルーターとして求人や選考についてご連絡すること、必要に応じて採用企業へお客様のプロフィールを共有すること（下記参照）、お問い合わせへの対応、ならびに当社サービスの運営・改善。"
          ]
        }
      },
      {
        h: { en: "How we share your information", ja: "情報の共有" },
        p: {
          en: [
            "With employers. With your knowledge, we share relevant parts of your profile and résumé with client companies whose roles you’re interested in, or that we believe are a good fit.",
            "With service providers. We use trusted providers to run our recruiting operations — for example, an applicant-tracking / CRM system (such as Manatal) that stores candidate records on our behalf. They may use your data only to provide services to us.",
            "For legal reasons. We may disclose information where required by law, or to protect the rights, safety, and property of our users or LongWave.",
            "We do not sell your personal information."
          ],
          ja: [
            "採用企業への共有。お客様の認識のもと、ご関心のある求人、または当社が適していると判断した求人の採用企業に対し、プロフィールや履歴書の関連部分を共有します。",
            "業務委託先への共有。当社は、採用業務の運営のために信頼できる委託先を利用します。例として、候補者情報を当社に代わって保管する応募者管理／CRMシステム（Manatalなど）があります。委託先は、当社へのサービス提供の目的にのみお客様の情報を利用します。",
            "法令等に基づく開示。法令により必要な場合、またはお客様・利用者・当社の権利・安全・財産を保護するために必要な場合に、情報を開示することがあります。",
            "当社はお客様の個人情報を販売することはありません。"
          ]
        }
      },
      {
        h: { en: "Cookies & local storage", ja: "Cookieとローカルストレージ" },
        p: {
          en: [
            "We use your browser’s local storage to remember your CV draft and the roles you save on your device. We don’t use advertising cookies or third-party trackers. You can clear this data at any time from your browser settings."
          ],
          ja: [
            "当社は、履歴書の下書きや保存した求人をお客様の端末上で記憶するために、ブラウザのローカルストレージを使用します。広告用Cookieや第三者トラッカーは使用していません。これらのデータは、ブラウザの設定からいつでも消去できます。"
          ]
        }
      },
      {
        h: { en: "Data retention", ja: "情報の保存期間" },
        p: {
          en: [
            "We keep your information only as long as needed to provide our recruiting service and to meet any legal or record-keeping requirements. You can ask us to delete your data at any time (see “Your rights”)."
          ],
          ja: [
            "当社は、リクルーティングサービスの提供に必要な期間、および法令上・記録保持上の要件を満たすために必要な期間に限り、お客様の情報を保存します。お客様は、いつでもデータの削除を請求できます（「お客様の権利」をご参照ください）。"
          ]
        }
      },
      {
        h: { en: "Your rights", ja: "お客様の権利" },
        p: {
          en: [
            "Under the APPI you may ask us to disclose, correct, add to, stop using, or delete the personal information we hold about you, and to stop sharing it with third parties. To make a request, contact us using the details below. We’ll respond within a reasonable time after verifying your identity."
          ],
          ja: [
            "個人情報保護法に基づき、お客様は当社が保有するご自身の個人情報について、開示・訂正・追加・利用停止・削除、および第三者提供の停止を請求できます。ご請求の際は、下記の連絡先までご連絡ください。ご本人確認のうえ、合理的な期間内に対応いたします。"
          ]
        }
      },
      {
        h: { en: "If you’re outside Japan", ja: "海外にお住まいの方へ" },
        p: {
          en: [
            "We’re based in Japan and process your information here. The roles we represent generally require you to already have the right to work in Japan, which we note in our sign-up flow. If you apply from abroad, you consent to your information being transferred to and processed in Japan."
          ],
          ja: [
            "当社は日本を拠点とし、日本国内で情報を取り扱います。当社が取り扱う求人は、原則として日本での就労資格を既にお持ちであることが前提であり、登録の流れの中でその旨をご案内しています。海外からご応募いただく場合、お客様の情報が日本へ移転され、日本国内で取り扱われることに同意いただいたものとします。"
          ]
        }
      },
      {
        h: { en: "Security", ja: "安全管理措置" },
        p: {
          en: [
            "We take reasonable technical and organisational measures to protect your information. No method of transmission or storage is completely secure, but we work to safeguard the data you share with us."
          ],
          ja: [
            "当社は、お客様の情報を保護するため、合理的な技術的・組織的措置を講じます。通信や保管の方法に完全に安全なものは存在しませんが、お客様からお預かりした情報の保護に努めます。"
          ]
        }
      },
      {
        h: { en: "Links to other sites", ja: "外部サイトへのリンク" },
        p: {
          en: [
            "Our listings link to company websites and profiles (such as LinkedIn). Those sites have their own privacy policies, and we’re not responsible for their practices."
          ],
          ja: [
            "当社の求人には、企業のウェブサイトやプロフィール（LinkedInなど）へのリンクが含まれます。これらのサイトには独自のプライバシーポリシーがあり、当社はその取り扱いについて責任を負いません。"
          ]
        }
      },
      {
        h: { en: "Children", ja: "未成年の方について" },
        p: {
          en: [
            "This service is intended for working professionals and is not directed to anyone under 18."
          ],
          ja: [
            "本サービスは就業中の社会人を対象としており、18歳未満の方に向けたものではありません。"
          ]
        }
      },
      {
        h: { en: "Changes to this policy", ja: "本ポリシーの変更" },
        p: {
          en: [
            "We may update this policy from time to time. We’ll change the “last updated” date above, and significant changes will be highlighted on this page."
          ],
          ja: [
            "当社は、本ポリシーを随時更新することがあります。更新の際は上部の「最終更新日」を変更し、重要な変更は本ページ上で分かりやすくお知らせします。"
          ]
        }
      },
      {
        h: { en: "Contact us", ja: "お問い合わせ" },
        p: {
          en: [
            "Questions about this policy or your data? Email us at privacy@longwave.co.jp, or use our contact form."
          ],
          ja: [
            "本ポリシーやお客様のデータに関するご質問は、privacy@longwave.co.jp までメールいただくか、お問い合わせフォームをご利用ください。"
          ]
        }
      }
    ]
  };

  /* Render the policy into #privacyBody in the current language. Called by applyLang(),
     so it re-renders on the EN/JA toggle. All text is esc()'d; the two contact actions are
     built here (localized) rather than via data-i18n so they follow the language too. */
  function renderPrivacy(){
    var box=$("#privacyBody"); if(!box) return;
    var L=lang, H="";
    H+='<p class="pv-updated">'+ esc(PRIVACY.updated[L]) +'</p>';
    PRIVACY.intro[L].forEach(function(p){ H+='<p>'+ esc(p) +'</p>'; });
    PRIVACY.sections.forEach(function(s){
      H+='<h2 class="pv-h">'+ esc(s.h[L]) +'</h2>';
      s.p[L].forEach(function(p){ H+='<p>'+ esc(p) +'</p>'; });
    });
    var emailLbl = L==="ja" ? "メールで問い合わせる" : "Email us";
    var formLbl  = L==="ja" ? "お問い合わせフォーム" : "Contact form";
    H+='<p class="pv-actions">'+
         '<a class="btn btn--ghost" href="mailto:privacy@longwave.co.jp">'+ esc(emailLbl) +'</a> '+
         '<button class="btn btn--ghost" type="button" data-contact>'+ esc(formLbl) +'</button>'+
       '</p>';
    box.innerHTML=H;
  }
