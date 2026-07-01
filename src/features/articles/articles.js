/* features/articles/articles.js — articles page render */
  /* ---------------- articles page ---------------- */
  function renderArticles(){
    var grid=$("#artGrid"); if(!grid) return;
    grid.innerHTML="";
    ARTICLES.forEach(function(a, i){
      var node=el("a","art");
      node.href="#/articles";
      node.setAttribute("data-article", i);   /* modals.js delegates the click → opens the reading modal */
      node.innerHTML='<span class="cat">'+ esc(a.cat[lang]) +'</span><h4>'+ esc(a.title[lang]) +'</h4>'+
        (a.dek ? '<p class="art-dek">'+ esc(a.dek[lang]) +'</p>' : '')+
        '<span class="read">'+ t("art_read") +'</span>';
      grid.appendChild(node);
    });
  }

