/* features/testimonials/testimonials.js — shared quote-card grid: engineers we've helped + HR voices */
  /* ---------------- testimonials (engineers + HR voices) ---------------- */
  function renderQuoteGrid(gridId, list){
    var grid=$(gridId); if(!grid) return;
    grid.innerHTML="";
    list.forEach(function(r){
      grid.appendChild(el("article","rev",
        '<p class="quote">“'+ esc(r.q[lang]||r.q.en) +'”</p>'+
        /* safeColor(): admin-authored and reaches a style attribute — validate the
           value, don't just escape it (LW.safeColor, shared with every other sink) */
        '<div class="who"><span class="avatar sm" style="background:'+ esc(safeColor(r.color)) +'">'+ esc(r.init) +'</span>'+
        '<div><div class="nm">'+ esc(r.name) +'</div><div class="rl">'+ esc(r.role[lang]||r.role.en) +'</div></div></div>'));
    });
  }
  function renderReviews(){ renderQuoteGrid("#revGrid", REVIEWS); }
  function renderHRVoices(){ renderQuoteGrid("#hrGrid", HR_VOICES); }



