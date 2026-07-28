/* features/articles/articles.js — articles page render */
  /* ---------------- articles page ---------------- */
  /* Filled in by modals/modal-article.js (which loads after this file) so the
     overlay registry and the router can reach the reading modal's lifecycle. */
  var LW_ARTICLE_HOOKS={};

  /* Crawler-facing structured data for the WHOLE list, emitted on first paint and
     after every hydrate — no click required, which is the point: the per-article
     block in modal-article.js only exists while a reader has that article open.
     Deliberately no FAQPage here (those answers aren't on screen yet). */
  function setArticlesListSchema(){
    var id="lw-articles-schema", node=document.getElementById(id);
    if(!ARTICLES.length){ if(node && node.parentNode) node.parentNode.removeChild(node); return; }
    if(!node){ node=document.createElement("script"); node.type="application/ld+json"; node.id=id; document.head.appendChild(node); }
    var org={ "@type":"Organization", name:"LongWave\u682a\u5f0f\u4f1a\u793e" };
    var posts=ARTICLES.map(function(a){
      var seo=a.seo||{};
      var post={
        "@type":"BlogPosting",
        headline: a.title[lang] || a.title.en || "",
        description: seo.metaDescription || seo.directAnswer || (a.dek ? (a.dek[lang]||a.dek.en||"") : "") || "",
        inLanguage: lang,
        author: (a.author && a.author.name)
          ? (function(){ var pr={ "@type":"Person", name:a.author.name }; if(a.author.sameAs) pr.sameAs=a.author.sameAs; return pr; })()
          : org,
        publisher: org
      };
      var about=(a.category && (a.category.name[lang]||a.category.name.en)) || (a.cat && (a.cat[lang]||a.cat.en)) || "";
      if(about) post.about=about;
      if(a.tags && a.tags.length) post.keywords=a.tags.join(", ");
      if(a.image && a.image.src && a.image.src.indexOf("http")===0) post.image=[a.image.src];
      if(seo.slug) post.url=location.origin + location.pathname + "#/articles/" + seo.slug;
      return post;
    });
    try{
      node.textContent=JSON.stringify({
        "@context":"https://schema.org", "@type":"Blog",
        name: t("nav_articles") || "Articles",
        publisher: org,
        blogPost: posts
      });
    }catch(e){}
  }

  function renderArticles(){
    var grid=$("#artGrid"); if(!grid) return;
    grid.innerHTML="";
    ARTICLES.forEach(function(a, i){
      var node=el("a","art");
      node.href=(a.seo && a.seo.slug) ? "#/articles/"+a.seo.slug : "#/articles";
      node.setAttribute("data-article", i);   /* modals/modal-article.js delegates the click → opens the reading modal */
      /* An editor-chosen category record wins over the free-text chip, and carries
         its own colour; the hero image and byline are optional in the same way. */
      var chip = (a.category && (a.category.name[lang] || a.category.name.en)) || a.cat[lang];
      var chipStyle = (a.category && a.category.color) ? ' style="color:'+ esc(a.category.color) +'"' : '';
      node.innerHTML=
        (a.image ? '<img class="art-img" src="'+ esc(a.image.src) +'" alt="'+ esc(a.image.alt||"") +'" loading="lazy">' : '')+
        '<span class="cat"'+ chipStyle +'>'+ esc(chip) +'</span><h4>'+ esc(a.title[lang]) +'</h4>'+
        (a.dek ? '<p class="art-dek">'+ esc(a.dek[lang]) +'</p>' : '')+
        (a.author ? '<span class="art-by">'+ esc(a.author.name) +
          (a.author.role && a.author.role[lang] ? ' · '+ esc(a.author.role[lang]) : '') +'</span>' : '')+
        ((a.tags && a.tags.length) ? '<span class="art-tags">'+ a.tags.slice(0,4).map(function(tg){
          return '<span class="art-tag">'+ esc(tg) +'</span>'; }).join("") +'</span>' : '')+
        '<span class="read">'+ t("art_read") +'</span>';
      grid.appendChild(node);
    });
    setArticlesListSchema();
    /* a shared #/articles/<slug> link must land on the article — retried here
       because the hydrate replaces ARTICLES after first paint */
    if(LW_ARTICLE_HOOKS.openFromHash) LW_ARTICLE_HOOKS.openFromHash();
  }

