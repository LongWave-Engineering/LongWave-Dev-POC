/* features/partners/partners.js — rotating partner-logo wall (home hero + Post-a-job).
   Two rows scroll in opposite directions and never stop (no hover pause). Real brand
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
     data-partner-rows="1" → one row (jobs strip); default → two opposite-scroll rows. */
  function renderPartners(){
    var boxes = document.querySelectorAll("[data-partner-marquee]");
    if(!boxes.length || typeof PARTNERS === "undefined" || !PARTNERS.length) return;
    boxes.forEach(function(box){
      if(box.dataset.pmBuilt) return;
      var list = partnerList(box.getAttribute("data-partner-set") || "all");
      if(!list.length) return;
      var html;
      if(box.getAttribute("data-partner-rows") === "1"){
        html = partnerRowHTML(list, false);
      } else {
        var mid = Math.ceil(list.length / 2);
        html = partnerRowHTML(list.slice(0, mid), false) + partnerRowHTML(list.slice(mid), true);  // top←, bottom→
      }
      box.innerHTML = '<div class="logo-rows">'+ html +'</div>';
      if(!box.getAttribute("role")) box.setAttribute("role", "group");   /* expose the aria-label (a bare div is role=generic) */
      box.dataset.pmBuilt = "1";
    });
  }
