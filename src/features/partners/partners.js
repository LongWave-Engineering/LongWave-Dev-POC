/* features/partners/partners.js — rotating partner-logo marquee render.
   The curated public list is COMPANY_LIST (the marketing roster), NOT the live
   HRMOS client dump — that roster is confidential and must not be splashed on a
   public wall. Logos are clean brand-coloured wordmarks (mark + name): no
   external image requests, so the single-file site stays self-contained and
   works offline. Swap in official SVG assets here if/when brand-approved files
   are provided. Logos are non-interactive — clicking one does nothing. */

  var PARTNERS = (typeof COMPANY_LIST !== "undefined" ? COMPANY_LIST : []).map(function(c){
    return { name:c.name, mono:c.mono, color:c.color };
  });

  function partnerChipHTML(p){
    return '<span class="logo-chip" title="'+ esc(p.name) +'">'+
             '<span class="lc-mark" style="background:'+ esc(p.color) +'">'+ esc(p.mono) +'</span>'+
             '<span class="lc-word" style="color:'+ esc(p.color) +'">'+ esc(p.name) +'</span>'+
           '</span>';
  }

  /* Build each marquee once — the logos don't change with language, so re-running
     applyLang() (lang toggle, live hydrate) must not restart the scroll. */
  function renderPartners(){
    var boxes = document.querySelectorAll("[data-partner-marquee]");
    if(!boxes.length || !PARTNERS.length) return;
    var chips = PARTNERS.map(partnerChipHTML).join("");
    boxes.forEach(function(box){
      if(box.dataset.pmBuilt) return;
      box.innerHTML =
        '<div class="logo-track">'+
          '<div class="logo-set">'+ chips +'</div>'+
          '<div class="logo-set" aria-hidden="true">'+ chips +'</div>'+   /* duplicate for a seamless loop */
        '</div>';
      box.dataset.pmBuilt = "1";
    });
  }
