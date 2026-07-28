/* features/modals/modal-article.js — the article reading modal. Article cards carry
   data-article="<index>"; clicking one opens an in-app reading view (no real blog yet).
   Fill/open are split so a language toggle re-renders it (repaintOpenModal). */
  var artOverlay=$("#artOverlay");
  /* currentArticle holds the article OBJECT (like currentJob), never its index: the
     articles hydrate reassigns ARTICLES while a modal can be open, and an index into
     the old array would repaint the modal onto a DIFFERENT live article (or no-op and
     strand the open modal untranslated after a language toggle). */
  var currentArticle=null;
  function fillArticle(a){
    if(!a || !a.title) return;
    if($("#artCat")) $("#artCat").textContent = a.cat[lang];
    if($("#artTitle")) $("#artTitle").textContent = a.title[lang];
    var dek=$("#artDek"); if(dek){ var d=a.dek?a.dek[lang]:""; dek.textContent=d; dek.style.display=d?"":"none"; }
    /* SEO/AIEO extras (admin-authored, optional on every article): the direct-answer
       block sits above the body as a quotable summary, the FAQ pairs render below it,
       and both feed the JSON-LD an answer engine reads. */
    var ans=$("#artAnswer"); if(ans){ var t=(a.seo&&a.seo.directAnswer)||""; ans.textContent=t; ans.style.display=t?"":"none"; }
    var body=$("#artBody"); if(body){ body.innerHTML=((a.body&&a.body[lang])||[]).map(function(p){ return "<p>"+esc(p)+"</p>"; }).join(""); }
    var faqs=(a.seo&&a.seo.faqs&&a.seo.faqs.length)?a.seo.faqs:null;
    var faqWrap=$("#artFaq"), faqList=$("#artFaqList");
    if(faqWrap && faqList){
      faqWrap.hidden=!faqs;
      faqList.innerHTML = faqs ? faqs.map(function(f){
        return "<dt>"+esc(f.q)+"</dt><dd>"+esc(f.a)+"</dd>";
      }).join("") : "";
    }
    setArticleSchema(a);
  }
  /* One <script type="application/ld+json"> kept in sync with the open article:
     Article always, FAQPage only when the editor wrote FAQs. Crawlers that execute
     JS (and AI engines fetching rendered HTML) read it; it never affects layout. */
  function setArticleSchema(a){
    var id="lw-article-schema", node=document.getElementById(id);
    if(!node){ node=document.createElement("script"); node.type="application/ld+json"; node.id=id; document.head.appendChild(node); }
    var seo=a.seo||{}, blocks=[{
      "@context":"https://schema.org", "@type":"Article",
      headline: a.title[lang] || a.title.en || "",
      description: seo.metaDescription || seo.directAnswer || (a.dek?a.dek[lang]:"") || "",
      about: a.cat ? (a.cat[lang]||a.cat.en||"") : "",
      inLanguage: lang,
      author: { "@type":"Organization", name:"LongWave株式会社" },
      publisher: { "@type":"Organization", name:"LongWave株式会社" }
    }];
    if(seo.faqs && seo.faqs.length){
      blocks.push({
        "@context":"https://schema.org", "@type":"FAQPage",
        mainEntity: seo.faqs.map(function(f){
          return { "@type":"Question", name:f.q, acceptedAnswer:{ "@type":"Answer", text:f.a } };
        })
      });
    }
    try{ node.textContent=JSON.stringify(blocks.length>1?blocks:blocks[0]); }catch(e){}
  }
  function openArticle(i){
    var a=ARTICLES[i];
    if(!artOverlay || !a) return;
    currentArticle=a; lastFocus=document.activeElement;
    fillArticle(a);
    openOverlay(artOverlay); $("#artClose").focus();
  }
  document.addEventListener("click", function(e){ var c=e.target.closest("[data-article]"); if(c){ e.preventDefault(); openArticle(+c.getAttribute("data-article")); } });
