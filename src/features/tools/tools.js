/* features/tools/tools.js — the free toolkit. The resume card links to the CV builder
   (#/cv); the take-home and HSP tools are inline calculators. All labels route through
   t()/data-i18n so a language toggle re-localizes everything (renderTools in applyLang). */

  function toolYen(n){ return "¥" + Math.round(n||0).toLocaleString("en-US"); }
  function toolRow(k,v){ return '<div><dt>'+ esc(k) +'</dt><dd>'+ esc(v) +'</dd></div>'; }

  /* ---- take-home pay: single company employee in Tokyo, 2024 employee-share rates ---- */
  function takeHomeCalc(gross, over40){
    gross = Math.max(0, gross||0);
    var health  = gross * (over40 ? 0.05985 : 0.04985);   /* 健康保険 (+介護 if 40+), employee share */
    var pension = Math.min(gross, 7980000) * 0.0915;      /* 厚生年金, capped ~月65万 */
    var employ  = gross * 0.006;                           /* 雇用保険 */
    var social  = health + pension + employ;
    var ded;                                               /* 給与所得控除 (2020+) */
    if      (gross <= 1625000) ded = 550000;
    else if (gross <= 1800000) ded = gross*0.4 - 100000;
    else if (gross <= 3600000) ded = gross*0.3 + 80000;
    else if (gross <= 6600000) ded = gross*0.2 + 440000;
    else if (gross <= 8500000) ded = gross*0.1 + 1100000;
    else                        ded = 1950000;
    var taxable = Math.max(0, gross - social - ded - 480000);  /* basic deduction */
    var br = [[0,0.05,0],[1950000,0.10,97500],[3300000,0.20,427500],[6950000,0.23,636000],[9000000,0.33,1536000],[18000000,0.40,2796000],[40000000,0.45,4796000]];
    var row = br[0]; for (var i=0;i<br.length;i++) if (taxable >= br[i][0]) row = br[i];
    var itax = Math.max(0, taxable*row[1] - row[2]) * 1.021;    /* + 復興特別所得税 */
    var resident = Math.max(0, gross - social - ded - 430000) * 0.10 + 5000;  /* 住民税 approx */
    var net = gross - social - itax - resident;
    return { gross:gross, social:social, itax:itax, resident:resident, net:net, monthly:net/12 };
  }
  function renderTakeHome(){
    var out = $("#thResult"); if (!out) return;
    var r = takeHomeCalc(parseFloat(($("#thSalary")||{}).value), (($("#thAge")||{}).value)==="o40");
    out.innerHTML =
      '<div class="tool-big"><span class="tool-big-lab">'+ esc(t("th_monthly")) +'</span><strong>'+ esc(toolYen(r.monthly)) +'</strong>'+
        '<span class="tool-big-sub">'+ esc(t("th_annual").replace("{n}", toolYen(r.net))) +'</span></div>'+
      '<dl class="tool-break">'+
        toolRow(t("th_gross"), toolYen(r.gross)) + toolRow(t("th_social"), "-"+toolYen(r.social)) +
        toolRow(t("th_itax"), "-"+toolYen(r.itax)) + toolRow(t("th_resident"), "-"+toolYen(r.resident)) +
      '</dl>';
  }

  /* ---- HSP points (Advanced Specialized / Technical, type ii) ---- */
  function hspSalaryPoints(sal){
    if (sal >= 10000000) return 40;
    if (sal >=  9000000) return 35;
    if (sal >=  8000000) return 30;
    if (sal >=  7000000) return 25;
    if (sal >=  6000000) return 20;
    if (sal >=  5000000) return 15;
    if (sal >=  4000000) return 10;
    return 0;
  }
  function renderHsp(){
    var out = $("#hspResult"); if (!out) return;
    function pts(id){ return parseInt((($("#"+id))||{}).value, 10) || 0; }
    var edu=pts("hspEdu"), career=pts("hspCareer"), age=pts("hspAge"), jp=pts("hspJp");
    var sal = hspSalaryPoints(parseFloat(($("#hspSalary")||{}).value) || 0);
    var total = edu + career + sal + age + jp;
    var pass = total >= 70, fast = total >= 80;
    out.innerHTML =
      '<div class="tool-big'+(pass?" ok":"")+'"><span class="tool-big-lab">'+ esc(t("hsp_total")) +'</span><strong>'+ total +' '+ esc(t("hsp_pts")) +'</strong>'+
        '<span class="tool-big-sub">'+ esc(fast ? t("hsp_fast") : (pass ? t("hsp_pass") : t("hsp_short").replace("{n}", (70-total)))) +'</span></div>'+
      '<dl class="tool-break">'+
        toolRow(t("hsp_edu_l"), "+"+edu) + toolRow(t("hsp_career_l"), "+"+career) + toolRow(t("hsp_salary_l"), "+"+sal) +
        toolRow(t("hsp_age_l"), "+"+age) + toolRow(t("hsp_jp_l"), "+"+jp) +
      '</dl>';
  }

  /* re-render results on language toggle (applyLang calls this) */
  function renderTools(){ if ($("#page-tools")) { renderTakeHome(); renderHsp(); } }

  (function(){
    var page = $("#page-tools"); if (!page) return;
    page.addEventListener("click", function(e){
      var open = e.target.closest("[data-tool-open]");
      if (open){
        var id = "tool-" + open.getAttribute("data-tool-open"), p = document.getElementById(id), show = p && p.hidden;
        document.querySelectorAll("#page-tools .tool-panel").forEach(function(x){ x.hidden = true; });
        document.querySelectorAll("#page-tools [data-tool-open]").forEach(function(b){ b.setAttribute("aria-expanded","false"); });
        if (p){ p.hidden = !show; open.setAttribute("aria-expanded", show?"true":"false");
          if (show){ (id==="tool-takehome" ? renderTakeHome : renderHsp)(); p.scrollIntoView({behavior:"smooth", block:"start"}); } }
        return;
      }
      var close = e.target.closest("[data-tool-close]");
      if (close){ var panel = close.closest(".tool-panel"); if (panel){ panel.hidden = true;
        var opener = document.querySelector('[data-tool-open="'+ panel.id.replace("tool-","") +'"]');
        if (opener){ opener.setAttribute("aria-expanded","false"); opener.focus(); } } }
    });
    var recompute = function(e){ if (e.target.closest("#tool-takehome")) renderTakeHome(); else if (e.target.closest("#tool-hsp")) renderHsp(); };
    page.addEventListener("input", recompute);
    page.addEventListener("change", recompute);
  })();
