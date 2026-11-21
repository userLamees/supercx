/* Staff dashboard (v2): unanswered questions -> FAQ, plus the existing support cases list. */
const { t } = I18N;
const PAGE_SIZE = 5;

I18N.add({
  ar: {
    "page.title": "SuperCX | لوحة الموظف",
    "dash.org": "جمعية تجربة العميل",
    "dash.navAria": "أقسام لوحة الموظف",
    "dash.unanswered": "الأسئلة غير المجابة",
    "dash.cases": "حالات الدعم",
    "dash.faq": "الأسئلة الشائعة",
    "dash.team": "فريق إدارة المعرفة",
    "dash.role": "صلاحية: محرر محتوى",
    "dash.workspace": "مساحة عمل الجمعية",
    "dash.langToggle": "English",
    "dash.logout": "خروج",
    "dash.loginTitle": "دخول فريق الدعم",
    "dash.token": "رمز فريق الدعم",
    "dash.signIn": "دخول",
    "dash.badToken": "الرمز غير صحيح. تحقق منه وأعد المحاولة.",
    "dash.title": "لوحة الموظف",
    "dash.sub": "راجع الأسئلة المتكررة وحدّث قاعدة المعرفة.",
    "dash.statPending": "سؤالًا بانتظار الإجابة",
    "dash.statHigh": "أسئلة عالية التكرار",
    "dash.statHighHint": "تكررت {n} مرات أو أكثر",
    "dash.statApproved": "إجابة معتمدة",
    "dash.tableTitle": "أسئلة لم يُجب عنها",
    "dash.sortLabel": "ترتيب الأسئلة",
    "dash.sortCount": "الأكثر تكرارًا أولًا",
    "dash.sortRecent": "الأحدث أولًا",
    "dash.colQuestion": "السؤال",
    "dash.colCount": "عدد مرات تكراره",
    "dash.colLast": "آخر ظهور",
    "dash.colAction": "الإجراء",
    "dash.convert": "حوّل إلى سؤال شائع",
    "dash.pager": "عرض {shown} من {total} سؤالًا",
    "dash.prev": "السابق",
    "dash.next": "التالي",
    "dash.note": "تُراجع الإجابات والمصادر قبل إضافتها إلى الأسئلة الشائعة.",
    "dash.empty": "لا توجد أسئلة غير مجابة حاليًا. ستظهر هنا الأسئلة التي حوّلها المساعد لعدم وجود إجابة معتمدة.",
    "dash.loadError": "تعذّر تحميل البيانات من الخادم. أعد المحاولة.",
    "dash.offline": "لا يوجد اتصال. تحقق من الإنترنت ثم أعد المحاولة.",
    "dash.loading": "جارٍ تحميل البيانات…",
    "dash.statusSaved": "تم حفظ الحالة.",
    "dash.signingIn": "جارٍ الدخول…",
    "modal.approving": "جارٍ الاعتماد…",
    "modal.offline": "لا يوجد اتصال. لم يُحفظ شيء، أعد المحاولة.",
    "dash.today": "اليوم، {time}",
    "dash.yesterday": "أمس، {time}",
    "dash.casesSub": "الحالات المحالة من المساعد مع وسيلة التواصل إن وُجدت.",
    "dash.casesEmpty": "لا توجد حالات بعد. ستظهر هنا عند تحويل أي سؤال من المساعد.",
    "dash.colRef": "رقم الحالة",
    "dash.colDate": "التاريخ",
    "dash.colSummary": "الملخص",
    "dash.colTier": "العضوية",
    "dash.colContact": "التواصل",
    "dash.colStatus": "الحالة",
    "dash.noContact": "بدون تواصل",
    "dash.statusSaveError": "لم يُحفظ تغيير الحالة. أعد المحاولة.",
    "dash.statusAria": "حالة الطلب",
    "status.new": "جديدة",
    "status.in_progress": "قيد المعالجة",
    "status.closed": "مغلقة",
    "modal.title": "تحويل إلى سؤال شائع",
    "modal.sub": "أضف إجابة واضحة وأرفق مصدرها قبل الاعتماد.",
    "modal.close": "إغلاق",
    "modal.question": "السؤال",
    "modal.category": "القسم",
    "modal.answer": "الإجابة",
    "modal.answerPh": "اكتب الإجابة المعتمدة هنا…",
    "modal.source": "المصدر",
    "modal.sourcePh": "رابط الصفحة الرسمية أو اسم المرجع",
    "modal.checked": "تاريخ آخر تحقق: {date}",
    "modal.approve": "اعتماد",
    "modal.cancel": "إلغاء",
    "modal.required": "أكمل السؤال والإجابة والمصدر قبل الاعتماد.",
    "modal.error": "تعذّر الاعتماد. أعد المحاولة.",
    "modal.done": "أُضيف السؤال إلى الأسئلة الشائعة.",
  },
  en: {
    "page.title": "SuperCX | Staff dashboard",
    "dash.org": "Customer Experience Association",
    "dash.navAria": "Dashboard sections",
    "dash.unanswered": "Unanswered questions",
    "dash.cases": "Support cases",
    "dash.faq": "FAQ",
    "dash.team": "Knowledge management team",
    "dash.role": "Role: content editor",
    "dash.workspace": "Association workspace",
    "dash.langToggle": "العربية",
    "dash.logout": "Sign out",
    "dash.loginTitle": "Support team sign-in",
    "dash.token": "Support team token",
    "dash.signIn": "Sign in",
    "dash.badToken": "Incorrect token. Check it and try again.",
    "dash.title": "Staff dashboard",
    "dash.sub": "Review frequent questions and update the knowledge base.",
    "dash.statPending": "questions awaiting an answer",
    "dash.statHigh": "high-frequency questions",
    "dash.statHighHint": "asked {n} times or more",
    "dash.statApproved": "approved answers",
    "dash.tableTitle": "Unanswered questions",
    "dash.sortLabel": "Sort questions",
    "dash.sortCount": "Most frequent first",
    "dash.sortRecent": "Most recent first",
    "dash.colQuestion": "Question",
    "dash.colCount": "Times asked",
    "dash.colLast": "Last seen",
    "dash.colAction": "Action",
    "dash.convert": "Convert to FAQ",
    "dash.pager": "Showing {shown} of {total} questions",
    "dash.prev": "Previous",
    "dash.next": "Next",
    "dash.note": "Answers and sources are reviewed before they are added to the FAQ.",
    "dash.empty": "No unanswered questions right now. Questions the assistant couldn't answer from approved content will appear here.",
    "dash.loadError": "Couldn't load the data from the server. Please try again.",
    "dash.offline": "No connection. Check your internet and try again.",
    "dash.loading": "Loading data…",
    "dash.statusSaved": "Status saved.",
    "dash.signingIn": "Signing in…",
    "modal.approving": "Approving…",
    "modal.offline": "No connection. Nothing was saved; please try again.",
    "dash.today": "Today, {time}",
    "dash.yesterday": "Yesterday, {time}",
    "dash.casesSub": "Cases passed on by the assistant, with contact details when provided.",
    "dash.casesEmpty": "No cases yet. They will appear here when the assistant passes a question on.",
    "dash.colRef": "Case no.",
    "dash.colDate": "Date",
    "dash.colSummary": "Summary",
    "dash.colTier": "Membership",
    "dash.colContact": "Contact",
    "dash.colStatus": "Status",
    "dash.noContact": "No contact",
    "dash.statusSaveError": "The status change wasn't saved. Please try again.",
    "dash.statusAria": "Case status",
    "status.new": "New",
    "status.in_progress": "In progress",
    "status.closed": "Closed",
    "modal.title": "Convert to FAQ",
    "modal.sub": "Add a clear answer and its source before approving.",
    "modal.close": "Close",
    "modal.question": "Question",
    "modal.category": "Section",
    "modal.answer": "Answer",
    "modal.answerPh": "Write the approved answer here…",
    "modal.source": "Source",
    "modal.sourcePh": "Official page link or reference name",
    "modal.checked": "Last verified: {date}",
    "modal.approve": "Approve",
    "modal.cancel": "Cancel",
    "modal.required": "Complete the question, answer and source before approving.",
    "modal.error": "Couldn't approve. Please try again.",
    "modal.done": "The question was added to the FAQ.",
  },
});

const $ = (id) => document.getElementById(id);
let unanswered = [];
let page = 0;
let tierNames = {};
let categories = [];
let current = null; // question being converted
let threshold = 10;

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

function token() { try { return sessionStorage.getItem("supportToken") || ""; } catch { return ""; } }
function setToken(v) { try { v ? sessionStorage.setItem("supportToken", v) : sessionStorage.removeItem("supportToken"); } catch { /* ignore */ } }

const isOffline = (err) => !navigator.onLine || err instanceof TypeError;

async function api(path, options = {}) {
  if (!navigator.onLine) throw new TypeError("offline");
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", "X-Support-Token": token(), ...(options.headers || {}) },
  });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function toast(text) {
  const el = $("toast");
  el.textContent = text; el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 3500);
}

const asUtc = (iso) => new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
const locale = () => (I18N.lang === "ar" ? "ar-u-nu-latn" : "en-GB");
function relative(iso) {
  const d = asUtc(iso);
  const opts = { timeZone: "Asia/Riyadh" };
  const day = (x) => x.toLocaleDateString("en-CA", opts);
  const time = d.toLocaleTimeString(locale(), { ...opts, hour: "2-digit", minute: "2-digit", hour12: false });
  const now = new Date();
  if (day(d) === day(now)) return t("dash.today", { time });
  if (day(d) === day(new Date(now - 864e5))) return t("dash.yesterday", { time });
  return `${d.toLocaleDateString(locale(), { ...opts, day: "numeric", month: "long" })}${I18N.lang === "ar" ? "،" : ","} ${time}`;
}

/* ---------- Views ---------- */
function show(view) {
  const authed = Boolean(token());
  $("login").hidden = authed;
  $("logout").hidden = !authed;
  $("view-unanswered").hidden = !authed || view !== "unanswered";
  $("view-cases").hidden = !authed || view !== "cases";
  document.querySelectorAll("[data-view]").forEach((a) => {
    a.toggleAttribute("aria-current", a.dataset.view === view);
    if (a.dataset.view === view) a.setAttribute("aria-current", "page");
  });
}
function currentView() { return location.hash === "#cases" ? "cases" : "unanswered"; }

async function route() {
  const view = currentView();
  show(view);
  if (!token()) { $("token").focus(); return; }
  const state = $(view === "cases" ? "cases-state" : "unanswered-state");
  const table = $(view === "cases" ? "cases-table" : "unanswered-table");
  state.textContent = t("dash.loading"); state.hidden = false; table.hidden = true;
  if (view === "unanswered") $("pager").hidden = true;
  try {
    if (view === "unanswered") await loadUnanswered(); else await loadCases();
  } catch (e) {
    if (e.message === "auth") { setToken(""); show(view); showAuthError(); return; }
    state.textContent = t(isOffline(e) ? "dash.offline" : "dash.loadError"); state.hidden = false;
  } finally {
    const btn = $("auth").querySelector("button");
    btn.disabled = false; btn.textContent = t("dash.signIn");
  }
}

function showAuthError() { $("auth-error").textContent = t("dash.badToken"); $("auth-error").hidden = false; }

/* ---------- Unanswered questions ---------- */
async function loadUnanswered() {
  const [rows, stats, faq] = await Promise.all([
    api(`/api/unanswered?sort=${$("sort").value}`), api("/api/unanswered/stats"), fetch("/api/faq").then((r) => r.json()),
  ]);
  unanswered = rows;
  categories = faq;
  threshold = stats.high_frequency_threshold;
  $("stat-pending").textContent = I18N.formatNumber(stats.pending);
  $("stat-high").textContent = I18N.formatNumber(stats.high_frequency);
  $("stat-high-label").title = t("dash.statHighHint", { n: threshold });
  $("stat-approved").textContent = I18N.formatNumber(stats.approved_answers);
  page = Math.min(page, Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1));
  renderUnanswered();
}

function renderUnanswered() {
  const start = page * PAGE_SIZE;
  const slice = unanswered.slice(start, start + PAGE_SIZE);
  $("unanswered-rows").replaceChildren(...slice.map((q) => h("tr", {},
    h("td", { class: "q", dir: "auto" }, q.question),
    h("td", { "data-label": t("dash.colCount") }, h("span", { class: "num" }, I18N.formatNumber(q.count))),
    h("td", { "data-label": t("dash.colLast"), class: "muted" }, relative(q.last_seen)),
    h("td", { class: "act" }, h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: () => openPromote(q) }, t("dash.convert"))))));
  const empty = unanswered.length === 0;
  $("unanswered-table").hidden = empty;
  $("pager").hidden = empty;
  $("unanswered-state").hidden = !empty;
  $("unanswered-state").textContent = t("dash.empty");
  $("pager-text").textContent = t("dash.pager", { shown: I18N.formatNumber(slice.length), total: I18N.formatNumber(unanswered.length) });
  $("prev").disabled = page === 0;
  $("next").disabled = start + PAGE_SIZE >= unanswered.length;
}

$("prev").addEventListener("click", () => { page = Math.max(0, page - 1); renderUnanswered(); });
$("next").addEventListener("click", () => { page += 1; renderUnanswered(); });
$("sort").addEventListener("change", () => { page = 0; route(); });

/* ---------- Convert to FAQ ---------- */
const dialog = $("promote");
function openPromote(q) {
  current = q;
  $("m-question").value = q.question; // the same question, editable
  $("m-answer").value = "";
  $("m-source").value = "";
  $("m-error").hidden = true;
  $("m-category").replaceChildren(...categories.map((c) => new Option(c.title[I18N.lang], c.id)));
  $("m-checked").textContent = t("modal.checked", { date: I18N.formatDate(new Date().toISOString().slice(0, 10)) });
  dialog.showModal();
  $("m-answer").focus();
}
const closePromote = () => { dialog.close(); current = null; };
$("promote-close").addEventListener("click", closePromote);
$("m-cancel").addEventListener("click", closePromote);

$("promote-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = $("m-question").value.trim();
  const answer = $("m-answer").value.trim();
  const source = $("m-source").value.trim();
  if (question.length < 3 || answer.length < 3 || source.length < 2) {
    $("m-error").textContent = t("modal.required"); $("m-error").hidden = false; return;
  }
  const isUrl = /^https?:\/\/\S+$/i.test(source);
  $("m-approve").disabled = true;
  $("m-approve").textContent = t("modal.approving");
  try {
    await api(`/api/unanswered/${current.id}/promote`, {
      method: "POST",
      body: JSON.stringify({ category_id: $("m-category").value, question, answer,
                             source_title: isUrl ? new URL(source).hostname + new URL(source).pathname.replace(/\/$/, "") : source,
                             source_url: isUrl ? source : null }),
    });
    closePromote();
    toast(t("modal.done"));
    await loadUnanswered();
  } catch (err) {
    if (err.message === "auth") { closePromote(); setToken(""); show(currentView()); showAuthError(); return; }
    $("m-error").textContent = t(isOffline(err) ? "modal.offline" : "modal.error"); $("m-error").hidden = false;
  } finally {
    $("m-approve").disabled = false;
    $("m-approve").textContent = t("modal.approve");
  }
});

/* ---------- Support cases (existing) ---------- */
function statusSelect(c) {
  const select = h("select", { class: "select", "aria-label": t("dash.statusAria") });
  ["new", "in_progress", "closed"].forEach((v) => select.add(new Option(t(`status.${v}`), v, false, v === c.status)));
  select.addEventListener("change", async () => {
    select.disabled = true;
    try { await api(`/api/support-cases/${c.id}`, { method: "PATCH", body: JSON.stringify({ status: select.value }) }); c.status = select.value; toast(t("dash.statusSaved")); }
    catch (err) { select.value = c.status; toast(t(isOffline(err) ? "dash.offline" : "dash.statusSaveError")); }
    finally { select.disabled = false; }
  });
  return select;
}

async function loadCases() {
  const [cases, tiers] = await Promise.all([api("/api/support-cases"), fetch("/api/memberships").then((r) => r.json())]);
  tierNames = Object.fromEntries(tiers.map((tier) => [tier.id, tier.name]));
  const ref = (id) => `CX-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  $("cases-rows").replaceChildren(...cases.map((c) => h("tr", {},
    h("td", { class: "q", dir: "ltr" }, ref(c.id)),
    h("td", { "data-label": t("dash.colDate"), class: "muted" }, relative(c.created_at)),
    h("td", { "data-label": t("dash.colQuestion"), dir: "auto" }, c.question),
    h("td", { "data-label": t("dash.colSummary"), dir: "auto" }, c.summary || "—"),
    h("td", { "data-label": t("dash.colTier") }, tierNames[c.tier_id]?.[I18N.lang] || "—"),
    h("td", { "data-label": t("dash.colContact"), dir: "auto" }, c.contact || t("dash.noContact")),
    h("td", { "data-label": t("dash.colStatus") }, statusSelect(c)))));
  $("cases-table").hidden = cases.length === 0;
  $("cases-state").hidden = cases.length > 0;
  $("cases-state").textContent = t("dash.casesEmpty");
}

/* ---------- Auth ---------- */
$("auth").addEventListener("submit", (e) => {
  e.preventDefault();
  $("auth-error").hidden = true;
  const btn = $("auth").querySelector("button");
  btn.disabled = true; btn.textContent = t("dash.signingIn");
  setToken($("token").value);
  $("token").value = "";
  route();
});
$("logout").addEventListener("click", () => { setToken(""); route(); });

window.addEventListener("hashchange", route);
document.addEventListener("langchange", () => { if (token()) route(); });
I18N.apply();
route();
