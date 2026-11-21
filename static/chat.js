/* SuperCX chat (v2): start screen, recommendation questions, tier card, escalation with
   consent, confirmation, simulated phone verification and membership status. */
const { t, icon } = I18N;

I18N.add({
  ar: {
    "page.title": "SuperCX | مساعد جمعية تجربة العميل",
    "chat.new": "محادثة جديدة",
    "hero.title": "كيف يمكنني مساعدتك؟",
    "hero.sub": "اسأل عن العضويات واحصل على توصية موثّقة بمصدرها.",
    "hero.privacy": "لا نطلب بياناتك الشخصية إلا عند تحويل سؤالك للدعم، وبموافقتك.",
    "hero.status": "حالة عضويتي",
    "hero.faq": "الأسئلة الشائعة",
    "composer.ph": "اكتب سؤالك…",
    "composer.phQuiz": "أو اكتب احتياجك بأسلوبك…",
    "composer.aria": "رسالتك",
    "composer.send": "إرسال",
    "sugg.fit": "أي عضوية تناسبني؟",
    "sugg.diff": "ما الفرق بين العضويات؟",
    "sugg.vote": "Which membership lets me vote?",
    "sugg.student": "هل يوجد خصم للطلاب؟",

    "quiz.intro": "سؤالان سريعان، ثم أقدّم لك توصية واحدة.",
    "quiz.step": "السؤال {n} من 2",
    "quiz.q1": "تنضم كفرد أو كجهة؟",
    "quiz.individual": "فرد",
    "quiz.org": "جهة",
    "quiz.q2": "ما الأهم لك في العضوية؟",
    "quiz.basic": "الأساسيات بأقل رسوم",
    "quiz.exclusive": "فعاليات حصرية وترحيب شخصي",
    "quiz.vote": "حق التصويت في الجمعية العمومية",
    "quiz.note": "الأسئلة مبنية على المزايا المنشورة فقط، لأن شروط الأهلية بانتظار تأكيد الجمعية.",
    "quiz.orgQuestion": "هل تتوفر عضوية للجهات والشركات؟",
    "quiz.orgSummary": "سؤال عن توفر عضوية للجهات والشركات.",
    "quiz.orgNoInfo": "لا أجد معلومات منشورة عن عضوية الجهات في المحتوى المعتمد للجمعية، ولا أريد أن أخمّن. يمكنني تحويل سؤالك إلى فريق الدعم.",

    "tier.popular": "الأكثر شيوعًا",
    "tier.perYear": "ريال سنويًا",
    "tier.perYears": "ريال لكل {n} سنوات",
    "tier.pending": "شروط الأهلية والمستندات بانتظار تأكيد الجمعية",
    "tier.register": "انتقل لصفحة التسجيل",
    "tier.compare": "قارن بين العضويات",
    "tier.compareThree": "قارن بين العضويات الثلاث",
    "src.label": "المصدر:",
    "src.memberships": "صفحة العضويات",
    "src.checked": "آخر تحقق {date}",

    "state.kind.progress": "جارٍ",
    "state.kind.warn": "تنبيه",
    "state.kind.success": "نجاح",
    "state.kind.error": "خطأ",
    "state.searching": "جارٍ البحث",
    "state.searchingBody": "نبحث في المحتوى المعتمد للجمعية…",
    "state.noInfo": "لا توجد معلومة",
    "state.sending": "جارٍ الإرسال",
    "state.sendingBody": "نرسل طلبك إلى فريق الدعم، لحظات من فضلك.",
    "state.sent": "تم الإرسال",
    "state.sentBody": "تم استلام طلبك، ورقم الحالة {ref}.",
    "state.failed": "تعذّر الإرسال",
    "state.failedBody": "لم يصل طلبك إلى النظام. لم نحفظ شيئًا، يمكنك المحاولة مرة أخرى.",
    "state.offline": "لا يوجد اتصال",
    "state.offlineBody": "تحقق من اتصالك بالإنترنت ثم أعد المحاولة. نحتفظ بنص سؤالك.",
    "state.chatFailed": "تعذّر الحصول على إجابة",
    "state.chatFailedBody": "حدث خطأ في الخادم. نحتفظ بنص سؤالك، أعد المحاولة بعد قليل.",
    "state.retry": "أعد المحاولة",

    "consent.summary": "أوافق على إرسال ملخص سؤالي إلى فريق الدعم",
    "consent.preview": "الملخص الذي سيُرسل (بعد حذف بياناتك الشخصية)",
    "consent.contact": "أوافق على أن يتواصل معي فريق الدعم (اختياري)",
    "consent.contactLabel": "وسيلة التواصل",
    "consent.contactPh": "بريدك الإلكتروني أو رقم جوالك",
    "consent.send": "إرسال إلى فريق الدعم",
    "consent.no": "لا، شكرًا",
    "consent.alt": "أو راسلهم مباشرة:",
    "consent.needSummary": "يلزم الموافقة على إرسال الملخص قبل الإرسال.",
    "consent.needContact": "أدخل بريدًا إلكترونيًا أو رقم جوال صحيحًا، أو ألغِ الموافقة على التواصل.",
    "consent.declined": "لن نرسل شيئًا. يمكنك متابعة أسئلتك هنا.",

    "confirm.title": "تم استلام طلبك",
    "confirm.caseNo": "رقم الحالة",
    "confirm.received": "تم الاستلام",
    "confirm.review": "قيد المراجعة من فريق الدعم",
    "confirm.reply": "الرد عليك",
    "confirm.update": "تحديث المحتوى المعتمد",
    "confirm.next": "الخطوة التالية",
    "confirm.nextContact": "سيراجع الفريق طلبك ويتواصل معك عبر الوسيلة التي زوّدتنا بها. موعد الرد بانتظار تأكيد الجمعية.",
    "confirm.nextAnon": "سيراجع الفريق سؤالك لتحسين الإجابات. لم تترك وسيلة تواصل، لذلك لن يصلك رد مباشر.",
    "confirm.back": "العودة للمحادثة",

    "statusPrompt": "لعرض حالة عضويتك أحتاج أولًا إلى التحقق من رقم جوالك.",
    "statusPrompt.btn": "التحقق من الجوال",

    "verify.title": "التحقق من الجوال",
    "verify.sub": "لعرض بيانات عضويتك نحتاج التحقق من رقم جوالك",
    "verify.demoHint": "محاكاة: لا تُرسل رسالة فعلية. جرّب 500000001 أو 500000002، وأي رمز من 4 أرقام.",
    "verify.phone": "رقم الجوال",
    "verify.send": "إرسال رمز التحقق",
    "verify.resend": "إعادة إرسال الرمز",
    "verify.code": "رمز التحقق",
    "verify.codeHelp": "أدخل الرمز المكوّن من 4 أرقام المرسل إلى جوالك",
    "verify.codeSent": "أُرسل رمز تجريبي إلى \u2066+966 {phone}\u2069.",
    "verify.check": "تحقق",
    "verify.sending": "جارٍ إرسال الرمز…",
    "verify.checking": "جارٍ التحقق…",
    "verify.privacy": "لا نعرض أي بيانات شخصية قبل التحقق",
    "verify.badPhone": "أدخل رقم جوال سعوديًا صحيحًا يبدأ بـ 5 ويتكوّن من 9 أرقام.",
    "verify.badCode": "أدخل الرمز كاملًا (4 أرقام).",
    "verify.failed": "تعذّر التحقق. أعد المحاولة.",
    "verify.offline": "لا يوجد اتصال. تحقق من الإنترنت ثم أعد المحاولة.",
    "verify.cell": "الخانة {n}",

    "status.title": "حالة العضوية",
    "status.sub": "تم التحقق من جوالك. إليك بيانات عضويتك.",
    "status.subNone": "تم التحقق من جوالك.",
    "status.type": "نوع العضوية",
    "status.active": "نشطة",
    "status.expired": "منتهية",
    "status.expires": "تاريخ الانتهاء",
    "status.remaining": "المدة المتبقية",
    "status.progress": "المدة المتبقية من العضوية",
    "status.renew": "تجديد العضوية",
    "status.source": "المصدر: سجل الأعضاء · بيانات تجريبية",
    "status.altCaption": "بعد التحقق",
    "status.none": "الرقم غير مسجل لدينا",
    "status.noneBody": "يمكنك استعراض أنواع العضويات واختيار الأنسب لك.",
    "status.browse": "استعراض العضويات",
  },
  en: {
    "page.title": "SuperCX | Customer Experience Association assistant",
    "chat.new": "New chat",
    "hero.title": "How can I help you?",
    "hero.sub": "Ask about memberships and get a recommendation backed by its source.",
    "hero.privacy": "We only ask for personal details when you choose to send your question to support.",
    "hero.status": "My membership status",
    "hero.faq": "FAQ",
    "composer.ph": "Type your question…",
    "composer.phQuiz": "Or describe what you need…",
    "composer.aria": "Your message",
    "composer.send": "Send",
    "sugg.fit": "Which membership suits me?",
    "sugg.diff": "What's the difference between the memberships?",
    "sugg.vote": "أي عضوية تمنحني حق التصويت؟",
    "sugg.student": "Is there a student discount?",

    "quiz.intro": "Two quick questions, then I'll recommend one membership.",
    "quiz.step": "Question {n} of 2",
    "quiz.q1": "Are you joining as an individual or an organization?",
    "quiz.individual": "Individual",
    "quiz.org": "Organization",
    "quiz.q2": "What matters most to you in a membership?",
    "quiz.basic": "The essentials at the lowest fee",
    "quiz.exclusive": "Exclusive events and a personal welcome",
    "quiz.vote": "Voting rights in the General Assembly",
    "quiz.note": "These questions use published benefits only, because eligibility conditions await the association's confirmation.",
    "quiz.orgQuestion": "Is there a membership for organizations and companies?",
    "quiz.orgSummary": "Question about membership for organizations and companies.",
    "quiz.orgNoInfo": "I can't find published information about organization memberships in the association's approved content, and I won't guess. I can pass your question to the support team.",

    "tier.popular": "Most popular",
    "tier.perYear": "SAR per year",
    "tier.perYears": "SAR per {n} years",
    "tier.pending": "Eligibility conditions and documents await the association's confirmation",
    "tier.register": "Go to the registration page",
    "tier.compare": "Compare the memberships",
    "tier.compareThree": "Compare the three memberships",
    "src.label": "Source:",
    "src.memberships": "Memberships page",
    "src.checked": "last verified {date}",

    "state.kind.progress": "In progress",
    "state.kind.warn": "Notice",
    "state.kind.success": "Success",
    "state.kind.error": "Error",
    "state.searching": "Searching",
    "state.searchingBody": "Searching the association's approved content…",
    "state.noInfo": "No information found",
    "state.sending": "Sending",
    "state.sendingBody": "Sending your request to the support team, one moment please.",
    "state.sent": "Sent",
    "state.sentBody": "Your request was received. Case number {ref}.",
    "state.failed": "Couldn't send",
    "state.failedBody": "Your request didn't reach our system. Nothing was saved; you can try again.",
    "state.offline": "No connection",
    "state.offlineBody": "Check your internet connection and try again. We kept your question.",
    "state.chatFailed": "Couldn't get an answer",
    "state.chatFailedBody": "The server returned an error. We kept your question; try again shortly.",
    "state.retry": "Try again",

    "consent.summary": "I agree to send a summary of my question to the support team",
    "consent.preview": "Summary to be sent (personal data removed)",
    "consent.contact": "I agree that the support team may contact me (optional)",
    "consent.contactLabel": "Contact method",
    "consent.contactPh": "Your email or mobile number",
    "consent.send": "Send to the support team",
    "consent.no": "No, thanks",
    "consent.alt": "Or email them directly:",
    "consent.needSummary": "Please agree to send the summary first.",
    "consent.needContact": "Enter a valid email or mobile number, or untick the contact consent.",
    "consent.declined": "Nothing was sent. You can keep asking here.",

    "confirm.title": "We received your request",
    "confirm.caseNo": "Case number",
    "confirm.received": "Received",
    "confirm.review": "Under review by the support team",
    "confirm.reply": "Reply to you",
    "confirm.update": "Approved content updated",
    "confirm.next": "Next step",
    "confirm.nextContact": "The team will review your request and contact you using the method you provided. Response time awaits the association's confirmation.",
    "confirm.nextAnon": "The team will review your question to improve answers. You didn't leave contact details, so you won't get a direct reply.",
    "confirm.back": "Back to chat",

    "statusPrompt": "To show your membership status I first need to verify your mobile number.",
    "statusPrompt.btn": "Verify mobile number",

    "verify.title": "Mobile verification",
    "verify.sub": "To show your membership details we need to verify your mobile number",
    "verify.demoHint": "Simulation: no real SMS is sent. Try 500000001 or 500000002 with any 4-digit code.",
    "verify.phone": "Mobile number",
    "verify.send": "Send verification code",
    "verify.resend": "Resend code",
    "verify.code": "Verification code",
    "verify.codeHelp": "Enter the 4-digit code sent to your mobile",
    "verify.codeSent": "A demo code was sent to \u2066+966 {phone}\u2069.",
    "verify.check": "Verify",
    "verify.sending": "Sending code…",
    "verify.checking": "Verifying…",
    "verify.privacy": "We don't show any personal data before verification",
    "verify.badPhone": "Enter a valid Saudi mobile number: 9 digits starting with 5.",
    "verify.badCode": "Enter the full 4-digit code.",
    "verify.failed": "Verification failed. Please try again.",
    "verify.offline": "No connection. Check your internet and try again.",
    "verify.cell": "Digit {n}",

    "status.title": "Membership status",
    "status.sub": "Your mobile is verified. Here are your membership details.",
    "status.subNone": "Your mobile is verified.",
    "status.type": "Membership type",
    "status.active": "Active",
    "status.expired": "Expired",
    "status.expires": "Expiry date",
    "status.remaining": "Time remaining",
    "status.progress": "Membership time remaining",
    "status.renew": "Renew membership",
    "status.source": "Source: member registry · demo data",
    "status.altCaption": "After verification",
    "status.none": "This number isn't registered with us",
    "status.noneBody": "You can browse the membership types and choose the one that suits you.",
    "status.browse": "Browse memberships",
  },
});

const CARE_EMAIL = "Care@cxa.sa"; // from the v2 design
const log = document.getElementById("log");
const hero = document.getElementById("hero");
const suggestionsList = document.getElementById("suggestions");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

let history = [];
let tiersById = {};
let busy = false;
let quizActive = false;
let lastStatus = null;

/* ---------- DOM helpers ---------- */
function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v; // trusted markup only (icons)
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}
const ic = (name, cls = "") => h("i", { "data-lucide": name, class: `icon ${cls}` });
const dirOf = (lang) => (lang === "ar" ? "rtl" : "ltr");
const detectLang = (text) => (/[؀-ۿ]/.test(text) ? "ar" : "en");

function add(el) {
  log.appendChild(el);
  I18N.icons();
  requestAnimationFrame(() => el.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  return el;
}

function setBusy(on) { busy = on; sendBtn.disabled = on; }

function setPlaceholder() { input.placeholder = t(quizActive ? "composer.phQuiz" : "composer.ph"); }

/* Same rules as app/redact.py: emails and phone numbers are removed. */
function redact(text) {
  return text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]")
    .replace(/(?:\+|00)?[\d٠-٩][\d٠-٩\s-]{6,}[\d٠-٩]/g, "[phone]")
    .replace(/\s+/g, " ").trim();
}

/* ---------- Start screen ---------- */
function renderSuggestions() {
  suggestionsList.replaceChildren(...["sugg.fit", "sugg.diff", "sugg.vote", "sugg.student"].map((key) => {
    const text = t(key);
    return h("li", {}, h("button", { class: "suggestion", type: "button", onclick: () => send(text) },
      h("span", { dir: "auto" }, text), ic("chevron-left", "icon-sm flip-rev")));
  }));
  I18N.icons();
}

function hideStart() { hero.hidden = true; suggestionsList.hidden = true; }

function resetChat() {
  history = []; quizActive = false; setBusy(false);
  log.replaceChildren(hero, suggestionsList);
  hero.hidden = false; suggestionsList.hidden = false;
  input.value = ""; setPlaceholder(); input.focus();
}

/* ---------- Messages ---------- */
function userBubble(text) { return add(h("div", { class: "msg msg-user", dir: "auto" }, text)); }
function botText(text, lang) { return add(h("div", { class: "msg msg-bot", dir: lang ? dirOf(lang) : "auto" }, text)); }

function sourcesLine(sources, lang, checkedAt) {
  const row = h("div", { class: "sources", dir: dirOf(lang) }, ic("link", "icon-sm"), t("src.label", null, lang));
  sources.forEach((s, i) => {
    row.append(h("a", { href: s.url, target: "_blank", rel: "noopener" }, s.title));
    if (i < sources.length - 1) row.append(lang === "ar" ? "، " : ", ");
  });
  if (checkedAt) row.append(" · ", t("src.checked", { date: I18N.formatDate(checkedAt, lang) }, lang));
  return row;
}

/* 09 Status messages. kind: info | warn | success | error */
function stateCard(kind, title, body, action) {
  const kindKey = { info: "progress", warn: "warn", success: "success", error: "error" }[kind];
  const el = h("div", { class: "state", "data-kind": kind, role: kind === "error" ? "alert" : "status" },
    h("span", { class: "state-kind" }, t(`state.kind.${kindKey}`)),
    h("span", { class: "state-title" }, title),
    body ? h("p", { class: "state-body", dir: "auto" }, body) : null,
    action ? h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: action }, t("state.retry")) : null);
  return el;
}

function isOffline(err) { return !navigator.onLine || err instanceof TypeError; }

/* ---------- Agent call ---------- */
async function askAgent(text) {
  userBubble(text);
  const searching = add(stateCard("info", t("state.searching"), t("state.searchingBody")));
  setBusy(true);
  try {
    if (!navigator.onLine) throw new TypeError("offline");
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const reply = await res.json();
    searching.remove();
    history.push({ role: "user", content: text }, { role: "assistant", content: reply.answer });
    renderReply(text, reply);
  } catch (err) {
    searching.remove();
    const offline = isOffline(err);
    const retry = () => { failed.remove(); input.value = ""; askAgentRetry(text); };
    const failed = add(stateCard("error", t(offline ? "state.offline" : "state.chatFailed"),
      t(offline ? "state.offlineBody" : "state.chatFailedBody"), retry));
    input.value = text; // keep the question
  } finally {
    setBusy(false);
  }
}

// A retry should not repeat the user's bubble.
async function askAgentRetry(text) {
  const last = log.querySelector(".msg-user:last-of-type");
  if (last && last.textContent === text) last.remove();
  return askAgent(text);
}

function renderReply(question, reply) {
  const lang = reply.lang;
  const tier = reply.action === "recommend" && reply.tier_id ? tiersById[reply.tier_id] : null;

  if (reply.action === "escalate") {
    add(stateCard("warn", t("state.noInfo", null, lang), reply.answer));
    if (reply.needs_contact) consentCard(question, reply);
    return;
  }

  if (tier) {
    // The card shows price and benefits, so only the recommendation sentence is kept as text.
    botText(reply.answer.split(/\n\s*\n/)[0], lang);
    const block = h("div", { class: "chat-block", dir: dirOf(lang) }, tierCard(tier, lang));
    const sources = reply.sources?.length ? reply.sources : [{ title: t("src.memberships", null, lang), url: tier.source_url }];
    block.append(sourcesLine(sources, lang, tier.checked_at));
    const count = Object.keys(tiersById).length;
    const compareText = t("sugg.diff", null, lang);
    block.append(h("button", { class: "chip", type: "button", onclick: () => send(compareText) },
      t(count === 3 ? "tier.compareThree" : "tier.compare", null, lang)));
    add(block);
    return;
  }

  const msg = botText(reply.answer, lang);
  if (reply.sources?.length) msg.append(sourcesLine(reply.sources, lang));
}

/* 03 Recommendation card (matched by tier_id, never by name) */
function tierCard(tier, lang) {
  const unit = tier.period_years > 1 ? t("tier.perYears", { n: tier.period_years }, lang) : t("tier.perYear", null, lang);
  return h("article", { class: "tier-card", dir: dirOf(lang) },
    h("div", { class: "tier-head" },
      h("h3", { class: "tier-name" }, tier.name[lang]),
      tier.is_most_common ? h("span", { class: "tag tier-badge" }, t("tier.popular", null, lang)) : null),
    h("div", { class: "tier-price" }, h("strong", {}, I18N.formatNumber(tier.price_sar, lang)), h("span", {}, unit)),
    h("ul", { class: "benefits" }, ...tier.features[lang].map((f) => h("li", {}, ic("check"), h("span", {}, f)))),
    h("p", { class: "needs-validation" }, ic("info", "icon-sm"), h("span", {}, t("tier.pending", null, lang))),
    h("a", { class: "btn btn-gold", href: tier.source_url, target: "_blank", rel: "noopener" }, t("tier.register", null, lang)));
}

/* 04 Unpublished question: two separate consents + redacted summary preview */
function consentCard(question, reply) {
  const lang = reply.lang;
  const tl = (k, v) => t(k, v, lang);
  const summary = redact((reply.summary || question).replace(/^\[(ar|en)\]\s*/, ""));
  const uid = Math.random().toString(36).slice(2, 8);

  const consentSummary = h("input", { type: "checkbox", id: `cs-${uid}` });
  const consentContact = h("input", { type: "checkbox", id: `cc-${uid}` });
  const contactInput = h("input", { class: "input", id: `ci-${uid}`, type: "text", autocomplete: "email", maxlength: "200", dir: "auto", placeholder: tl("consent.contactPh") });
  const contactField = h("div", { class: "field", hidden: true },
    h("label", { class: "label", for: `ci-${uid}` }, tl("consent.contactLabel")), contactInput);
  const error = h("p", { class: "form-error", role: "alert", hidden: true });
  const sendButton = h("button", { class: "btn btn-primary btn-block", type: "submit" }, tl("consent.send"));
  const noButton = h("button", { class: "btn btn-text btn-block", type: "button" }, tl("consent.no"));

  consentContact.addEventListener("change", () => {
    contactField.hidden = !consentContact.checked;
    if (consentContact.checked) contactInput.focus();
  });

  const wrap = h("form", { class: "consent", dir: dirOf(lang), novalidate: true },
    h("div", { class: "card consent" },
      h("label", { class: "check", for: `cs-${uid}` }, consentSummary, h("span", {}, tl("consent.summary"))),
      h("div", { class: "preview" }, h("span", { class: "caption" }, tl("consent.preview")), h("p", { dir: "auto" }, summary)),
      h("label", { class: "check", for: `cc-${uid}` }, consentContact, h("span", {}, tl("consent.contact"))),
      contactField),
    error, sendButton, noButton,
    h("p", { class: "alt-channel" }, ic("mail", "icon-sm"), tl("consent.alt"), " ",
      h("a", { href: `mailto:${CARE_EMAIL}`, dir: "ltr" }, CARE_EMAIL)));

  noButton.addEventListener("click", () => { wrap.remove(); botText(tl("consent.declined"), lang); });

  let status = null;
  wrap.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    if (!consentSummary.checked) { error.textContent = tl("consent.needSummary"); error.hidden = false; consentSummary.focus(); return; }
    const contact = consentContact.checked ? contactInput.value.trim() : "";
    if (consentContact.checked && contact.length < 3) { error.textContent = tl("consent.needContact"); error.hidden = false; contactInput.focus(); return; }

    sendButton.disabled = true; noButton.disabled = true;
    status?.remove();
    status = add(stateCard("info", tl("state.sending"), tl("state.sendingBody")));
    try {
      if (!navigator.onLine) throw new TypeError("offline");
      const body = { question: redact(question), language: lang, summary, tier_id: reply.tier_id || null };
      if (contact) body.contact = contact; else body.anonymous = true;
      const res = await fetch("/api/support-cases", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json(); // success is shown only after the server confirms
      wrap.remove();
      status.replaceWith(status = stateCard("success", tl("state.sent"), tl("state.sentBody", { ref: data.reference })));
      add(confirmation(data.reference, Boolean(contact), lang));
    } catch (err) {
      const offline = isOffline(err);
      status.replaceWith(status = stateCard("error", tl(offline ? "state.offline" : "state.failed"),
        tl(offline ? "state.offlineBody" : "state.failedBody"), () => wrap.requestSubmit()));
      sendButton.disabled = false; noButton.disabled = false;
    }
  });
  add(wrap);
}

/* 05 Confirmation */
function confirmation(reference, hasContact, lang) {
  const tl = (k, v) => t(k, v, lang);
  const step = (cls, text, glyph) => h("li", { class: cls }, h("span", { class: "dot" }, glyph ? ic(glyph) : null), h("span", {}, text));
  return h("section", { class: "confirm", dir: dirOf(lang) },
    h("div", { class: "confirm-head" },
      h("div", { class: "check-circle" }, ic("check")),
      h("h2", {}, tl("confirm.title")),
      h("span", { class: "caption" }, tl("confirm.caseNo")),
      h("strong", { class: "case-number" }, reference)),
    h("ol", { class: "timeline" },
      step("done", tl("confirm.received"), "check"),
      step("current", tl("confirm.review")),
      step("", tl(hasContact ? "confirm.reply" : "confirm.update"))),
    h("div", { class: "next-step" }, h("span", { class: "caption" }, tl("confirm.next")),
      h("p", {}, tl(hasContact ? "confirm.nextContact" : "confirm.nextAnon"))),
    h("button", { class: "btn btn-text", type: "button", onclick: () => { input.focus(); form.scrollIntoView({ block: "end" }); } }, tl("confirm.back")));
}

/* ---------- 02 Recommendation questions ---------- */
const QUIZ_TRIGGER = /تناسبني|يناسبني|المناسبة لي|suits me|right for me|which membership should/i;
const STATUS_TRIGGER = /حالة عضويتي|متى تنتهي عضويتي|تجديد عضويتي|عضويتي سارية|membership status|renew my membership|when does my membership/i;

function stepHeader(n) {
  return h("div", { class: "quiz-step" },
    h("span", { class: "caption" }, t("quiz.step", { n })),
    h("span", { class: "progress-steps", "aria-hidden": "true" }, h("span", { class: "on" }), h("span", { class: n >= 2 ? "on" : "" })));
}

function answeredRow(question, value) {
  return h("div", { class: "answered" }, h("span", {}, question), h("span", { class: "chip" }, value));
}

function startQuiz(text) {
  userBubble(text);
  quizActive = true; setPlaceholder();
  botText(t("quiz.intro"));
  history.push({ role: "user", content: text }, { role: "assistant", content: `${t("quiz.intro")}\n${t("quiz.q1")}` });

  const pick = (value, isOrg) => {
    card.replaceWith(answeredRow(t("quiz.q1"), value));
    history.push({ role: "user", content: value });
    if (isOrg) return orgEscalation();
    quizQ2();
  };
  const card = add(h("div", { class: "card quiz" }, stepHeader(1), h("h2", {}, t("quiz.q1")),
    h("div", { class: "option-row" },
      h("button", { class: "chip", type: "button", onclick: () => pick(t("quiz.individual"), false) }, t("quiz.individual")),
      h("button", { class: "chip", type: "button", onclick: () => pick(t("quiz.org"), true) }, t("quiz.org")))));
  card.querySelector("button").focus();
}

function quizQ2() {
  history.push({ role: "assistant", content: t("quiz.q2") });
  const options = ["quiz.basic", "quiz.exclusive", "quiz.vote"].map((key) => {
    const label = t(key);
    return h("button", { class: "option", type: "button", "aria-pressed": "false", onclick: (e) => choose(e.currentTarget, label) },
      h("span", {}, label), ic("check"));
  });
  const choose = (btn, label) => {
    if (busy) return;
    btn.setAttribute("aria-pressed", "true");
    options.forEach((o) => { o.disabled = true; });
    quizActive = false; setPlaceholder();
    askAgent(label); // the agent recommends; the card is matched by tier_id
  };
  add(h("div", { class: "quiz" },
    h("div", { class: "card quiz" }, stepHeader(2), h("h2", {}, t("quiz.q2")), h("div", { class: "options" }, ...options)),
    h("p", { class: "footnote" }, t("quiz.note"))));
  options[0].focus();
}

function orgEscalation() {
  quizActive = false; setPlaceholder();
  const lang = I18N.lang;
  add(stateCard("warn", t("state.noInfo"), t("quiz.orgNoInfo")));
  consentCard(t("quiz.orgQuestion"), { lang, action: "escalate", needs_contact: true, summary: t("quiz.orgSummary"), tier_id: null });
}

function statusPrompt(text) {
  userBubble(text);
  const msg = botText(t("statusPrompt"));
  msg.append(h("div", {}, h("a", { class: "chip", href: "#verify" }, ic("badge-check", "icon-sm"), t("statusPrompt.btn"))));
  I18N.icons();
}

/* ---------- Send ---------- */
function send(text) {
  if (busy || !text) return;
  hideStart();
  if (QUIZ_TRIGGER.test(text) && !quizActive) return startQuiz(text);
  if (STATUS_TRIGGER.test(text)) return statusPrompt(text);
  quizActive = false; setPlaceholder();
  askAgent(text);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || busy) return;
  input.value = "";
  send(text);
});
document.getElementById("new-chat").addEventListener("click", resetChat);

async function loadTiers() {
  try {
    const tiers = await (await fetch("/api/memberships")).json();
    tiersById = Object.fromEntries(tiers.map((tier) => [tier.id, tier]));
  } catch { /* chat still works; recommendation cards just won't render */ }
}

/* =====================================================================
   06 Phone verification (simulated) and 07 membership status
   ===================================================================== */
const phoneForm = document.getElementById("phone-form");
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phone-error");
const sendCodeBtn = document.getElementById("send-code");
const codeForm = document.getElementById("code-form");
const codeError = document.getElementById("code-error");
const codeSent = document.getElementById("code-sent");
const checkBtn = document.getElementById("check-code");
const cells = [...document.querySelectorAll("#otp input")];
let verifiedPhone = null;

const toLatin = (s) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
function normalizePhone(raw) {
  let d = toLatin(raw).replace(/\D/g, "");
  for (const p of ["00966", "966", "0"]) if (d.startsWith(p) && d.length - p.length === 9) { d = d.slice(p.length); break; }
  return /^5\d{8}$/.test(d) ? d : null;
}
function showError(el, key) { el.textContent = key ? t(key) : ""; el.hidden = !key; }
function code() { return cells.map((c) => c.value).join(""); }
function updateCheck() { checkBtn.disabled = code().length !== 4; }

cells.forEach((cell, i) => {
  cell.setAttribute("aria-label", t("verify.cell", { n: i + 1 }));
  cell.addEventListener("input", () => {
    const digits = toLatin(cell.value).replace(/\D/g, "");
    if (digits.length > 1) { // paste or autofill into one cell
      digits.slice(0, 4 - i).split("").forEach((d, k) => { cells[i + k].value = d; });
      cells[Math.min(i + digits.length, 3)].focus();
    } else {
      cell.value = digits;
      if (digits && i < 3) cells[i + 1].focus();
    }
    updateCheck();
  });
  cell.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !cell.value && i > 0) cells[i - 1].focus();
  });
});

phoneForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError(phoneError, null);
  const phone = normalizePhone(phoneInput.value);
  if (!phone) { showError(phoneError, "verify.badPhone"); phoneInput.focus(); return; }
  sendCodeBtn.disabled = true;
  const label = verifiedPhone ? "verify.resend" : "verify.send";
  sendCodeBtn.textContent = t("verify.sending");
  try {
    const res = await fetch("/api/verify/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    if (res.status === 422) { showError(phoneError, "verify.badPhone"); sendCodeBtn.textContent = t(label); return; }
    if (!res.ok) throw new Error(String(res.status));
    verifiedPhone = phone;
    cells.forEach((c) => { c.disabled = false; c.value = ""; });
    codeSent.textContent = t("verify.codeSent", { phone });
    codeSent.hidden = false;
    sendCodeBtn.textContent = t("verify.resend");
    sendCodeBtn.dataset.i18n = "verify.resend";
    updateCheck();
    cells[0].focus();
  } catch (err) {
    showError(phoneError, isOffline(err) ? "verify.offline" : "verify.failed");
    sendCodeBtn.textContent = t(label);
  } finally {
    sendCodeBtn.disabled = false;
  }
});

codeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError(codeError, null);
  if (code().length !== 4) { showError(codeError, "verify.badCode"); return; }
  checkBtn.disabled = true;
  checkBtn.textContent = t("verify.checking");
  try {
    const res = await fetch("/api/verify/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: verifiedPhone, code: code() }) });
    if (res.status === 422) { showError(codeError, "verify.badCode"); return; }
    if (!res.ok) throw new Error(String(res.status));
    lastStatus = await res.json();
    // The number is not kept once verification is done.
    verifiedPhone = null; phoneInput.value = ""; codeSent.hidden = true;
    cells.forEach((c) => { c.value = ""; c.disabled = true; });
    sendCodeBtn.textContent = t("verify.send"); sendCodeBtn.dataset.i18n = "verify.send";
    location.hash = "#status";
  } catch (err) {
    showError(codeError, isOffline(err) ? "verify.offline" : "verify.failed");
  } finally {
    checkBtn.textContent = t("verify.check");
    updateCheck();
  }
});

function renderStatus() {
  const body = document.getElementById("status-body");
  const sub = document.getElementById("status-sub");
  const s = lastStatus;
  if (!s) return;
  if (!s.registered) {
    sub.textContent = t("status.subNone"); sub.dataset.i18n = "status.subNone";
    body.replaceChildren(h("section", { class: "card card-white status-alt" },
      h("p", { class: "demo-note" }, h("span", { class: "caption" }, t("status.altCaption")), h("span", { class: "tag" }, t("demoData"))),
      h("h2", {}, t("status.none")),
      h("p", {}, t("status.noneBody")),
      h("button", { class: "btn btn-secondary btn-block", type: "button", onclick: () => { location.hash = "#chat"; send(t("sugg.diff")); } }, t("status.browse"))));
    return;
  }
  sub.textContent = t("status.sub"); sub.dataset.i18n = "status.sub";
  const tier = tiersById[s.tier_id];
  const pct = Math.max(0, Math.min(100, Math.round((s.days_remaining / s.period_days) * 100)));
  body.replaceChildren(h("section", { class: "card card-white status-card" },
    h("div", { class: "status-type" },
      h("div", {}, h("span", { class: "caption" }, t("status.type")), h("strong", {}, s.tier_name[I18N.lang])),
      h("span", { class: `tag ${s.active ? "badge-success" : "badge-danger"}` }, t(s.active ? "status.active" : "status.expired"))),
    h("hr", { class: "divider" }),
    h("div", { class: "status-grid" },
      h("div", {}, h("span", { class: "caption" }, t("status.expires")), h("strong", {}, I18N.formatDate(s.expires_at))),
      h("div", {}, h("span", { class: "caption" }, t("status.remaining")), h("strong", {}, I18N.days(s.days_remaining)))),
    h("div", { class: "progress", role: "progressbar", "aria-label": t("status.progress"), "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) },
      h("span", { style: `width:${pct}%` })),
    s.can_renew ? h("a", { class: "btn btn-primary btn-block", href: tier?.source_url || "https://cxa.sa/membership", target: "_blank", rel: "noopener" }, t("status.renew")) : null,
    h("p", { class: "caption" }, t("status.source"))));
}

/* ---------- Views (hash routing) ---------- */
const views = { chat: "view-chat", verify: "view-verify", status: "view-status" };
function route() {
  let name = location.hash.slice(1) || "chat";
  if (!views[name]) name = "chat";
  if (name === "status" && !lastStatus) { location.replace("#verify"); return; }
  for (const [key, id] of Object.entries(views)) document.getElementById(id).hidden = key !== name;
  if (name === "status") renderStatus();
  window.scrollTo(0, 0);
  if (name === "chat") input.focus({ preventScroll: true });
}
window.addEventListener("hashchange", route);

document.addEventListener("langchange", () => {
  renderSuggestions(); setPlaceholder();
  cells.forEach((c, i) => c.setAttribute("aria-label", t("verify.cell", { n: i + 1 })));
  if (verifiedPhone) codeSent.textContent = t("verify.codeSent", { phone: verifiedPhone });
  renderStatus();
});

I18N.apply();
renderSuggestions();
setPlaceholder();
loadTiers().then(route);
