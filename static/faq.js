/* FAQ page: data comes from /api/faq (stored in the database). No agent calls. */
const { t } = I18N;

I18N.add({
  ar: {
    "page.title": "SuperCX | الأسئلة الشائعة",
    "faq.newChat": "محادثة جديدة",
    "faq.title": "الأسئلة الشائعة",
    "faq.sub": "إجابات موثوقة في مكان واحد · محتوى تجريبي",
    "faq.searchLabel": "البحث في الأسئلة",
    "faq.searchPh": "ابحث عن سؤالك…",
    "faq.ask": "ما وجدت إجابتك؟ اسأل المساعد",
    "faq.source": "المصدر:",
    "faq.checked": "آخر تحقق: {date}",
    "faq.approved": "معتمد",
    "faq.noResults": "لا توجد نتائج مطابقة. جرّب كلمات أخرى أو اسأل المساعد.",
    "faq.loading": "جارٍ تحميل الأسئلة…",
    "faq.error": "تعذّر تحميل الأسئلة الشائعة. تحقق من الاتصال ثم أعد تحميل الصفحة.",
  },
  en: {
    "page.title": "SuperCX | FAQ",
    "faq.newChat": "New chat",
    "faq.title": "Frequently asked questions",
    "faq.sub": "Reliable answers in one place · demo content",
    "faq.searchLabel": "Search questions",
    "faq.searchPh": "Search for your question…",
    "faq.ask": "Didn't find your answer? Ask the assistant",
    "faq.source": "Source:",
    "faq.checked": "Last verified: {date}",
    "faq.approved": "Approved",
    "faq.noResults": "No matching results. Try other words or ask the assistant.",
    "faq.loading": "Loading questions…",
    "faq.error": "Couldn't load the FAQ. Check your connection and reload the page.",
  },
});

const sectionsEl = document.getElementById("sections");
const stateEl = document.getElementById("faq-state");
const search = document.getElementById("q");
let categories = [];
const open = new Set(["about"]);

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}
const ic = (name, cls = "") => h("i", { "data-lucide": name, class: `icon ${cls}` });

const fold = (s) => s.toLowerCase()
  .replace(/[ً-ٟـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

function render() {
  const lang = I18N.lang;
  const query = fold(search.value.trim());
  let shown = 0;
  const nodes = categories.map((cat) => {
    const items = cat.items.filter((it) => !query ||
      fold(`${it.question[lang]} ${it.answer[lang]} ${it.question.ar} ${it.answer.ar}`).includes(query));
    if (query && !items.length) return null;
    shown += items.length;
    const expanded = query ? true : open.has(cat.id);
    const bodyId = `faq-${cat.id}`;
    return h("section", { class: "faq-section" },
      h("h2", {}, h("button", {
        class: "faq-toggle", type: "button", "aria-expanded": String(expanded), "aria-controls": bodyId,
        onclick: () => { open.has(cat.id) ? open.delete(cat.id) : open.add(cat.id); render(); },
      }, h("span", {}, cat.title[lang]), ic("chevron-down"))),
      h("div", { class: "faq-body", id: bodyId, hidden: !expanded },
        ...items.map((it) => h("article", { class: "faq-item" },
          h("h3", { dir: "auto" }, it.question[lang]),
          h("p", { dir: "auto" }, it.answer[lang]),
          h("p", { class: "faq-meta" },
            h("span", {}, t("faq.source"), " ",
              it.source.url ? h("a", { href: it.source.url, target: "_blank", rel: "noopener", dir: "auto" }, it.source.title)
                            : h("span", { dir: "auto" }, it.source.title),
              " · ", it.demo ? t("demo") : t("faq.approved")),
            h("span", {}, t("faq.checked", { date: I18N.formatDate(it.checked_at) })))))));
  }).filter(Boolean);
  sectionsEl.replaceChildren(...nodes);
  stateEl.hidden = !(query && shown === 0);
  stateEl.textContent = t("faq.noResults");
  I18N.icons();
}

async function load() {
  stateEl.hidden = false; stateEl.textContent = t("faq.loading");
  try {
    const res = await fetch("/api/faq");
    if (!res.ok) throw new Error(String(res.status));
    categories = await res.json();
    stateEl.hidden = true;
    render();
  } catch {
    stateEl.hidden = false; stateEl.textContent = t("faq.error");
  }
}

search.addEventListener("input", render);
document.addEventListener("langchange", render);
I18N.apply();
load();
