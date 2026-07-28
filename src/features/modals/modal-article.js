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
    /* a managed category record (name + colour) wins over the free-text chip */
    var chipEl=$("#artCat");
    if(chipEl){
      chipEl.textContent = (a.category && (a.category.name[lang] || a.category.name.en)) || a.cat[lang];
      chipEl.style.color = (a.category && a.category.color) ? a.category.color : "";
    }
    if($("#artTitle")) $("#artTitle").textContent = a.title[lang];
    var dek=$("#artDek"); if(dek){ var d=a.dek?a.dek[lang]:""; dek.textContent=d; dek.style.display=d?"":"none"; }
    /* hero image: alt comes from the library record — never invented here */
    var img=$("#artImg");
    if(img){
      if(a.image && a.image.src){ img.src=a.image.src; img.alt=a.image.alt||""; img.hidden=false; }
      else { img.removeAttribute("src"); img.alt=""; img.hidden=true; }
    }
    var by=$("#artBy");
    if(by){
      if(a.author && a.author.name){
        var role=(a.author.role && a.author.role[lang]) ? a.author.role[lang] : "";
        by.textContent = a.author.name + (role ? " · " + role : "");
        by.hidden=false;
      } else { by.textContent=""; by.hidden=true; }
    }
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
  /* Structured data for the OPEN article — Article plus, when the editor wrote
     FAQs, FAQPage. Both are removed again by clearArticleSchema when the modal
     closes: FAQPage may only be asserted while those answers are on screen, and a
     stale block left in <head> would advertise one article's FAQs on every other
     page for the rest of the session.

     The crawler-facing markup is NOT this — it's the Blog/ItemList that
     articles.js emits for the whole list on load (setArticlesListSchema), which
     needs no click to exist. This block is the on-screen truth while reading. */
  function setArticleSchema(a){
    var id="lw-article-schema", node=document.getElementById(id);
    if(!node){ node=document.createElement("script"); node.type="application/ld+json"; node.id=id; document.head.appendChild(node); }
    var seo=a.seo||{}, art={
      "@context":"https://schema.org", "@type":"Article",
      headline: a.title[lang] || a.title.en || "",
      description: seo.metaDescription || seo.directAnswer || (a.dek?a.dek[lang]:"") || "",
      inLanguage: lang,
      /* a named Person (with its profile as sameAs) is what ties the byline to a
         real identity; without an author record the company is the author */
      author: (a.author && a.author.name)
        ? (function(){ var p={ "@type":"Person", name:a.author.name }; if(a.author.sameAs) p.sameAs=a.author.sameAs; return p; })()
        : { "@type":"Organization", name:"LongWave株式会社" },
      publisher: { "@type":"Organization", name:"LongWave株式会社" }
    };
    /* omit `about` entirely when there is no category — an empty string is invalid */
    var about=(a.category && (a.category.name[lang]||a.category.name.en)) || (a.cat && (a.cat[lang]||a.cat.en)) || "";
    if(about) art.about=about;
    /* absolutise a proxy-relative /api/media/<id> so the claim is fetchable */
    if(a.image && a.image.src){
      var iu=a.image.src;
      if(iu.indexOf("/")===0) iu=location.origin+iu;
      if(iu.indexOf("http")===0) art.image=[iu];
    }
    if(a.tags && a.tags.length) art.keywords=a.tags.join(", ");
    /* the canonical address of this article — the same deep link the card shares */
    var canon=articleUrl(a);
    if(canon){ art.url=canon; art.mainEntityOfPage={ "@type":"WebPage", "@id":canon }; }
    var blocks=[art];
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
  /* Remove the open-article markup again. FAQPage may only be asserted while its
     answers are visible, and a leftover block would follow the reader onto every
     other route. Called by the overlay registry when #artOverlay closes. */
  function clearArticleSchema(){
    var n=document.getElementById("lw-article-schema");
    if(n && n.parentNode) n.parentNode.removeChild(n);
  }
  /* Every article with a slug has a shareable deep link: #/articles/<slug>. */
  function articleUrl(a){
    var slug=a.seo && a.seo.slug;
    return slug ? location.origin + location.pathname + "#/articles/" + slug : "";
  }
  function openArticle(i){
    var a=ARTICLES[i];
    if(!artOverlay || !a) return;
    currentArticle=a; lastFocus=document.activeElement;
    fillArticle(a);
    openOverlay(artOverlay); $("#artClose").focus();
    /* Reflect the open article in the URL so it can be copied/shared/reloaded.
       replaceState, not location.hash: assigning the hash fires hashchange, which
       re-runs the router and scroll-resets the list behind the modal. */
    var slug=a.seo && a.seo.slug;
    if(slug && location.hash !== "#/articles/" + slug) setHash("#/articles/" + slug);
  }
  /* Open the article named in #/articles/<slug>, if any — this is what makes a
     shared link land on the article instead of the bare list. */
  var _suppressHashOpen=false;
  function openArticleFromHash(){
    if(_suppressHashOpen){ _suppressHashOpen=false; return; }
    var m=String(location.hash||"").match(/^#\/articles\/([a-z0-9-]+)$/);
    /* Back/Forward off an article: the reader expects the modal gone. Without this
       the overlay stayed open with body scroll locked and its FAQPage markup still
       in <head>, asserting FAQs for a page the reader had navigated away from. */
    if(!m){
      if(artOverlay && artOverlay.classList.contains("open")) closeOverlay(artOverlay);
      return;
    }
    if(artOverlay && artOverlay.classList.contains("open") && currentArticle && currentArticle.seo && currentArticle.seo.slug===m[1]) return;  /* already showing it */
    for(var i=0;i<ARTICLES.length;i++){
      var s=ARTICLES[i].seo;
      if(s && s.slug===m[1]){ openArticle(i); return; }
    }
  }
  window.addEventListener("hashchange", openArticleFromHash);
  LW_ARTICLE_HOOKS.openFromHash=openArticleFromHash;
  /* Closing drops BOTH the per-article markup and the slug from the URL: leaving
     the slug behind would let any later re-render (a language toggle re-runs
     renderArticles) reopen an article the reader had closed. */
  LW_ARTICLE_HOOKS.onClose=function(){
    clearArticleSchema();
    if(/^#\/articles\/.+/.test(String(location.hash||""))) setHash("#/articles");
  };
  /* Update the address bar without firing hashchange (no router re-render, no
     scroll reset); history.replaceState keeps Back pointing where it did. */
  function setHash(h){
    if(window.history && window.history.replaceState){
      try{ window.history.replaceState(null, "", h); return; }catch(e){}
    }
    _suppressHashOpen=true;
    location.hash=h;
  }
  document.addEventListener("click", function(e){ var c=e.target.closest("[data-article]"); if(c){ e.preventDefault(); openArticle(+c.getAttribute("data-article")); } });
