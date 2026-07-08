/* features/modals/modal-article.js — the article reading modal. Article cards carry
   data-article="<index>"; clicking one opens an in-app reading view (no real blog yet).
   Fill/open are split so a language toggle re-renders it (repaintOpenModal). */
  var artOverlay=$("#artOverlay");
  var currentArticle=null;
  function fillArticle(i){
    var a=ARTICLES[i]; if(!a) return;
    if($("#artCat")) $("#artCat").textContent = a.cat[lang];
    if($("#artTitle")) $("#artTitle").textContent = a.title[lang];
    var dek=$("#artDek"); if(dek){ var d=a.dek?a.dek[lang]:""; dek.textContent=d; dek.style.display=d?"":"none"; }
    var body=$("#artBody"); if(body){ body.innerHTML=((a.body&&a.body[lang])||[]).map(function(p){ return "<p>"+esc(p)+"</p>"; }).join(""); }
  }
  function openArticle(i){
    if(!artOverlay || !ARTICLES[i]) return;
    currentArticle=i; lastFocus=document.activeElement;
    fillArticle(i);
    openOverlay(artOverlay); $("#artClose").focus();
  }
  document.addEventListener("click", function(e){ var c=e.target.closest("[data-article]"); if(c){ e.preventDefault(); openArticle(+c.getAttribute("data-article")); } });
