/* features/partners/partners.js — rotating partner-logo wall (home hero + Post-a-job).
   Multiple rows (three by default) scroll in alternating directions and never stop (no
   hover pause). Real brand
   marks come from PARTNER_LOGOS (inlined data URIs, see partners-logos.js); any company
   without one falls back to a brand-coloured monogram. The roster PARTNERS is curated —
   the live HRMOS dump stays confidential. Logos are non-interactive (plain spans, no
   links) so clicking one does nothing, by design. */

  function partnerChipHTML(p){
    var logo = (typeof PARTNER_LOGOS !== "undefined") ? PARTNER_LOGOS[p.name] : null;
    var mark = logo
      ? '<span class="lc-mark lc-mark--img"><img src="'+ esc(logo) +'" alt=""></span>'
      : '<span class="lc-mark" style="background:'+ esc(p.color) +'">'+ esc(p.mono) +'</span>';
    /* real-logo chips: neutral wordmark (the mark carries the colour). fallback chips:
       tint the wordmark with the brand colour so they still read as a logo. */
    var word = '<span class="lc-word"'+ (logo ? '' : ' style="color:'+ esc(p.color) +'"') +'>'+ esc(p.name) +'</span>';
    return '<span class="logo-chip" title="'+ esc(p.name) +'">'+ mark + word +'</span>';
  }

  function partnerRowHTML(list, rev){
    var chips = list.map(partnerChipHTML).join("");
    return '<div class="logo-marquee'+ (rev ? ' logo-marquee--rev' : '') +'">'+
             '<div class="logo-track">'+
               '<div class="logo-set">'+ chips +'</div>'+
               '<div class="logo-set" aria-hidden="true">'+ chips +'</div>'+   /* duplicate → seamless loop */
             '</div>'+
           '</div>';
  }

  /* which slice of the roster a marquee shows: data-partner-set="placements" → only
     companies where we've placed an engineer (jobs page); default → the whole roster. */
  function partnerList(set){
    if(set === "placements") return PARTNERS.filter(function(p){ return p.placement; });
    return PARTNERS;
  }

  /* Build each wall once — logos are language-independent, so re-running applyLang()
     (lang toggle, live hydrate) must not rebuild the DOM and restart the scroll.
     data-partner-rows="1" → one row (jobs strip); "2" → two rows; default → three rows,
     each alternating scroll direction. */
  /* a big-name client shown as a static, larger logo card (Post-a-job showcase) */
  function featureCardHTML(p){
    var logo = (typeof PARTNER_LOGOS !== "undefined") ? PARTNER_LOGOS[p.name] : null;
    var mark = logo
      ? '<span class="pf-mark"><img src="'+ esc(logo) +'" alt=""></span>'
      : '<span class="pf-mark pf-mono" style="background:'+ esc(p.color) +'">'+ esc(p.mono) +'</span>';
    var word = '<span class="pf-name"'+ (logo ? '' : ' style="color:'+ esc(p.color) +'"') +'>'+ esc(p.name) +'</span>';
    return '<div class="pf-card" title="'+ esc(p.name) +'">'+ mark + word +'</div>';
  }

  function renderPartners(){
    if(typeof PARTNERS === "undefined" || !PARTNERS.length) return;
    /* rotating marquee walls (home hero, jobs placements strip) */
    document.querySelectorAll("[data-partner-marquee]").forEach(function(box){
      if(box.dataset.pmBuilt) return;
      var list = partnerList(box.getAttribute("data-partner-set") || "all");
      if(!list.length) return;
      var rowsAttr = box.getAttribute("data-partner-rows");
      var html;
      if(rowsAttr === "1"){
        html = partnerRowHTML(list, false);
      } else {
        var nrows = rowsAttr === "2" ? 2 : 3;          // default: 3 rows across the roster
        var per = Math.ceil(list.length / nrows);
        html = "";
        for(var ri=0; ri<nrows; ri++){
          var slice = list.slice(ri*per, (ri+1)*per);
          if(slice.length) html += partnerRowHTML(slice, ri % 2 === 1);   // alternate ←/→ per row
        }
      }
      box.innerHTML = '<div class="logo-rows">'+ html +'</div>';
      if(!box.getAttribute("role")) box.setAttribute("role", "group");   /* expose the aria-label (a bare div is role=generic) */
      box.dataset.pmBuilt = "1";
    });
    /* curated featured showcase: a few big-name clients as static cards.
       data-partner-feature="Name1,Name2,…" (names must match the roster). */
    document.querySelectorAll("[data-partner-feature]").forEach(function(box){
      if(box.dataset.pfBuilt) return;
      var names = (box.getAttribute("data-partner-feature") || "").split(",").map(function(s){ return s.trim(); }).filter(Boolean);
      var list = names.map(function(nm){ for(var i=0;i<PARTNERS.length;i++){ if(PARTNERS[i].name===nm) return PARTNERS[i]; } return null; }).filter(Boolean);
      if(!list.length) return;
      box.innerHTML = '<div class="partner-feature-grid">'+ list.map(featureCardHTML).join("") +'</div>';
      if(!box.getAttribute("role")) box.setAttribute("role", "group");
      box.dataset.pfBuilt = "1";
    });
  }
