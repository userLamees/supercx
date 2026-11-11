const log = document.getElementById("log");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const history = [];
let tiersById = {};

const TEXT = {
  ar: { register: "سجّل في هذه العضوية", perYear: "ريال سنويًا", source: "المصدر:",
        contactPh: "بريدك أو جوالك", contactBtn: "حوّل للدعم", sent: "وصل سؤالك لفريق الدعم. رقم الحالة: ",
        error: "تعذّر الاتصال بالخادم. تأكد من الاتصال وأعد الإرسال." },
  en: { register: "Register for this membership", perYear: "SAR per year", source: "Source:",
        contactPh: "Your email or phone", contactBtn: "Send to support", sent: "Your question reached the support team. Case number: ",
        error: "Couldn't reach the server. Check your connection and send again." },
};

async function loadTiers() {
  try {
    const res = await fetch("/api/memberships");
    const tiers = await res.json();
    tiersById = Object.fromEntries(tiers.map((t) => [t.id, t]));
  } catch { /* the chat still works; cards just won't render */ }
}

function add(el) { log.appendChild(el); log.scrollTop = log.scrollHeight; return el; }

function bubble(text, who, extraClass = "") {
  const div = document.createElement("div");
  div.className = `msg ${who} ${extraClass}`.trim();
  div.dir = "auto";
  div.textContent = text;
  return add(div);
}

function sourcesLine(parent, sources, lang) {
  if (!sources?.length) return;
  const p = document.createElement("div");
  p.className = "sources";
  p.append(TEXT[lang].source + " ");
  sources.forEach((s, i) => {
    const a = document.createElement("a");
    a.href = s.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = s.title;
    p.append(a);
    if (i < sources.length - 1) p.append("، ");
  });
  parent.appendChild(p);
}

function tierCard(tier, lang, url) {
  const card = document.createElement("div");
  card.className = "tier-card";
  card.dir = lang === "ar" ? "rtl" : "ltr";
  const price = new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US").format(tier.price_sar);
  card.innerHTML = `<div class="name"></div><div class="price"></div><a class="cta" target="_blank" rel="noopener"></a>`;
  card.querySelector(".name").textContent = tier.name[lang];
  card.querySelector(".price").textContent = `${price} ${TEXT[lang].perYear}`;
  const cta = card.querySelector(".cta");
  cta.href = url; cta.textContent = TEXT[lang].register;
  add(card);
}

function contactForm(question, reply) {
  const lang = reply.lang;
  const wrap = document.createElement("form");
  wrap.className = "contact";
  wrap.dir = lang === "ar" ? "rtl" : "ltr";
  wrap.innerHTML = `<input required minlength="3" maxlength="200" autocomplete="email"><button class="primary" type="submit"></button>`;
  const field = wrap.querySelector("input");
  const btn = wrap.querySelector("button");
  field.placeholder = TEXT[lang].contactPh;
  field.setAttribute("aria-label", TEXT[lang].contactPh);
  btn.textContent = TEXT[lang].contactBtn;
  wrap.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    try {
      const res = await fetch("/api/support-cases", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language: lang, contact: field.value.trim(),
                               tier_id: reply.tier_id, summary: reply.summary }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      wrap.remove();
      bubble(TEXT[lang].sent + data.id.slice(0, 8), "bot");
    } catch {
      btn.disabled = false;
      bubble(TEXT[lang].error, "bot", "error");
    }
  });
  add(wrap);
  field.focus();
}

async function send(text) {
  document.getElementById("starters")?.remove();
  bubble(text, "user");
  sendBtn.disabled = true;
  try {
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history }),
    });
    if (!res.ok) throw new Error(res.status);
    const reply = await res.json();
    history.push({ role: "user", content: text }, { role: "assistant", content: reply.answer });
    const msg = bubble(reply.answer, "bot");
    sourcesLine(msg, reply.sources, reply.lang);
    const tier = reply.tier_id && tiersById[reply.tier_id];
    if (reply.action === "recommend" && tier) tierCard(tier, reply.lang, tier.source_url);
    if (reply.action === "escalate" && reply.needs_contact) contactForm(text, reply);
  } catch {
    bubble(TEXT[/[\u0600-\u06FF]/.test(text) ? "ar" : "en"].error, "bot", "error");
  } finally {
    sendBtn.disabled = false;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  send(text);
});

document.querySelectorAll("#starters button").forEach((b) =>
  b.addEventListener("click", () => send(b.textContent)));

loadTiers();
