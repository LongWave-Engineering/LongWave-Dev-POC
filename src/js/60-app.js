/* [build] 60-app.js  (applyLang, filter + lang listeners, hash router, nav, reveal) - concatenated in load order by build.ps1; all parts share one IIFE scope */
  /* ---------------- i18n apply ---------------- */
  function applyLang(){
    document.documentElement.lang=lang;
    document.querySelectorAll("[data-i18n]").forEach(function(n){ var k=n.getAttribute("data-i18n"); if(I18N[lang][k]!=null) n.innerHTML=I18N[lang][k]; });
    document.querySelectorAll("[data-i18n-ph]").forEach(function(n){ var k=n.getAttribute("data-i18n-ph"); if(I18N[lang][k]!=null) n.setAttribute("placeholder", I18N[lang][k]); });
    buildSpecSelect(); buildStackSelect(); buildLocSelect(); renderJobs(); renderTeaser(); renderCompanies(); renderArticles(); renderReviews(); renderCV();
    var jc=$("#jobCount"); if(jc) jc.innerHTML = t("jobcount").replace("{n}","<b>"+JOBS.length+"</b>");
    var pj = LINKS.postAJob + (lang==="ja" ? "?lang=ja" : "?lang=en");
    if($("#postExternalCta")) $("#postExternalCta").href=pj;
    if($("#suHireLink")) $("#suHireLink").href=pj;
    document.querySelectorAll(".lang button").forEach(function(b){ var on=b.getAttribute("data-lang")===lang; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on?"true":"false"); });
  }
  function setLang(l){ if(l===lang) return; lang=l; applyLang(); }
  document.querySelectorAll(".lang button").forEach(function(b){ b.addEventListener("click", function(){ setLang(b.getAttribute("data-lang")); }); });

  /* ---------------- filters listeners ---------------- */
  ["#filterSearch","#filterJp","#filterRemote","#filterSpec","#filterStack","#filterLoc"].forEach(function(sel){
    var n=$(sel); if(n) n.addEventListener(sel==="#filterSearch"?"input":"change", renderJobs);
  });
  $("#filterClear").addEventListener("click", function(){
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
    window.scrollTo({top:0, behavior:"auto"});
  }
  function go(route){
    var targetHash=ROUTES[route]||"#/";
    if(location.hash===targetHash){ showRoute(route); } else { location.hash=targetHash; }
  }
  function router(){ showRoute(routeFromHash()); }
  window.addEventListener("hashchange", router);
  document.addEventListener("click", function(e){
    var link=e.target.closest("[data-go]");
    if(link){ e.preventDefault(); go(link.getAttribute("data-go")); if(navLinks) navLinks.classList.remove("show"); if(jobOverlay.classList.contains("open")) closeOverlay(jobOverlay); if(suOverlay.classList.contains("open")) closeOverlay(suOverlay); }
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

  /* ---------------- reveal ---------------- */
  function initReveal(){
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } }); }, {threshold:.12});
      document.querySelectorAll(".reveal").forEach(function(n){ io.observe(n); });
    } else { document.querySelectorAll(".reveal").forEach(function(n){ n.classList.add("in"); }); }
  }



