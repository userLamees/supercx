/* Shared helpers: language switch (AR rtl <-> EN ltr), UI strings, Lucide icons, dates. */
(function () {
  const dict = { ar: {}, en: {} };
  let lang = "ar";
  try { lang = localStorage.getItem("supercx.lang") === "en" ? "en" : "ar"; } catch { /* private mode */ }

  // The assistant's name comes from the server (config ASSISTANT_NAME_AR / _EN) via meta tags,
  // and fills {assistant} in any string. Pages without it fall back to a generic word.
  const meta = (n) => document.querySelector(`meta[name="supercx:assistant-${n}"]`)?.content;
  const assistant = { ar: meta("ar"), en: meta("en") };
  const assistantName = (l = lang) => {
    const v = assistant[l];
    return v && !v.startsWith("__") ? v : (l === "ar" ? "المساعد" : "the assistant");
  };

  function t(key, vars, l = lang) {
    let s = dict[l][key] ?? dict.ar[key] ?? key;
    if (s.includes("{assistant}")) s = s.replaceAll("{assistant}", assistantName(l));
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    return s;
  }

  function apply(root = document) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    if (dict[lang]["page.title"]) document.title = t("page.title");
    icons();
  }

  function setLang(next) {
    lang = next;
    try { localStorage.setItem("supercx.lang", lang); } catch { /* ignore */ }
    apply();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function icons() { if (window.lucide) window.lucide.createIcons({ icons: window.lucide.icons, attrs: { "aria-hidden": "true" } }); }

  function icon(name, cls = "") { return `<i data-lucide="${name}" class="icon ${cls}"></i>`; }

  // Gregorian dates with Latin digits in both languages, as in the design ("17 نوفمبر 2027").
  function formatDate(iso, l = lang) {
    const d = new Date(/T/.test(iso) ? iso : `${iso}T00:00:00`);
    return new Intl.DateTimeFormat(l === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-GB",
      { day: "numeric", month: "long", year: "numeric" }).format(d);
  }

  function formatNumber(n, l = lang) { return new Intl.NumberFormat(l === "ar" ? "ar-u-nu-latn" : "en-US").format(n); }

  // Arabic counted nouns: 1 يوم، 2 يومان، 3-10 أيام، 11+ يومًا
  function days(n, l = lang) {
    if (l === "en") return `${n} ${n === 1 ? "day" : "days"}`;
    if (n === 1) return "يوم واحد";
    if (n === 2) return "يومان";
    if (n % 100 >= 3 && n % 100 <= 10) return `${n} أيام`;
    return `${n} يومًا`;
  }

  // Counted nouns. ar forms: [one, two, 3-10, 11+]; en forms: [one, other].
  const NOUNS = {
    minute: { ar: ["دقيقة واحدة", "دقيقتين", "{n} دقائق", "{n} دقيقة"], en: ["1 minute", "{n} minutes"] },
    second: { ar: ["ثانية واحدة", "ثانيتين", "{n} ثوانٍ", "{n} ثانية"], en: ["1 second", "{n} seconds"] },
    attempt: { ar: ["محاولة واحدة", "محاولتان", "{n} محاولات", "{n} محاولة"], en: ["1 attempt", "{n} attempts"] },
    time: { ar: ["مرة واحدة", "مرتين", "{n} مرات", "{n} مرة"], en: ["once", "{n} times"] },
  };
  function count(n, noun, l = lang) {
    const f = NOUNS[noun][l];
    const form = l === "en" ? f[n === 1 ? 0 : 1]
      : n === 1 ? f[0] : n === 2 ? f[1] : (n % 100 >= 3 && n % 100 <= 10) ? f[2] : f[3];
    return form.replace("{n}", n);
  }

  function add(strings) { Object.assign(dict.ar, strings.ar); Object.assign(dict.en, strings.en); }

  add({
    ar: { "lang.toggle": "EN", "lang.toggleAria": "Switch to English", "nav.back": "العودة للمحادثة" },
    en: { "lang.toggle": "ع", "lang.toggleAria": "التبديل إلى العربية", "nav.back": "Back to chat" },
  });

  /* Empty state: icon in a soft circle, a title and one line (requests, FAQ search). */
  window.emptyState = function (iconName, title, text) {
    const box = document.createElement("div");
    box.className = "empty-state";
    box.innerHTML = `<span class="empty-icon">${icon(iconName)}</span>`;
    const strong = document.createElement("strong");
    strong.textContent = title;
    const p = document.createElement("p");
    p.textContent = text;
    box.append(strong, p);
    setTimeout(icons);
    return box;
  };

  window.I18N = { t, add, apply, setLang, icons, icon, formatDate, formatNumber, days, count, assistantName, get lang() { return lang; } };

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-lang-toggle]")) setLang(lang === "ar" ? "en" : "ar");
  });
})();
