/* Request loop for visitors: the confirmation card shown inside the chat after sending,
   "My requests" (only case numbers and tracking codes are kept, in this browser), and
   "Track your request" from any device with the case number and tracking code.
   Uses the DOM helpers from chat.js (h, ic, stateCard, isOffline) at call time. */
window.Requests = (function () {
  const t = (k, v, l) => I18N.t(k, v, l);

  I18N.add({
    ar: {
      "req.nav": "طلباتي",
      "req.navNew": "طلباتي، يوجد رد جديد",
      "cat.unanswered": "سؤال",
      "req.status.new": "تم الاستلام",
      "req.status.in_progress": "قيد المعالجة",
      "req.status.replied": "تم الرد",
      "req.status.closed": "مغلق",
      "req.received": "تم الاستلام",
      "req.processing": "قيد المعالجة",
      "req.replied": "تم الرد",
      "req.closed": "مغلق",
      "req.replyPending": "رد الفريق",
      "confirm.title": "تم استلام طلبك",
      "confirm.caseNo": "رقم الحالة",
      "confirm.type": "النوع",
      "confirm.status": "الحالة",
      "confirm.code": "رمز المتابعة",
      "confirm.copy": "نسخ رقم الحالة ورمز المتابعة",
      "confirm.copied": "تم النسخ",
      "confirm.codeOnce": "يظهر هذا الرمز مرة واحدة فقط. احتفظ به مع رقم الحالة لمتابعة طلبك من أي جهاز.",
      "confirm.saved": "حفظنا رقم الحالة ورمز المتابعة في «طلباتي» على هذا الجهاز.",
      "confirm.notSaved": "تعذّر حفظ الطلب على هذا الجهاز، فاحتفظ بالرقم والرمز الآن.",
      "confirm.next": "الخطوة التالية",
      "confirm.myRequests": "طلباتي",
      "confirm.another": "رفع طلب آخر",
      "req.title": "طلباتي",
      "req.sub": "طلباتك المرسلة من هذا الجهاز وردود الفريق عليها.",
      "req.loading": "جارٍ تحميل طلباتك…",
      "req.emptyTitle": "لا توجد طلبات بعد",
      "req.empty": "تظهر هنا طلباتك المرسلة من هذا الجهاز وردود الفريق عليها. ولمتابعة طلب من جهاز آخر، استخدم «تابع طلبك» أدناه.",
      "req.storageOff": "المتصفح لا يسمح بالحفظ على هذا الجهاز، لذلك لن تظهر طلباتك هنا. استخدم «تابع طلبك» برقم الحالة ورمز المتابعة.",
      "req.new": "رد جديد",
      "req.teamReply": "رد الفريق",
      "req.due": "الرد المتوقع قبل {date}",
      "req.remove": "إزالة من هذا الجهاز",
      "req.notFound": "لم نعثر على هذا الطلب. ربما تغيّر رمز المتابعة أو حُذف الطلب.",
      "req.loadFailed": "تعذّر تحديث حالة هذا الطلب. حاول لاحقًا.",
      "req.offline": "لا يوجد اتصال بالإنترنت. ستظهر آخر حالة عند عودة الاتصال.",
      "track.title": "تابع طلبك",
      "track.sub": "من أي جهاز: أدخل رقم الحالة ورمز المتابعة اللذين ظهرا لك عند الإرسال.",
      "track.ref": "رقم الحالة",
      "track.code": "رمز المتابعة",
      "track.submit": "متابعة الطلب",
      "track.checking": "جارٍ البحث…",
      "track.need": "أدخل رقم الحالة ورمز المتابعة.",
      "track.notFound": "لم نجد طلبًا بهذا الرقم والرمز. تحقق منهما وأعد المحاولة.",
      "track.tooMany": "محاولات كثيرة غير صحيحة. أعد المحاولة بعد {wait}.",
      "track.failed": "تعذّر البحث الآن. حاول مرة أخرى.",
      "track.offline": "لا يوجد اتصال بالإنترنت.",
      "track.added": "أُضيف الطلب إلى «طلباتي».",
    },
    en: {
      "req.nav": "My requests",
      "req.navNew": "My requests, new reply",
      "cat.unanswered": "Question",
      "req.status.new": "Received",
      "req.status.in_progress": "In progress",
      "req.status.replied": "Replied",
      "req.status.closed": "Closed",
      "req.received": "Received",
      "req.processing": "In progress",
      "req.replied": "Replied",
      "req.closed": "Closed",
      "req.replyPending": "Team reply",
      "confirm.title": "We received your request",
      "confirm.caseNo": "Case no.",
      "confirm.type": "Type",
      "confirm.status": "Status",
      "confirm.code": "Tracking code",
      "confirm.copy": "Copy the case number and tracking code",
      "confirm.copied": "Copied",
      "confirm.codeOnce": "This code is shown only once. Keep it with your case number to track your request from any device.",
      "confirm.saved": "We saved the case number and tracking code in My requests on this device.",
      "confirm.notSaved": "We couldn't save this request on this device, so please keep the number and code now.",
      "confirm.next": "Next step",
      "confirm.myRequests": "My requests",
      "confirm.another": "Submit another request",
      "req.title": "My requests",
      "req.sub": "Requests sent from this device and the team's replies.",
      "req.loading": "Loading your requests…",
      "req.emptyTitle": "No requests yet",
      "req.empty": "Requests you send from this device and the team's replies appear here. To follow a request from another device, use Track your request below.",
      "req.storageOff": "This browser doesn't allow saving on this device, so your requests won't be listed here. Use Track your request with the case number and tracking code.",
      "req.new": "New reply",
      "req.teamReply": "Team reply",
      "req.due": "Reply expected by {date}",
      "req.remove": "Remove from this device",
      "req.notFound": "We couldn't find this request. The tracking code may have changed or the request was removed.",
      "req.loadFailed": "Couldn't update this request's status. Please try later.",
      "req.offline": "No internet connection. The latest status will show once you're back online.",
      "track.title": "Track your request",
      "track.sub": "From any device: enter the case number and tracking code shown when you sent it.",
      "track.ref": "Case number",
      "track.code": "Tracking code",
      "track.submit": "Track request",
      "track.checking": "Searching…",
      "track.need": "Enter the case number and tracking code.",
      "track.notFound": "No request matches this number and code. Check them and try again.",
      "track.tooMany": "Too many incorrect attempts. Try again in {wait}.",
      "track.failed": "Couldn't search right now. Please try again.",
      "track.offline": "No internet connection.",
      "track.added": "Added to My requests.",
    },
  });

  /* ---------- Storage: case number + tracking code (+ which reply was seen) only ---------- */
  const KEY = "supercx.requests";
  let storageOk = true;
  function load() {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(list) ? list.filter((x) => x && typeof x.ref === "string" && typeof x.code === "string") : [];
    } catch { storageOk = false; return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); storageOk = true; return true; } catch { storageOk = false; return false; }
  }
  function remember(ref, code, seen = null) {
    const list = load().filter((x) => x.ref !== ref);
    list.unshift({ ref, code, seen });
    return save(list.slice(0, 30));
  }
  function forget(ref) { save(load().filter((x) => x.ref !== ref)); delete cache[ref]; updateDot(); }

  /* ---------- Server ---------- */
  let cache = {};  // ref -> tracking response, or { error }
  async function track(reference, code) {
    if (!navigator.onLine) throw new TypeError("offline");
    const res = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, code }) });
    if (res.status === 404) return { error: "notFound" };
    if (res.status === 429) {
      let wait = Number(res.headers.get("Retry-After")) || 900;
      return { error: "tooMany", wait };
    }
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }
  async function refresh() {
    const list = load();
    const results = await Promise.all(list.map(async (it) => {
      try { return [it.ref, await track(it.ref, it.code)]; } catch (e) { return [it.ref, { error: isOffline(e) ? "offline" : "failed" }]; }
    }));
    cache = Object.fromEntries(results);
    updateDot();
    return list;
  }

  const hasNew = (it) => { const r = cache[it.ref]; return Boolean(r && r.replied_at && r.replied_at !== it.seen); };
  function updateDot() {
    const btn = document.getElementById("requests-btn");
    if (!btn) return;
    const any = load().some(hasNew);
    btn.querySelector(".dot-badge").hidden = !any;
    btn.setAttribute("aria-label", t(any ? "req.navNew" : "req.nav"));
    // Laptop nav link "My requests" carries the same dot.
    const link = document.querySelector('.nav-links [data-nav="requests"]');
    if (link) {
      link.querySelector(".dot-badge").hidden = !any;
      link.setAttribute("aria-label", t(any ? "req.navNew" : "req.nav"));
    }
  }
  function markSeen() {
    save(load().map((it) => { const r = cache[it.ref]; return r && r.replied_at ? { ...it, seen: r.replied_at } : it; }));
    updateDot();
  }

  /* ---------- Shared pieces ---------- */
  const shortDate = (iso, l) => new Intl.DateTimeFormat(l === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(iso));
  const statusTag = (s, l) => h("span", { class: `tag req-status req-${s}` }, t(`req.status.${s}`, null, l));

  function timeline(r, l) {
    const step = (cls, text, date, glyph) => h("li", { class: cls }, h("span", { class: "dot" }, glyph ? ic(glyph) : null),
      h("span", { class: "step-text" }, text), date ? h("span", { class: "caption" }, shortDate(date, l)) : null);
    const s = r.status;
    const final = s === "closed" ? ["req.closed", r.updated_at] : s === "replied" ? ["req.replied", r.replied_at] : ["req.replyPending", null];
    return h("ol", { class: "timeline timeline-compact" },
      step("done", t("req.received", null, l), r.created_at, "check"),
      step(s === "new" ? "" : s === "in_progress" ? "current" : "done", t("req.processing", null, l), null, s === "new" || s === "in_progress" ? null : "check"),
      step(s === "replied" || s === "closed" ? "done" : "", t(final[0], null, l), final[1], s === "replied" || s === "closed" ? "check" : null));
  }

  /* ---------- 05 Confirmation, inside the chat ---------- */
  function confirmCard(data, l, saved) {
    const copyBtn = h("button", { class: "icon-btn", type: "button", "aria-label": t("confirm.copy", null, l), title: t("confirm.copy", null, l) }, ic("copy"));
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(`${data.reference} · ${data.tracking_code}`);
        copyBtn.replaceChildren(ic("check")); copyBtn.setAttribute("aria-label", t("confirm.copied", null, l));
        I18N.icons();
      } catch { /* clipboard blocked: the code stays visible to copy by hand */ }
    });
    const fact = (label, value, attrs = {}) => h("div", {}, h("dt", { class: "caption" }, label), h("dd", attrs, value));
    const el = h("section", { class: "card card-white confirm confirm-inline", dir: l === "ar" ? "rtl" : "ltr", role: "status" },
      h("div", { class: "confirm-head" },
        h("div", { class: "check-circle" }, ic("check")),
        h("h2", {}, t("confirm.title", null, l))),
      h("dl", { class: "case-facts" },
        fact(t("confirm.caseNo", null, l), data.reference, { class: "case-number", dir: "ltr" }),
        fact(t("confirm.type", null, l), t(`cat.${data.category}`, null, l)),
        fact(t("confirm.status", null, l), statusTag("new", l))),
      h("div", { class: "tracking" },
        h("div", { class: "tracking-row" },
          h("div", {}, h("span", { class: "caption" }, t("confirm.code", null, l)),
            h("strong", { class: "tracking-code", dir: "ltr" }, data.tracking_code)),
          copyBtn),
        h("p", { class: "help" }, t("confirm.codeOnce", null, l), " ", t(saved ? "confirm.saved" : "confirm.notSaved", null, l))),
      h("div", { class: "next-step" }, h("span", { class: "caption" }, t("confirm.next", null, l)),
        h("p", {}, data.next_step[l] || data.next_step.ar)),
      h("div", { class: "confirm-actions" },
        h("a", { class: "btn btn-secondary", href: "#requests" }, ic("inbox", "icon-sm"), t("confirm.myRequests", null, l)),
        h("a", { class: "btn btn-text", href: "#contact" }, ic("plus", "icon-sm"), t("confirm.another", null, l))));
    return el;
  }

  /* ---------- My requests (#requests) ---------- */
  function itemCard(it) {
    const l = I18N.lang;
    const r = cache[it.ref];
    const remove = h("button", { class: "btn btn-sm btn-text", type: "button", onclick: () => { forget(it.ref); render(false); } },
      ic("trash-2", "icon-sm"), t("req.remove"));
    if (!r || r.error) {
      const key = r?.error === "notFound" ? "req.notFound" : r?.error === "offline" ? "req.offline" : "req.loadFailed";
      return h("li", { class: "card card-white request-item" },
        h("div", { class: "request-head" }, h("strong", { class: "case-number", dir: "ltr" }, it.ref)),
        h("p", { class: "help" }, t(key)), remove);
    }
    const waiting = r.status === "new" || r.status === "in_progress";
    return h("li", { class: `card card-white request-item${hasNew(it) ? " has-new" : ""}` },
      h("div", { class: "request-head" },
        h("div", {}, h("strong", { class: "case-number", dir: "ltr" }, r.reference),
          h("span", { class: "caption" }, `${t(`cat.${r.category}`)} · ${shortDate(r.created_at, l)}`)),
        h("span", { class: "tag-row" }, hasNew(it) ? h("span", { class: "tag tag-new" }, t("req.new")) : null, statusTag(r.status, l))),
      timeline(r, l),
      r.reply ? h("div", { class: "team-reply" },
        h("span", { class: "caption" }, t("req.teamReply"), r.replied_at ? ` · ${shortDate(r.replied_at, l)}` : ""),
        h("p", { dir: "auto" }, r.reply)) : null,
      waiting ? h("p", { class: "caption" }, t("req.due", { date: shortDate(r.due_at, l) })) : null,
      remove);
  }

  let rendering = 0;
  async function render(fetchFirst = true) {
    const body = document.getElementById("requests-body");
    const run = ++rendering;
    if (fetchFirst) {
      body.replaceChildren(stateCard("info", t("req.loading"), null));
      await refresh();
      if (run !== rendering) return;
    }
    const list = load();
    const note = !storageOk ? h("p", { class: "help" }, t("req.storageOff"))
      : list.length === 0 ? emptyState("inbox", t("req.emptyTitle"), t("req.empty")) : null;
    body.replaceChildren(...[note, list.length ? h("ul", { class: "request-list" }, ...list.map(itemCard)) : null].filter(Boolean));
    I18N.icons();
    markSeen();  // the "new reply" tags stay until the next visit
  }

  /* ---------- Track your request ---------- */
  function wireTrackForm() {
    const form = document.getElementById("track-form");
    const refInput = document.getElementById("track-ref");
    const codeInput = document.getElementById("track-code");
    const error = document.getElementById("track-error");
    const button = document.getElementById("track-submit");
    const say = (text) => { error.textContent = text || ""; error.hidden = !text; };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      say("");
      const reference = refInput.value.trim(), code = codeInput.value.trim();
      if (!reference || !code) { say(t("track.need")); (reference ? codeInput : refInput).focus(); return; }
      button.disabled = true; button.textContent = t("track.checking");
      try {
        const r = await track(reference, code);
        if (r.error === "notFound") { say(t("track.notFound")); codeInput.focus(); return; }
        if (r.error === "tooMany") { say(t("track.tooMany", { wait: I18N.count(Math.max(1, Math.ceil(r.wait / 60)), "minute") })); return; }
        const clean = code.toUpperCase().replace(/[\s-]/g, "");
        remember(r.reference, clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean);
        cache[r.reference] = r;
        form.reset();
        await render(false);
        say("");
        document.getElementById("track-status").textContent = t("track.added");
      } catch (err) {
        say(t(isOffline(err) ? "track.offline" : "track.failed"));
      } finally {
        button.disabled = false; button.textContent = t("track.submit");
      }
    });
  }

  /* The link in the reply notification is /?track=CX-XXXXXX#requests: fill in the case number
     and ask only for the tracking code (which the message never contains). */
  function prefillFromLink() {
    let ref = null;
    try { ref = new URLSearchParams(location.search).get("track"); } catch { /* old browser */ }
    if (!ref || !/^CX-[A-Z0-9]{4,12}$/i.test(ref)) return;
    window.history.replaceState(null, "", `${location.pathname}#requests`);  // chat.js has its own `history`
    const refInput = document.getElementById("track-ref");
    const codeInput = document.getElementById("track-code");
    refInput.value = ref.toUpperCase();
    setTimeout(() => { codeInput.scrollIntoView({ block: "center" }); codeInput.focus({ preventScroll: true }); }, 200);
  }

  function init() {
    wireTrackForm();
    prefillFromLink();
    load();
    if (!storageOk) return;
    refresh().catch(() => {});
    setInterval(() => { if (document.visibilityState === "visible") refresh().catch(() => {}); }, 60000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refresh().catch(() => {}); });
    document.addEventListener("langchange", updateDot);
  }

  return { remember, confirmCard, render, init, updateDot };
})();
