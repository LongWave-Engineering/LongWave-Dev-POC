/* features/articles/articles.js — articles page render */
  /* ---------------- articles page ---------------- */
  function renderArticles(){
    var grid=$("#artGrid"); if(!grid) return;
    grid.innerHTML="";
    ARTICLES.forEach(function(a){
      var node=el("a","art");
      node.href="#/articles";
      node.innerHTML='<span class="cat">'+ esc(a.cat[lang]) +'</span><h4>'+ esc(a.title[lang]) +'</h4><span class="read">'+ t("art_read") +'</span>';
      grid.appendChild(node);
    });
  }

