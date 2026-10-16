// Quick walk checklist: private to this device, no backend requests.
(() => {
  const key = "wd_walk_checklist_v1";
  const items = ["Poepzakjes mee", "Water voor je dier", "Lijn en halsband gecontroleerd"];
  function init() {
    const home = document.querySelector("#view-home");
    if (!home || document.querySelector("#wd-walk-checklist")) return;
    const section = document.createElement("section");
    section.id = "wd-walk-checklist";
    section.setAttribute("aria-label", "Voor je wandeling");
    section.style.cssText = "margin:16px 18px;padding:16px;border-radius:18px;background:#fff;border:1px solid #e3e7df;color:#22362c";
    const heading = document.createElement("h2");
    heading.textContent = "Klaar voor je wandeling?";
    heading.style.cssText = "font-size:18px;margin:0 0 8px";
    section.append(heading);
    const note = document.createElement("p");
    note.textContent = "Een snelle check voordat je op pad gaat. Alleen opgeslagen op dit toestel.";
    note.style.cssText = "font-size:13px;margin:0 0 10px";
    section.append(note);
    let checked = [];
    try { const saved = JSON.parse(localStorage.getItem(key)); if(Array.isArray(saved)) checked = saved.filter(x => items.includes(x)); } catch {}
    items.forEach(item => {
      const label = document.createElement("label");
      label.style.cssText = "display:flex;align-items:center;gap:10px;padding:8px 0;font-size:14px";
      const input = document.createElement("input");
      input.type = "checkbox"; input.checked = checked.includes(item);
      input.addEventListener("change", () => {
        try {
          const values = [...section.querySelectorAll("input[type=checkbox]")].filter(x=>x.checked).map(x=>x.value);
          localStorage.setItem(key, JSON.stringify(values));
        } catch {}
      });
      input.value = item;
      const span = document.createElement("span"); span.textContent = item;
      label.append(input, span); section.append(label);
    });
    const reset = document.createElement("button");
    reset.type = "button"; reset.textContent = "Nieuwe wandeling";
    reset.style.cssText = "padding:9px 12px;border-radius:10px;border:1px solid #c9d8cf;background:#f5faf6;color:#215a3f";
    reset.addEventListener("click", () => {
      section.querySelectorAll("input[type=checkbox]").forEach(x=>{x.checked=false});
      try {localStorage.removeItem(key)} catch {}
    });
    section.append(reset);
    const reports = home.querySelector("#wdHomeReports");
    if(reports) reports.parentElement.insertBefore(section, reports.previousElementSibling || reports);
    else home.append(section);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
