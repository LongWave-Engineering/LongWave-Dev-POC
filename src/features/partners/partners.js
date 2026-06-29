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

  /* Build each wall once — logos are language-independent, so re-running applyLang()
     (lang toggle, live hydrate) must not rebuild the DOM and restart the scroll. */
  function renderPartners(){
    var boxes = document.querySelectorAll("[data-partner-marquee]");
    if(!boxes.length || typeof PARTNERS === "undefined" || !PARTNERS.length) return;
    var mid  = Math.ceil(PARTNERS.length / 2);
    var rowA = PARTNERS.slice(0, mid);          // top row → drifts left
    var rowB = PARTNERS.slice(mid);             // bottom row → drifts right
    var html = '<div class="logo-rows">'+ partnerRowHTML(rowA, false) + partnerRowHTML(rowB, true) +'</div>';
    boxes.forEach(function(box){
      if(box.dataset.pmBuilt) return;
      box.innerHTML = html;
      box.dataset.pmBuilt = "1";
    });
  }
