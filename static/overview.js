/* Staff overview: KPI cards, 14-day chart, top unanswered, latest requests, impact metrics.
   Every number comes from GET /api/overview; each card says how it is counted.
   Uses helpers from support.js (api, h, ic, relative, openPromote, openCase) at call time. */
window.Overview = (function () {
  const t = (k, v) => I18N.t(k, v);

  I18N.add({
    ar: {
      "ov.title": "نظرة عامة",
      "ov.sub": "ملخص أداء المساعد وطلبات الدعم في الفترة المختارة. كل رقم محسوب من قاعدة البيانات.",
      "ov.today": "أسئلة اليوم",
      "ov.todayHow": "رسائل المحادثة منذ بداية اليوم بتوقيت الرياض. في الفترة المختارة: {n}.",
      "ov.answered": "أجاب عنها المساعد",
      "ov.answeredHow": "{a} من {b} رسالة كانت إجابة أو توصية.",
      "ov.escalated": "حُوّلت للدعم",
      "ov.escalatedHow": "{a} من {b} رسالة لم يجد لها المساعد إجابة معتمدة، أو كانت طلبًا.",
      "ov.open": "طلبات مفتوحة",
      "ov.openHow": "الطلبات الجديدة وقيد المعالجة الآن، بغض النظر عن الفترة.",
      "ov.overdue": "طلبات متأخرة",
      "ov.overdueHow": "طلبات جديدة مضى عليها أكثر من يومي عمل بلا رد.",
      "ov.overdueAction": "عرض الطلبات الجديدة",
      "ov.chartTitle": "الأسئلة خلال آخر 14 يومًا",
      "ov.chartHow": "عدد رسائل المحادثة يوميًا، ومنها ما أجاب عنه المساعد. تنتهي الأيام بآخر يوم في الفترة.",
      "ov.total": "إجمالي الأسئلة",
      "ov.resolvedSeries": "أجاب عنها المساعد",
      "ov.escalatedSeries": "المحوّلة للدعم",
      "ov.showTable": "عرض كجدول",
      "ov.showChart": "عرض كرسم",
      "ov.colDay": "اليوم",
      "ov.tip": "{date}: {total} · أجاب عنها {res} · المحوّلة {esc}",
      "ov.chartEmpty": "لا توجد محادثات في هذه الأيام. اختر فترة أخرى من أعلى الصفحة.",
      "ov.topTitle": "أكثر الأسئلة غير المجابة تكرارًا",
      "ov.topHow": "أسئلة لم يجد لها المساعد إجابة، ظهرت في الفترة، مرتبة بعدد مرات التكرار.",
      "ov.topEmpty": "لا توجد أسئلة غير مجابة في هذه الفترة. حين يعجز المساعد عن الإجابة يظهر السؤال هنا لتحويله إلى سؤال شائع.",
      "ov.times": "تكرر {n}",
      "ov.promote": "حوّل إلى سؤال شائع",
      "ov.recentTitle": "أحدث الطلبات",
      "ov.recentHow": "آخر خمسة طلبات وصلت في الفترة.",
      "ov.recentEmpty": "لا توجد طلبات في هذه الفترة. ستظهر هنا الطلبات التي يرسلها المستخدمون من المساعد أو صفحة التواصل.",
      "ov.details": "التفاصيل",
      "ov.allCases": "كل الطلبات",
      "ov.allUnanswered": "كل الأسئلة",
      "ov.impactTitle": "مؤشرات الأثر",
      "ov.impactSub": "المؤشرات الثلاثة من نموذج الورشة، للفترة المختارة.",
      "ov.verified": "نسبة الإجابة الموثّقة",
      "ov.verifiedHow": "رسائل أُجيب عنها مع مصدر معتمد ÷ كل الرسائل ({a} من {b}).",
      "ov.handoff": "نسبة التحويل الناجح للدعم",
      "ov.handoffHow": "تحويلات أرسلها المستخدم طلبًا إلى الفريق ÷ كل التحويلات ({a} من {b}).",
      "ov.register": "الانتقال للتسجيل بعد التوصية",
      "ov.registerHow": "توصيات ضغط بعدها المستخدم «انتقل لصفحة التسجيل» ÷ كل التوصيات ({a} من {b}).",
      "ov.noData": "لا بيانات",
    },
    en: {
      "ov.title": "Overview",
      "ov.sub": "How the assistant and support requests performed in the selected period. Every number is counted from the database.",
      "ov.today": "Questions today",
      "ov.todayHow": "Chat messages since the start of today, Riyadh time. In the selected period: {n}.",
      "ov.answered": "Answered by the assistant",
      "ov.answeredHow": "{a} of {b} messages got an answer or a recommendation.",
      "ov.escalated": "Passed to support",
      "ov.escalatedHow": "{a} of {b} messages had no approved answer, or were a request.",
      "ov.open": "Open requests",
      "ov.openHow": "New and in-progress requests right now, regardless of the period.",
      "ov.overdue": "Overdue requests",
      "ov.overdueHow": "New requests with no reply after more than two business days.",
      "ov.overdueAction": "View new requests",
      "ov.chartTitle": "Questions over the last 14 days",
      "ov.chartHow": "Chat messages per day, and how many the assistant answered. The days end on the last day of the period.",
      "ov.total": "All questions",
      "ov.resolvedSeries": "Answered by the assistant",
      "ov.escalatedSeries": "Passed to support",
      "ov.showTable": "Show as table",
      "ov.showChart": "Show as chart",
      "ov.colDay": "Day",
      "ov.tip": "{date}: {total} · answered {res} · passed on {esc}",
      "ov.chartEmpty": "No conversations on these days. Choose another period at the top of the page.",
      "ov.topTitle": "Most frequent unanswered questions",
      "ov.topHow": "Questions the assistant couldn't answer, seen in the period, by times asked.",
      "ov.topEmpty": "No unanswered questions in this period. When the assistant can't answer, the question appears here so you can turn it into an FAQ.",
      "ov.times": "Asked {n}",
      "ov.promote": "Convert to FAQ",
      "ov.recentTitle": "Latest requests",
      "ov.recentHow": "The five most recent requests received in the period.",
      "ov.recentEmpty": "No requests in this period. Requests users send from the assistant or the contact page appear here.",
      "ov.details": "Details",
      "ov.allCases": "All requests",
      "ov.allUnanswered": "All questions",
      "ov.impactTitle": "Impact metrics",
      "ov.impactSub": "The three metrics from the workshop template, for the selected period.",
      "ov.verified": "Verified answer rate",
      "ov.verifiedHow": "Messages answered with an approved source ÷ all messages ({a} of {b}).",
      "ov.handoff": "Successful handoff rate",
      "ov.handoffHow": "Escalations the user sent on to the team ÷ all escalations ({a} of {b}).",
      "ov.register": "Registration after a recommendation",
      "ov.registerHow": "Recommendations followed by a “Go to the registration page” click ÷ all recommendations ({a} of {b}).",
      "ov.noData": "No data",
    },
  });

  const num = (n) => I18N.formatNumber(n);
  const pct = (m) => (m.value == null ? "—" : new Intl.NumberFormat(I18N.lang === "ar" ? "ar-u-nu-latn" : "en-US",
    { style: "percent", maximumFractionDigits: 1 }).format(m.value / 100));
  const dayLabel = (iso, opts) => new Intl.DateTimeFormat(I18N.lang === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-GB",
    { timeZone: "UTC", ...opts }).format(new Date(`${iso}T00:00:00Z`));

  function kpi(label, value, how, extra = {}) {
    return h("div", { class: `kpi${extra.tone ? ` kpi-${extra.tone}` : ""}` },
      h("span", { class: "kpi-label" }, label),
      h("strong", { class: "kpi-value" }, value),
      h("span", { class: "kpi-how" }, how),
      extra.action || null);
  }

  /* Grouped bars: total vs passed to support, one axis, hover/focus tooltip, table view. */
  function chart(daily) {
    const max = Math.max(1, ...daily.map((d) => d.total));
    const step = Math.max(1, Math.ceil(max / 4));
    const top = step * Math.ceil(max / step);
    const empty = daily.every((d) => d.total === 0);
    const cols = daily.map((d) => {
      const full = dayLabel(d.date, { day: "numeric", month: "long" });
      const tip = t("ov.tip", { date: full, total: num(d.total), res: num(d.answered), esc: num(d.escalated) });
      return h("div", { class: "bar-col", tabindex: "0", role: "img", "aria-label": tip },
        h("div", { class: "bar-pair" },
          h("span", { class: "bar bar-total", style: `height:${(100 * d.total) / top}%` }),
          h("span", { class: "bar bar-resolved", style: `height:${(100 * d.answered) / top}%` })),
        h("span", { class: "bar-label" }, dayLabel(d.date, { day: "numeric" })),
        h("span", { class: "bar-tip", role: "presentation" }, tip));
    });
    const plot = h("div", { class: "chart", "data-empty": empty ? "true" : null },
      h("div", { class: "chart-grid", "aria-hidden": "true" },
        ...[top, top / 2, 0].map((v) => h("span", {}, h("em", {}, num(Math.round(v)))))),
      h("div", { class: "chart-bars" }, ...cols),
      empty ? h("p", { class: "chart-empty" }, t("ov.chartEmpty")) : null);
    const table = h("table", { class: "data-table chart-table", hidden: true },
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, t("ov.colDay")), h("th", { scope: "col" }, t("ov.total")),
        h("th", { scope: "col" }, t("ov.resolvedSeries")), h("th", { scope: "col" }, t("ov.escalatedSeries")))),
      h("tbody", {}, ...daily.map((d) => h("tr", {},
        h("td", { class: "q" }, dayLabel(d.date, { day: "numeric", month: "long" })),
        h("td", { "data-label": t("ov.total") }, num(d.total)),
        h("td", { "data-label": t("ov.resolvedSeries") }, num(d.answered)),
        h("td", { "data-label": t("ov.escalatedSeries") }, num(d.escalated))))));
    const toggle = h("button", { class: "btn btn-sm btn-text", type: "button" }, ic("table", "icon-sm"), t("ov.showTable"));
    toggle.addEventListener("click", () => {
      const showTable = table.hidden;
      table.hidden = !showTable; plot.hidden = showTable;
      toggle.replaceChildren(ic(showTable ? "chart-column" : "table", "icon-sm"), t(showTable ? "ov.showChart" : "ov.showTable"));
      I18N.icons();
    });
    return h("section", { class: "panel" },
      h("div", { class: "panel-head" },
        h("div", {}, h("h3", {}, t("ov.chartTitle")), h("p", { class: "panel-how" }, t("ov.chartHow"))),
        toggle),
      h("div", { class: "legend" },
        h("span", {}, h("i", { class: "swatch swatch-total" }), t("ov.total")),
        h("span", {}, h("i", { class: "swatch swatch-resolved" }), t("ov.resolvedSeries"))),
      plot, table);
  }

  function listPanel(title, how, items, emptyText, link) {
    return h("section", { class: "panel" },
      h("div", { class: "panel-head" },
        h("div", {}, h("h3", {}, title), h("p", { class: "panel-how" }, how)),
        h("a", { class: "btn btn-sm btn-text", href: link[0] }, link[1])),
      items.length ? h("ol", { class: "ov-list" }, ...items) : h("p", { class: "empty-hint" }, emptyText));
  }

  function impact(label, metric, howKey) {
    const width = metric.value == null ? 0 : Math.min(100, metric.value);
    return h("div", { class: "impact" },
      h("div", { class: "impact-head" }, h("span", {}, label),
        h("strong", {}, metric.value == null ? t("ov.noData") : pct(metric))),
      h("div", { class: "progress", role: "progressbar", "aria-label": label, "aria-valuemin": "0", "aria-valuemax": "100",
        "aria-valuenow": String(Math.round(width)) }, h("span", { style: `width:${width}%` })),
      h("span", { class: "kpi-how" }, t(howKey, { a: num(metric.numerator), b: num(metric.denominator) })));
  }

  function render(o, query) {
    const qs = query ? `?${query}` : "";
    const overdueAction = o.overdue_cases ? h("a", { class: "kpi-link", href: `#cases${qs ? `${qs}&` : "?"}status=new` }, t("ov.overdueAction")) : null;
    const top = o.top_unanswered.map((q) => h("li", {},
      h("div", { class: "ov-item" }, h("span", { dir: "auto" }, q.question),
        h("span", { class: "caption" }, `${t("ov.times", { n: I18N.count(q.count, "time") })} · ${relative(q.last_seen)}`)),
      h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: () => openPromote(q) }, t("ov.promote"))));
    const recent = o.recent_cases.map((c) => h("li", {},
      h("div", { class: "ov-item" },
        h("span", { class: "tag-row" }, h("strong", { dir: "ltr" }, c.reference),
          h("span", { class: `tag cat-${c.category}` }, t(`cat.${c.category}`)),
          c.overdue ? h("span", { class: "tag tag-overdue" }, t("dash.overdue")) : null),
        h("span", { class: "caption" }, `${t(`status.${c.status}`)} · ${relative(c.created_at)}`)),
      h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: () => openCase(c.id) }, t("ov.details"))));

    $("overview-body").replaceChildren(
      h("div", { class: "kpis" },
        kpi(t("ov.today"), num(o.questions_today), t("ov.todayHow", { n: num(o.questions) })),
        kpi(t("ov.answered"), pct(o.answered), t("ov.answeredHow", { a: num(o.answered.numerator), b: num(o.answered.denominator) })),
        kpi(t("ov.escalated"), pct(o.escalated), t("ov.escalatedHow", { a: num(o.escalated.numerator), b: num(o.escalated.denominator) })),
        kpi(t("ov.open"), num(o.open_cases), t("ov.openHow")),
        kpi(t("ov.overdue"), num(o.overdue_cases), t("ov.overdueHow"), { tone: o.overdue_cases ? "danger" : null, action: overdueAction })),
      chart(o.daily),
      h("div", { class: "ov-columns" },
        listPanel(t("ov.topTitle"), t("ov.topHow"), top, t("ov.topEmpty"), [`#unanswered${qs}`, t("ov.allUnanswered")]),
        listPanel(t("ov.recentTitle"), t("ov.recentHow"), recent, t("ov.recentEmpty"), [`#cases${qs}`, t("ov.allCases")])),
      h("section", { class: "panel" },
        h("div", { class: "panel-head" }, h("div", {}, h("h3", {}, t("ov.impactTitle")), h("p", { class: "panel-how" }, t("ov.impactSub")))),
        h("div", { class: "impacts" },
          impact(t("ov.verified"), o.verified_answers, "ov.verifiedHow"),
          impact(t("ov.handoff"), o.handoff_success, "ov.handoffHow"),
          impact(t("ov.register"), o.register_after_recommend, "ov.registerHow"))));
    I18N.icons();
  }

  async function load(query) {
    const [o, faq] = await Promise.all([api(`/api/overview${query ? `?${query}` : ""}`), fetch("/api/faq").then((r) => r.json())]);
    categories = faq;  // used by the "Convert to FAQ" dialog
    render(o, query);
    return o;
  }

  return { load };
})();
