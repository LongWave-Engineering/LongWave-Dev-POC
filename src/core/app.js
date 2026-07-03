/* core/app.js — applyLang, listeners, hash router, nav, header-scroll, reveal */
  /* ---------------- i18n apply ---------------- */
  function applyLang(){
    document.documentElement.lang=lang;
    /* Fall back to English when a key is missing in the active language — same
       rule as t() — so the two never diverge (e.g. a JA gap shows EN, not blank). */
    document.querySelectorAll("[data-i18n]").forEach(function(n){ var k=n.getAttribute("data-i18n"); var v=I18N[lang][k]!=null?I18N[lang][k]:I18N.en[k]; if(v!=null) n.innerHTML=v; });
    document.querySelectorAll("[data-i18n-ph]").forEach(function(n){ var k=n.getAttribute("data-i18n-ph"); var v=I18N[lang][k]!=null?I18N[lang][k]:I18N.en[k]; if(v!=null) n.setAttribute("placeholder", v); });
    buildSpecSelect(); buildStackSelect(); buildLocSelect(); renderJobs(); renderTeaser(); renderCompanies(); renderArticles(); renderReviews(); renderHRVoices(); renderCV(); renderPartners(); renderPrivacy();
    var jc=$("#jobCount"); if(jc) jc.innerHTML = t("jobcount").replace("{n}","<b>"+JOBS.length+"</b>");
    document.querySelectorAll(".lang button").forEach(function(b){ var on=b.getAttribute("data-lang")===lang; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on?"true":"false"); });
    /* an open JD modal's Save/Apply buttons hold runtime state the data-i18n sweep above
       just clobbered — repaint them in the new language */
    if(typeof repaintOpenModal==="function") repaintOpenModal();
    sizeHeadWaves();   /* text may have changed length (EN⇄JA) → re-fit the heading waves */
  }
  /* Language toggle: crossfade the content so the mass text-swap reads as a smooth
     transition, not a flicker. The toggle button updates instantly (feedback while the
     content fade is deferred); under prefers-reduced-motion we swap with no fade. */
  var langFadeTimer=null;
  function setLang(l){
    if(l===lang) return;
    lang=l; try{ localStorage.setItem("lw_lang", l); }catch(e){}
    document.querySelectorAll(".lang button").forEach(function(b){ var on=b.getAttribute("data-lang")===lang; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on?"true":"false"); });
    var de=document.documentElement;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(langFadeTimer){ clearTimeout(langFadeTimer); langFadeTimer=null; }
    if(reduce){ de.classList.remove("lang-switching"); applyLang(); return; }
    de.classList.add("lang-switching");   /* fade content out (opacity → 0 via CSS) */
    langFadeTimer=setTimeout(function(){   /* once faded, swap all copy while invisible, then fade back in */
      applyLang(); de.classList.remove("lang-switching"); langFadeTimer=null;
    }, 170);   /* just past the .16s opacity fade-out in motion.css, so copy swaps while hidden */
  }
  document.querySelectorAll(".lang button").forEach(function(b){ b.addEventListener("click", function(){ setLang(b.getAttribute("data-lang")); }); });

  /* ---------------- filters listeners ---------------- */
  /* Debounce the search box so the silky card-reveal plays once you pause typing,
     not on every keystroke. Dropdowns fire on `change`, so they animate instantly. */
  function debounce(fn,ms){ var tid; return function(){ var c=this,a=arguments; clearTimeout(tid); tid=setTimeout(function(){ fn.apply(c,a); }, ms); }; }
  var renderJobsDebounced=debounce(renderJobs,170);
  ["#filterSearch","#filterJp","#filterRemote","#filterSpec","#filterStack","#filterLoc"].forEach(function(sel){
    var n=$(sel); if(n) n.addEventListener(sel==="#filterSearch"?"input":"change", sel==="#filterSearch"?renderJobsDebounced:renderJobs);
  });
  var _clear=$("#filterClear");
  if(_clear) _clear.addEventListener("click", function(){
    ["#filterSearch","#filterJp","#filterRemote","#filterSpec","#filterStack","#filterLoc"].forEach(function(s){ if($(s)) $(s).value=""; });
    showAllJobs=false;
    renderJobs();
  });

  /* ---------------- routing ---------------- */
  /* route set + hash→route resolution now live in core/logic.js (LW.*) so they're
     unit-tested and defined once. */
  var ROUTES=LW.ROUTES;
  function routeFromHash(){ return LW.routeFor(location.hash); }
  /* Show `route` with NO visible scroll motion, then fade the new page in from the top.
     The trick: hide every page (so nothing tall is on screen) and snap scroll to 0 with
     instant behaviour — all in one synchronous tick, before the browser paints — THEN
     reveal the chosen page, which fades in via .page.active. You never see a scroll-up;
     the only motion is the new page fading into its top. */
  function showRoute(route){
    var next=$("#page-"+route); if(!next) return;
    var de=document.documentElement, body=document.body;
    var prevHtml=de.style.scrollBehavior, prevBody=body.style.scrollBehavior;
    de.style.scrollBehavior="auto"; body.style.scrollBehavior="auto";   // force instant, beat html{scroll-behavior:smooth}
    ["home","jobs","companies","articles","cv","post","privacy"].forEach(function(r){ var p=$("#page-"+r); if(p) p.classList.remove("active"); });
    window.scrollTo(0,0);
    de.style.scrollBehavior=prevHtml; body.style.scrollBehavior=prevBody;
    next.classList.add("active");                       // fades in at the top via pageFade
    next.querySelectorAll(".reveal").forEach(function(n){ n.classList.add("in"); });
    sizeHeadWaves();   /* the page's heading waves can only be measured now it's visible */
    document.querySelectorAll(".nav-links a[data-go]").forEach(function(a){ var on=a.getAttribute("data-go")===route; a.classList.toggle("active", on); if(on) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  }
  function go(route){
    var targetHash=ROUTES[route]||"#/";
    if(location.hash===targetHash){ showRoute(route); } else { location.hash=targetHash; }
  }
  function router(){ showRoute(routeFromHash()); }
  window.addEventListener("hashchange", router);
  document.addEventListener("click", function(e){
    var link=e.target.closest("[data-go]");
    if(link){
      e.preventDefault();
      /* "View roles" on a company card → land on Jobs already filtered to that
         company (search matches the company name in each job's search index),
         instead of the empty pick-a-filter prompt. */
      var co=link.getAttribute("data-co-search");
      if(co && link.getAttribute("data-go")==="jobs"){
        var fs=$("#filterSearch"); if(fs) fs.value=co;
        showAllJobs=false; renderJobs();
      }
      go(link.getAttribute("data-go"));
      if(navLinks) navLinks.classList.remove("show");
      [jobOverlay, suOverlay, coOverlay, ctOverlay, pjOverlay, artOverlay].forEach(function(o){ if(o && o.classList.contains("open")) closeOverlay(o); });
    }
  });

  /* ---------------- external links ---------------- */
  var _li=$("#linkedinBtn"); if(_li) _li.href=LINKS.linkedin;
  var _lw=$("#longwaveBtn"); if(_lw) _lw.href=LINKS.longwave;

  /* ---------------- mobile menu ---------------- */
  var menuToggle=$("#menuToggle"), navLinks=$("#navLinks");
  if(menuToggle && navLinks){
    menuToggle.addEventListener("click", function(){
      var open=navLinks.classList.toggle("show");
      menuToggle.setAttribute("aria-expanded", open?"true":"false");
    });
  }

  /* ---------------- header shadow on scroll ---------------- */
  var siteHeader=document.querySelector("header.site");
  if(siteHeader){
    var onScroll=function(){ siteHeader.classList.toggle("scrolled", window.scrollY>8); };
    window.addEventListener("scroll", onScroll, {passive:true});
    onScroll();
  }

  /* ---------------- heading wave sizing ----------------
     The brand wave under a centred section heading should span the WIDEST line of that
     heading block (its title or its sub), so it visually "matches the text" instead of
     being a fixed-width bar. Measured live from the rendered line boxes (Range rects) so
     it adapts to EN⇄JA line lengths and to wrapping at any viewport width. A hidden page
     yields 0 rects → we leave the CSS clamp fallback and re-measure on route/resize/lang. */
  function sizeHeadWaves(){
    document.querySelectorAll(".head.center").forEach(function(h){
      var w=0;
      h.querySelectorAll("h1,h2,.sub").forEach(function(el){
        if(!el.firstChild) return;
        var r; try{ r=document.createRange(); r.selectNodeContents(el); }catch(e){ return; }
        var rects=r.getClientRects();
        for(var i=0;i<rects.length;i++){ if(rects[i].width>w) w=rects[i].width; }
      });
      if(w>2){
        /* the heading may still be mid reveal-entrance (motion.css: .reveal starts at
           scale(.985)); getClientRects inherits that scale, so divide it out to store the
           SETTLED width — otherwise the wave stays ~1.5% narrow after the transform ends. */
        var sx=1, tf=getComputedStyle(h).transform;
        if(tf && tf.indexOf("matrix")===0){ var a=parseFloat(tf.slice(tf.indexOf("(")+1)); if(a>0.01 && a<=1.5) sx=a; }
        h.style.setProperty("--wave-w", Math.round(w/sx)+"px");
      }
    });
  }
  window.addEventListener("resize", debounce(sizeHeadWaves,150));
  /* web fonts change glyph metrics → re-fit once they're ready (fallback-safe if unsupported) */
  if(document.fonts && document.fonts.ready && document.fonts.ready.then){ document.fonts.ready.then(sizeHeadWaves).catch(function(){}); }

  /* ---------------- reveal ---------------- */
  function initReveal(){
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } }); }, {threshold:.12});
      document.querySelectorAll(".reveal").forEach(function(n){ io.observe(n); });
    } else { document.querySelectorAll(".reveal").forEach(function(n){ n.classList.add("in"); }); }
  }

  /* ---------------- backend probe ----------------
     One-shot /api/health check at boot: proves a real backend is reachable (vs. a static
     host that has no /api), so the write path can be honest instead of firing form submits
     into a 404 and faking success. Runs early; resolves well before a user finishes a form. */
  function probeApi(){
    if(!served()) return;   /* file:// → definitely no API */
    var ctrl=(typeof AbortController!=="undefined")?new AbortController():null;
    var timer=ctrl?setTimeout(function(){ ctrl.abort(); },5000):null;
    fetch("/api/health", ctrl?{signal:ctrl.signal}:undefined)
      .then(function(r){ apiReady = !!(r && r.ok); })
      .catch(function(){ apiReady=false; })
      .then(function(){ if(timer) clearTimeout(timer); });
  }

  /* ---------------- live data (progressive enhancement) ----------------
     The bundle ships an embedded snapshot so it works offline as a single file.
     When the page is SERVED by the backend, pull live jobs + companies so admin
     edits / adds / hides show up. Any failure (offline, opened as a file, no
     backend) silently keeps the embedded snapshot — the site never breaks. */
  function hydrateFromApi(){
    if(!served()) return;   /* opened as a file → no API */
    /* time-bound each fetch so a hung/slow backend can never leave the live upgrade pending
       forever — on abort/timeout we fall back to the embedded snapshot, same as any failure. */
    var grab=function(p){
      var ctrl=(typeof AbortController!=="undefined")?new AbortController():null;
      var timer=ctrl?setTimeout(function(){ ctrl.abort(); },5000):null;
      return fetch(p, ctrl?{signal:ctrl.signal}:undefined)
        .then(function(r){ return r.ok?r.json():null; })
        .catch(function(){ return null; })
        .then(function(v){ if(timer) clearTimeout(timer); return v; });
    };
    Promise.all([grab("/api/jobs"), grab("/api/companies")]).then(function(res){
      var jobs=res[0], cos=res[1];
      /* need BOTH live jobs AND their companies — swapping in jobs without the companies
         they reference would make COMPANIES[job.co] undefined and crash every render
         (avatarHTML/cardHTML/openJob read .name/.sector). Keep the embedded snapshot instead. */
      if(!Array.isArray(jobs) || !jobs.length || !Array.isArray(cos)) return;
      cos.forEach(function(c){
        if(!c || c.id==null) return;   /* skip malformed rows so COMPANIES[undefined] can't poison lookups */
        COMPANIES[c.id]={ name:c.name||c.id, mono:c.mono, color:c.color, logo:c.logo, site:c.site,
          sector:{ en:c.sector_en||"", ja:c.sector_ja||"" }, loc:c.loc };
      });
      /* belt-and-suspenders: drop any live job whose company didn't come through */
      jobs=jobs.filter(function(j){ return COMPANIES[j.co]; });
      if(!jobs.length) return;
      JOBS=jobs;
      enrichJobs();
      selected={};   /* selection is keyed by the old _i indices — reset it for the new dataset */
      applyLang();   /* re-render everything (cards, selects, counts) from live data */
    });
  }



