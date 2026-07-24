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
    var body=$("#artBody"); if(body){ body.innerHTML=((a.body&&a.body[lang])||[]).map(function(p){ return "<p>"+esc(p)+"</p>"; }).join(""); }
  }
  function openArticle(i){
    var a=ARTICLES[i];
    if(!artOverlay || !a) return;
    currentArticle=a; lastFocus=document.activeElement;
    fillArticle(a);
    openOverlay(artOverlay); $("#artClose").focus();
  }
  document.addEventListener("click", function(e){ var c=e.target.closest("[data-article]"); if(c){ e.preventDefault(); openArticle(+c.getAttribute("data-article")); } });
