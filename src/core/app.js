/* core/app.js — applyLang, listeners, hash router, nav, header-scroll, reveal */
  /* ---------------- i18n apply ---------------- */
  function applyLang(){
    document.documentElement.lang=lang;
    /* Fall back to English when a key is missing in the active language — same
       rule as t() — so the two never diverge (e.g. a JA gap shows EN, not blank). */
    document.querySelectorAll("[data-i18n]").forEach(function(n){ var k=n.getAttribute("data-i18n"); var v=I18N[lang][k]!=null?I18N[lang][k]:I18N.en[k]; if(v!=null) n.innerHTML=v; });
    document.querySelectorAll("[data-i18n-ph]").forEach(function(n){ var k=n.getAttribute("data-i18n-ph"); var v=I18N[lang][k]!=null?I18N[lang][k]:I18N.en[k]; if(v!=null) n.setAttribute("placeholder", v); });
    buildSpecSelect(); buildStackSelect(); buildLocSelect(); renderJobs(); renderTeaser(); renderCompanies(); renderArticles(); renderReviews(); renderHRVoices(); renderCV();
    var jc=$("#jobCount"); if(jc) jc.innerHTML = t("jobcount").replace("{n}","<b>"+JOBS.length+"</b>");
    var pj = LINKS.postAJob + (lang==="ja" ? "?lang=ja" : "?lang=en");
    if($("#postExternalCta")) $("#postExternalCta").href=pj;
    if($("#suHireLink")) $("#suHireLink").href=pj;
    document.querySelectorAll(".lang button").forEach(function(b){ var on=b.getAttribute("data-lang")===lang; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on?"true":"false"); });
  }
  function setLang(l){ if(l===lang) return; lang=l; applyLang(); }
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
  var ROUTES={home:"#/", jobs:"#/jobs", companies:"#/companies", articles:"#/articles", cv:"#/cv", post:"#/post"};
  function routeFromHash(){
    var h=location.hash;
    if(h.indexOf("jobs")>-1) return "jobs";
    if(h.indexOf("companies")>-1) return "companies";
    if(h.indexOf("articles")>-1) return "articles";
    if(h.indexOf("cv")>-1) return "cv";
    if(h.indexOf("post")>-1) return "post";
    return "home";
  }
  function showRoute(route){
    ["home","jobs","companies","articles","cv","post"].forEach(function(r){ $("#page-"+r).classList.toggle("active", r===route); });
    var _pg=$("#page-"+route); if(_pg){ _pg.querySelectorAll(".reveal").forEach(function(n){ n.classList.add("in"); }); }
    document.querySelectorAll(".nav-links a[data-go]").forEach(function(a){ var on=a.getAttribute("data-go")===route; a.classList.toggle("active", on); if(on) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
    /* Jump to the top INSTANTLY, bypassing the global `scroll-behavior:smooth`
       (which would otherwise animate a long scroll-up from the bottom of the
       previous page). The new page then fades in cleanly from the top. */
    var de=document.documentElement, prevSB=de.style.scrollBehavior;
    de.style.scrollBehavior="auto";
    window.scrollTo(0,0);
    de.style.scrollBehavior=prevSB;
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
      if(navLinks) navLinks.classList.remove("show"); if(jobOverlay.classList.contains("open")) closeOverlay(jobOverlay); if(suOverlay.classList.contains("open")) closeOverlay(suOverlay);
    }
  });

  /* ---------------- external links ---------------- */
  $("#linkedinBtn").href=LINKS.linkedin;
  $("#longwaveBtn").href=LINKS.longwave;

  /* ---------------- mobile menu ---------------- */
  var menuToggle=$("#menuToggle"), navLinks=$("#navLinks");
  menuToggle.addEventListener("click", function(){
    var open=navLinks.classList.toggle("show");
    menuToggle.setAttribute("aria-expanded", open?"true":"false");
  });

  /* ---------------- header shadow on scroll ---------------- */
  var siteHeader=document.querySelector("header.site");
  if(siteHeader){
    var onScroll=function(){ siteHeader.classList.toggle("scrolled", window.scrollY>8); };
    window.addEventListener("scroll", onScroll, {passive:true});
    onScroll();
  }

  /* ---------------- reveal ---------------- */
  function initReveal(){
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } }); }, {threshold:.12});
      document.querySelectorAll(".reveal").forEach(function(n){ io.observe(n); });
    } else { document.querySelectorAll(".reveal").forEach(function(n){ n.classList.add("in"); }); }
  }

  /* ---------------- live data (progressive enhancement) ----------------
     The bundle ships an embedded snapshot so it works offline as a single file.
     When the page is SERVED by the backend, pull live jobs + companies so admin
     edits / adds / hides show up. Any failure (offline, opened as a file, no
     backend) silently keeps the embedded snapshot — the site never breaks. */
  function hydrateFromApi(){
    if(!/^https?:$/.test(location.protocol)) return;   /* opened as a file → no API */
    var grab=function(p){ return fetch(p).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); };
    Promise.all([grab("/api/jobs"), grab("/api/companies")]).then(function(res){
      var jobs=res[0], cos=res[1];
      if(!Array.isArray(jobs) || !jobs.length) return;  /* nothing live → keep snapshot */
      if(Array.isArray(cos)) cos.forEach(function(c){
        COMPANIES[c.id]={ name:c.name||c.id, mono:c.mono, color:c.color, logo:c.logo, site:c.site,
          sector:{ en:c.sector_en||"", ja:c.sector_ja||"" }, loc:c.loc };
      });
      JOBS=jobs;
      enrichJobs();
      applyLang();   /* re-render everything (cards, selects, counts) from live data */
    });
  }



