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
    "status.replied": "تم الرد",
    "period.label": "الفترة",
    "period.all": "كل الفترات",
    "period.today": "اليوم",
    "period.7d": "آخر 7 أيام",
    "period.30d": "آخر 30 يومًا",
    "period.custom": "مدة مخصصة",
    "period.from": "من",
    "period.to": "إلى",
    "period.apply": "تطبيق",
    "period.range": "من {from} إلى {to}",
    "period.allRange": "كل البيانات منذ البداية",
    "period.needDates": "اختر تاريخ البداية والنهاية، وأن تكون البداية قبل النهاية.",
    "badge.newCases": "{n} طلبات جديدة",
    "dash.emptyPeriod": "لا توجد أسئلة غير مجابة في هذه الفترة. وسّع الفترة أو اختر «كل الفترات» من الأعلى.",
    "dash.casesEmptyPeriod": "لا توجد حالات في هذه الفترة. وسّع الفترة أو اختر «كل الفترات» من الأعلى.",
    "status.closed": "مغلقة",
    "cat.unanswered": "سؤال غير مجاب",
    "dash.overdue": "رد جديد مطلوب",
    "dash.overdueHint": "مضى أكثر من يومي عمل دون رد",
    "dash.details": "التفاصيل",
    "dash.replied": "تم الرد",
    "detail.title": "تفاصيل الحالة",
    "detail.type": "النوع",
    "detail.date": "تاريخ الإرسال",
    "detail.status": "الحالة",
    "detail.contact": "وسيلة التواصل",
    "detail.tier": "العضوية",
    "detail.lang": "لغة الطلب",
    "detail.lang.ar": "العربية",
    "detail.lang.en": "الإنجليزية",
    "detail.due": "الرد المتوقع قبل",
    "detail.text": "نص الطلب",
    "detail.summary": "الملخص",
    "detail.log": "السجل",
    "detail.logReceived": "تم استلام الطلب",
    "detail.lastReply": "آخر رد أُرسل",
    "detail.replyBy": "{actor} · {when}",
    "detail.replyLabel": "الرد على المستخدم",
    "detail.replyPh": "اكتب ردًا واضحًا ومهذبًا…",
    "detail.replyHelp": "يظهر الرد للمستخدم في «طلباتي» وعند متابعة طلبه برقم الحالة. لا يظهر له اسمك.",
    "detail.send": "إرسال الرد",
    "detail.update": "تحديث الرد",
    "detail.sending": "جارٍ الإرسال…",
    "detail.sent": "أُرسل الرد وتغيّرت الحالة إلى «تم الرد».",
    "detail.needReply": "اكتب الرد قبل الإرسال.",
    "detail.error": "تعذّر إرسال الرد. حاول مرة أخرى.",
    "detail.offline": "لا يوجد اتصال بالإنترنت. لم يُرسل الرد.",
    "detail.loadError": "تعذّر تحميل سجل الحالة.",
    "action.case.status": "غيّر الحالة",
    "action.case.reply": "ردّ على المستخدم",
    "action.case.reply_update": "حدّث الرد",
    "action.case.notify": "أعاد إرسال الإشعار",
    "notify.title": "إشعار المستخدم",
    "notify.none": "يصل الإشعار بعد إرسال الرد إذا ترك المستخدم وسيلة تواصل.",
    "notify.email": "بريد إلكتروني",
    "notify.whatsapp": "واتساب",
    "notify.s.pending": "قيد الإرسال",
    "notify.s.sent": "أُرسل",
    "notify.s.simulated": "تجريبي: لم يُرسل فعليًا",
    "notify.s.failed": "تعذّر الإرسال",
    "notify.s.skipped": "لم يُرسل",
    "notify.e.no_contact": "لم يترك المستخدم وسيلة تواصل؛ يقرأ الرد في «طلباتي» أو برقم الحالة.",
    "notify.e.unsupported_contact": "وسيلة التواصل ليست بريدًا ولا جوالًا سعوديًا.",
    "notify.demoHint": "لا يوجد مزوّد بريد أو واتساب مضبوط، فحُفظت الرسالة في صندوق الإرسال التجريبي.",
    "notify.preview": "نص الرسالة",
    "notify.update": "تحديث",
    "notify.resend": "إعادة الإرسال",
    "notify.resent": "أُعيد إرسال الإشعار.",
    "notify.resendError": "تعذّر إعادة الإرسال. حاول مرة أخرى.",
    "notify.attempts": "{n} محاولات",
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
    "dash.name": "اسمك",
    "dash.nameHelp": "يظهر في سجل الإجراءات بجانب ما تعتمده أو تعدّله.",
    "dash.exportCsv": "تصدير ملف CSV",
    "dash.exporting": "جارٍ التصدير…",
    "dash.exported": "تم تنزيل الملف.",
    "dash.exportError": "تعذّر التصدير. أعد المحاولة.",
    "dash.colType": "النوع",
    "dash.filterCategory": "نوع الطلب",
    "dash.filterStatus": "حالة الطلب",
    "dash.allTypes": "كل الأنواع",
    "dash.allStatuses": "كل الحالات",
    "dash.casesFilteredEmpty": "لا توجد حالات تطابق التصفية.",
    "cat.inquiry": "استفسار",
    "cat.complaint": "شكوى",
    "cat.suggestion": "مقترح",
    "cat.service": "طلب خدمة",
    "alert.high_frequency_unanswered": "{count} من الأسئلة تكررت {threshold} مرات أو أكثر بلا إجابة معتمدة.",
    "alert.stale_cases": "{count} من الطلبات الجديدة تنتظر المراجعة منذ أكثر من {threshold} ساعة.",
    "alert.complaints_spike": "وصلت {count} شكاوى خلال آخر 7 أيام. راجع ما إذا كانت عن موضوع واحد.",
    "alert.action.unanswered": "عرض الأسئلة",
    "alert.action.cases": "عرض الطلبات",
    "alert.action.complaints": "عرض الشكاوى",
    "dash.faqTitle": "إدارة الأسئلة الشائعة",
    "dash.faqSub": "التعديلات تظهر فورًا في صفحة الأسئلة الشائعة للزوار.",
    "dash.allSections": "كل الأقسام",
    "dash.viewPublic": "عرض الصفحة العامة",
    "dash.addFaq": "إضافة سؤال",
    "dash.colFaqStatus": "الحالة",
    "dash.colLastChange": "آخر تعديل",
    "dash.faqEmpty": "لا توجد أسئلة في هذا القسم.",
    "dash.edit": "تعديل",
    "dash.delete": "حذف",
    "faq.demo": "تجريبي",
    "faq.approved": "معتمد",
    "faq.onlyAr": "عربي فقط",
    "faq.onlyEn": "إنجليزي فقط",
    "faq.seed": "المحتوى الأولي",
    "audit.by": "{actor} · {when}",
    "audit.unknown": "بدون اسم",
    "action.faq.promote": "اعتمده",
    "action.faq.create": "أضافه",
    "action.faq.update": "عدّله",
    "faqEdit.addTitle": "إضافة سؤال شائع",
    "faqEdit.editTitle": "تعديل سؤال شائع",
    "faqEdit.sub": "اكتب السؤال والإجابة بلغة واحدة على الأقل، وأرفق المصدر.",
    "faqEdit.arabic": "العربية",
    "faqEdit.english": "الإنجليزية",
    "faqEdit.questionAr": "السؤال",
    "faqEdit.answerAr": "الإجابة",
    "faqEdit.questionEn": "السؤال (بالإنجليزية)",
    "faqEdit.answerEn": "الإجابة (بالإنجليزية)",
    "faqEdit.sourceTitleEn": "اسم المصدر (بالإنجليزية)",
    "faqEdit.sourceTitle": "اسم المصدر",
    "faqEdit.url": "رابط المصدر (اختياري)",
    "faqEdit.demo": "محتوى تجريبي (لم تعتمده الجمعية بعد)",
    "faqEdit.save": "حفظ",
    "faqEdit.saving": "جارٍ الحفظ…",
    "faqEdit.saved": "تم حفظ السؤال.",
    "faqEdit.required": "اكتب السؤال والإجابة بلغة واحدة على الأقل، واسم المصدر.",
    "faqEdit.badUrl": "رابط المصدر يجب أن يبدأ بـ https://",
    "faqDelete.title": "حذف السؤال؟",
    "faqDelete.body": "سيُحذف السؤال نهائيًا من الأسئلة الشائعة ولا يمكن التراجع. يبقى أثر الحذف في سجل الإجراءات.",
    "faqDelete.confirm": "حذف نهائيًا",
    "faqDelete.deleting": "جارٍ الحذف…",
    "faqDelete.done": "حُذف السؤال.",
    "modal.addEnglish": "إضافة الترجمة الإنجليزية (اختياري)",
    "modal.questionEn": "السؤال بالإنجليزية",
    "modal.answerEn": "الإجابة بالإنجليزية",
    "modal.sourceEn": "اسم المصدر بالإنجليزية",
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
    "status.replied": "Replied",
    "period.label": "Period",
    "period.all": "All time",
    "period.today": "Today",
    "period.7d": "Last 7 days",
    "period.30d": "Last 30 days",
    "period.custom": "Custom range",
    "period.from": "From",
    "period.to": "To",
    "period.apply": "Apply",
    "period.range": "{from} to {to}",
    "period.allRange": "All data since the start",
    "period.needDates": "Choose a start and an end date, with the start before the end.",
    "badge.newCases": "{n} new requests",
    "dash.emptyPeriod": "No unanswered questions in this period. Widen the period or choose “All time” above.",
    "dash.casesEmptyPeriod": "No cases in this period. Widen the period or choose “All time” above.",
    "status.closed": "Closed",
    "cat.unanswered": "Unanswered question",
    "dash.overdue": "Reply needed",
    "dash.overdueHint": "More than two business days without a reply",
    "dash.details": "Details",
    "dash.replied": "Replied",
    "detail.title": "Case details",
    "detail.type": "Type",
    "detail.date": "Sent",
    "detail.status": "Status",
    "detail.contact": "Contact",
    "detail.tier": "Membership",
    "detail.lang": "Request language",
    "detail.lang.ar": "Arabic",
    "detail.lang.en": "English",
    "detail.due": "Reply expected by",
    "detail.text": "Request text",
    "detail.summary": "Summary",
    "detail.log": "History",
    "detail.logReceived": "Request received",
    "detail.lastReply": "Last reply sent",
    "detail.replyBy": "{actor} · {when}",
    "detail.replyLabel": "Reply to the user",
    "detail.replyPh": "Write a clear, polite reply…",
    "detail.replyHelp": "The user sees the reply in My requests and when tracking the case number. Your name isn't shown to them.",
    "detail.send": "Send reply",
    "detail.update": "Update reply",
    "detail.sending": "Sending…",
    "detail.sent": "Reply sent. The status changed to Replied.",
    "detail.needReply": "Write the reply before sending.",
    "detail.error": "Couldn't send the reply. Please try again.",
    "detail.offline": "No internet connection. The reply wasn't sent.",
    "detail.loadError": "Couldn't load the case history.",
    "action.case.status": "Changed status",
    "action.case.reply": "Replied to the user",
    "action.case.reply_update": "Updated the reply",
    "action.case.notify": "Resent the notification",
    "notify.title": "User notification",
    "notify.none": "Sent after you reply, if the user left contact details.",
    "notify.email": "Email",
    "notify.whatsapp": "WhatsApp",
    "notify.s.pending": "Sending",
    "notify.s.sent": "Sent",
    "notify.s.simulated": "Demo: not actually sent",
    "notify.s.failed": "Failed",
    "notify.s.skipped": "Not sent",
    "notify.e.no_contact": "The user left no contact details; they read the reply in My requests or by case number.",
    "notify.e.unsupported_contact": "The contact is neither an email nor a Saudi mobile number.",
    "notify.demoHint": "No email or WhatsApp provider is set up, so the message was kept in the demo outbox.",
    "notify.preview": "Message text",
    "notify.update": "Update",
    "notify.resend": "Send again",
    "notify.resent": "Notification sent again.",
    "notify.resendError": "Couldn't send it again. Please try again.",
    "notify.attempts": "{n} attempts",
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
    "dash.name": "Your name",
    "dash.nameHelp": "Shown in the action log next to what you approve or edit.",
    "dash.exportCsv": "Export CSV",
    "dash.exporting": "Exporting…",
    "dash.exported": "File downloaded.",
    "dash.exportError": "Couldn't export. Please try again.",
    "dash.colType": "Type",
    "dash.filterCategory": "Request type",
    "dash.filterStatus": "Request status",
    "dash.allTypes": "All types",
    "dash.allStatuses": "All statuses",
    "dash.casesFilteredEmpty": "No cases match the filter.",
    "cat.inquiry": "Inquiry",
    "cat.complaint": "Complaint",
    "cat.suggestion": "Suggestion",
    "cat.service": "Service request",
    "alert.high_frequency_unanswered": "{count} question(s) asked {threshold}+ times still have no approved answer.",
    "alert.stale_cases": "{count} new request(s) have waited more than {threshold} hours for review.",
    "alert.complaints_spike": "{count} complaints arrived in the last 7 days. Check whether they share a topic.",
    "alert.action.unanswered": "View questions",
    "alert.action.cases": "View requests",
    "alert.action.complaints": "View complaints",
    "dash.faqTitle": "Manage FAQ",
    "dash.faqSub": "Changes appear immediately on the public FAQ page.",
    "dash.allSections": "All sections",
    "dash.viewPublic": "View public page",
    "dash.addFaq": "Add question",
    "dash.colFaqStatus": "Status",
    "dash.colLastChange": "Last change",
    "dash.faqEmpty": "No questions in this section.",
    "dash.edit": "Edit",
    "dash.delete": "Delete",
    "faq.demo": "Demo",
    "faq.approved": "Approved",
    "faq.onlyAr": "Arabic only",
    "faq.onlyEn": "English only",
    "faq.seed": "Initial content",
    "audit.by": "{actor} · {when}",
    "audit.unknown": "No name",
    "action.faq.promote": "Approved by",
    "action.faq.create": "Added by",
    "action.faq.update": "Edited by",
    "faqEdit.addTitle": "Add FAQ entry",
    "faqEdit.editTitle": "Edit FAQ entry",
    "faqEdit.sub": "Write the question and answer in at least one language, and add the source.",
    "faqEdit.arabic": "Arabic",
    "faqEdit.english": "English",
    "faqEdit.questionAr": "Question (Arabic)",
    "faqEdit.answerAr": "Answer (Arabic)",
    "faqEdit.questionEn": "Question",
    "faqEdit.answerEn": "Answer",
    "faqEdit.sourceTitleEn": "Source name",
    "faqEdit.sourceTitle": "Source name (Arabic)",
    "faqEdit.url": "Source link (optional)",
    "faqEdit.demo": "Demo content (not yet approved by the association)",
    "faqEdit.save": "Save",
    "faqEdit.saving": "Saving…",
    "faqEdit.saved": "Question saved.",
    "faqEdit.required": "Write the question and answer in at least one language, plus the source name.",
    "faqEdit.badUrl": "The source link must start with https://",
    "faqDelete.title": "Delete this question?",
    "faqDelete.body": "It will be permanently removed from the FAQ and can't be undone. The deletion stays in the action log.",
    "faqDelete.confirm": "Delete permanently",
    "faqDelete.deleting": "Deleting…",
    "faqDelete.done": "Question deleted.",
    "modal.addEnglish": "Add English translation (optional)",
    "modal.questionEn": "Question in English",
    "modal.answerEn": "Answer in English",
    "modal.sourceEn": "Source name in English",
  },
});

const $ = (id) => document.getElementById(id);
let unanswered = [];
let page = 0;
let tierNames = {};
let categories = [];
let faqItems = [];
let current = null;   // unanswered question being converted
let editing = null;   // FAQ item being edited (null = new)
let deleting = null;  // FAQ item pending deletion

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

const store = {
  get: (k) => { try { return sessionStorage.getItem(k) || ""; } catch { return ""; } },
  set: (k, v) => { try { v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k); } catch { /* ignore */ } },
};
const token = () => store.get("supportToken");
const setToken = (v) => store.set("supportToken", v);
const staffName = () => store.get("staffName");

const isOffline = (err) => !navigator.onLine || err instanceof TypeError;
const staffHeaders = () => ({ "X-Support-Token": token(), "X-Staff-Name": encodeURIComponent(staffName()) });

async function api(path, options = {}) {
  if (!navigator.onLine) throw new TypeError("offline");
  const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...staffHeaders(), ...(options.headers || {}) } });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error(String(res.status));
  return res.status === 204 ? null : res.json();
}

function toast(text) {
  const el = $("toast");
  el.textContent = text; el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 3500);
}

function authFailed() { setToken(""); document.querySelectorAll("dialog[open]").forEach((d) => d.close()); show(currentView()); showAuthError(); }

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
const ref = (id) => `CX-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

/* ---------- Views ---------- */
const VIEWS = ["overview", "cases", "unanswered", "faq"];
const PERIOD_VIEWS = ["overview", "cases", "unanswered"];
function currentView() { const v = location.hash.slice(1).split("?")[0]; return VIEWS.includes(v) ? v : "overview"; }
const hashParams = () => new URLSearchParams(location.hash.split("?")[1] || "");

/* ---------- Date period (kept in the hash: #view?period=7d or ?period=custom&from=..&to=..) ---------- */
const riyadhToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
function shiftDay(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
function currentPeriod(view = currentView()) {
  const p = hashParams();
  let kind = p.get("period") || (view === "overview" ? "7d" : "all");
  if (kind === "all" && view === "overview") kind = "7d";  // the overview always covers a range
  const today = riyadhToday();
  if (kind === "today") return { kind, from: today, to: today };
  if (kind === "7d") return { kind, from: shiftDay(today, -6), to: today };
  if (kind === "30d") return { kind, from: shiftDay(today, -29), to: today };
  if (kind === "custom") {
    const from = p.get("from"), to = p.get("to");
    if (ISO_DAY.test(from || "") && ISO_DAY.test(to || "") && from <= to) return { kind, from, to };
  }
  return { kind: "all", from: null, to: null };
}
/* Query string for the API (date_from/date_to), "" for all time. */
function periodQuery(view) {
  const p = currentPeriod(view);
  return p.from ? `date_from=${p.from}&date_to=${p.to}` : "";
}
/* The period part of the hash, carried over when moving between views. */
function periodHash() {
  const p = hashParams();
  const keep = new URLSearchParams();
  for (const k of ["period", "from", "to"]) if (p.get(k)) keep.set(k, p.get(k));
  return keep.toString();
}
function setHash(view, extra = {}) {
  const params = new URLSearchParams(periodHash());
  for (const [k, v] of Object.entries(extra)) { if (v) params.set(k, v); else params.delete(k); }
  const qs = params.toString();
  const next = `#${view}${qs ? `?${qs}` : ""}`;
  if (location.hash !== next) location.hash = next; else route();
}
const shortDay = (iso) => new Intl.DateTimeFormat(locale(), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  .format(new Date(`${iso}T00:00:00Z`));
function syncPeriodBar(view) {
  const bar = $("period-bar");
  bar.hidden = !token() || !PERIOD_VIEWS.includes(view);
  if (bar.hidden) return;
  const p = currentPeriod(view);
  $("period").querySelector('option[value="all"]').hidden = view === "overview";
  $("period").value = p.kind;
  $("period-custom").hidden = p.kind !== "custom";
  if (p.kind === "custom") { $("period-from").value = p.from || ""; $("period-to").value = p.to || ""; }
  $("period-range").textContent = !p.from ? t("period.allRange")
    : p.from === p.to ? shortDay(p.from) : t("period.range", { from: shortDay(p.from), to: shortDay(p.to) });
  // Sidebar and tab links keep the chosen period.
  const qs = periodHash();
  document.querySelectorAll("[data-view]").forEach((a) => {
    a.setAttribute("href", `#${a.dataset.view}${qs && PERIOD_VIEWS.includes(a.dataset.view) ? `?${qs}` : ""}`);
  });
}
$("period").addEventListener("change", () => {
  const kind = $("period").value;
  $("period-error").hidden = true;
  if (kind === "custom") {
    $("period-custom").hidden = false;
    const p = currentPeriod();
    $("period-from").value = p.from || shiftDay(riyadhToday(), -13);
    $("period-to").value = p.to || riyadhToday();
    $("period-from").focus();
    return;
  }
  const params = new URLSearchParams(hashParams());
  params.delete("from"); params.delete("to");
  if (kind === "all") params.delete("period"); else params.set("period", kind);
  location.hash = `#${currentView()}${params.toString() ? `?${params}` : ""}`;
});
$("period-custom").addEventListener("submit", (e) => {
  e.preventDefault();
  const from = $("period-from").value, to = $("period-to").value;
  if (!ISO_DAY.test(from) || !ISO_DAY.test(to) || from > to) { formError("period-error", "period.needDates"); return; }
  $("period-error").hidden = true;
  const params = new URLSearchParams(hashParams());
  params.set("period", "custom"); params.set("from", from); params.set("to", to);
  location.hash = `#${currentView()}?${params}`;
});

/* ---------- Sidebar badge: new requests ---------- */
async function loadCounts() {
  const { new_cases: n } = await api("/api/staff/counts");
  document.querySelectorAll('[data-badge="new-cases"]').forEach((b) => {
    b.hidden = !n;
    b.textContent = n > 99 ? "99+" : I18N.formatNumber(n);
    b.setAttribute("aria-label", t("badge.newCases", { n: I18N.formatNumber(n) }));
  });
}

function show(view) {
  const authed = Boolean(token());
  $("login").hidden = authed;
  $("logout").hidden = !authed;
  if (!authed) $("alerts").hidden = true;
  VIEWS.forEach((v) => { $(`view-${v}`).hidden = !authed || v !== view; });
  document.querySelectorAll("[data-view]").forEach((a) => {
    if (a.dataset.view === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  $("side-name").textContent = authed && staffName() ? staffName() : t("dash.team");
}

const STATE = { overview: ["overview-state", "overview-body"], unanswered: ["unanswered-state", "unanswered-table"],
                cases: ["cases-state", "cases-table"], faq: ["faq-state", "faq-table"] };
const LOADERS = { overview: () => Overview.load(periodQuery("overview")), unanswered: () => loadUnanswered(),
                  cases: () => loadCases(), faq: () => loadFaq() };
async function route() {
  const view = currentView();
  show(view);
  syncPeriodBar(view);
  if (!token()) { (staffName() ? $("token") : $("staff-name")).focus(); return; }
  const [stateId, tableId] = STATE[view];
  $(stateId).textContent = t("dash.loading"); $(stateId).hidden = false; $(tableId).hidden = true;
  if (view === "unanswered") $("pager").hidden = true;
  if (view === "cases") {  // filters can come from the hash (links from the overview)
    const p = hashParams();
    if (p.has("status")) $("filter-status").value = p.get("status");
    if (p.has("category")) $("filter-category").value = p.get("category");
  }
  try {
    await Promise.all([loadAlerts(), loadCounts(), LOADERS[view]()]);
    $(stateId).hidden = view !== "overview" ? $(stateId).hidden : true;
    $(tableId).hidden = view === "overview" ? false : $(tableId).hidden;
  } catch (e) {
    if (e.message === "auth") return authFailed();
    $(stateId).textContent = t(isOffline(e) ? "dash.offline" : "dash.loadError"); $(stateId).hidden = false;
  } finally {
    const btn = $("auth").querySelector("button");
    btn.disabled = false; btn.textContent = t("dash.signIn");
  }
}

function showAuthError() { $("auth-error").textContent = t("dash.badToken"); $("auth-error").hidden = false; }

/* ---------- Smart alerts (idea 62) ---------- */
const ALERT_ACTION = {
  high_frequency_unanswered: ["alert.action.unanswered", () => { $("sort").value = "count"; setHash("unanswered"); }],
  stale_cases: ["alert.action.cases", () => { setHash("cases", { status: "new", category: "" }); }],
  complaints_spike: ["alert.action.complaints", () => { setHash("cases", { category: "complaint", status: "" }); }],
};
async function loadAlerts() {
  const list = await api("/api/alerts");
  const box = $("alerts");
  box.replaceChildren(...list.map((a) => h("div", { class: "alert", role: "status" },
    ic("triangle-alert"),
    h("p", {}, t(`alert.${a.kind}`, { count: I18N.formatNumber(a.count), threshold: I18N.formatNumber(a.threshold) })),
    h("button", { class: "btn btn-sm btn-text", type: "button", onclick: ALERT_ACTION[a.kind][1] }, t(ALERT_ACTION[a.kind][0])))));
  box.hidden = list.length === 0;
  I18N.icons();
}

/* ---------- CSV export ---------- */
document.querySelectorAll("[data-export]").forEach((btn) => btn.addEventListener("click", async () => {
  const kind = btn.dataset.export;
  const label = btn.querySelector("span");
  btn.disabled = true; label.textContent = t("dash.exporting");
  try {
    if (!navigator.onLine) throw new TypeError("offline");
    const path = kind === "cases" ? "/api/support-cases/export.csv" : "/api/unanswered/export.csv";
    const params = new URLSearchParams(periodQuery(kind));  // the export follows the filters on screen
    params.set("lang", I18N.lang);
    if (kind === "cases") {
      if ($("filter-status").value) params.set("case_status", $("filter-status").value);
      if ($("filter-category").value) params.set("category", $("filter-category").value);
    }
    const res = await fetch(`${path}?${params}`, { headers: staffHeaders() });
    if (res.status === 401) return authFailed();
    if (!res.ok) throw new Error(String(res.status));
    const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "")?.[1] || `supercx-${kind}.csv`;
    const url = URL.createObjectURL(await res.blob());
    const a = h("a", { href: url, download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(t("dash.exported"));
  } catch (err) {
    toast(t(isOffline(err) ? "dash.offline" : "dash.exportError"));
  } finally {
    btn.disabled = false; label.textContent = t("dash.exportCsv");
  }
}));

/* ---------- Unanswered questions ---------- */
async function loadUnanswered() {
  const [rows, stats, faq] = await Promise.all([
    api(`/api/unanswered?sort=${$("sort").value}&${periodQuery("unanswered")}`),
    api(`/api/unanswered/stats?${periodQuery("unanswered")}`), fetch("/api/faq").then((r) => r.json()),
  ]);
  unanswered = rows;
  categories = faq;
  $("stat-pending").textContent = I18N.formatNumber(stats.pending);
  $("stat-high").textContent = I18N.formatNumber(stats.high_frequency);
  $("stat-high-label").title = t("dash.statHighHint", { n: stats.high_frequency_threshold });
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
  $("unanswered-state").textContent = t(periodQuery("unanswered") ? "dash.emptyPeriod" : "dash.empty");
  $("pager-text").textContent = t("dash.pager", { shown: I18N.formatNumber(slice.length), total: I18N.formatNumber(unanswered.length) });
  $("prev").disabled = page === 0;
  $("next").disabled = start + PAGE_SIZE >= unanswered.length;
}

$("prev").addEventListener("click", () => { page = Math.max(0, page - 1); renderUnanswered(); });
$("next").addEventListener("click", () => { page += 1; renderUnanswered(); });
$("sort").addEventListener("change", () => { page = 0; route(); });

/* Dialog close buttons */
document.querySelectorAll("dialog [data-close]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
const categoryOptions = (selected) => categories.map((c) => new Option(c.title[I18N.lang], c.id, false, c.id === selected));
const val = (id) => $(id).value.trim();
function formError(id, key) { $(id).textContent = t(key); $(id).hidden = false; }

/* ---------- Convert to FAQ ---------- */
function openPromote(q) {
  current = q;
  $("m-question").value = q.question; // the same question, editable
  ["m-answer", "m-source", "m-question-en", "m-answer-en", "m-source-en"].forEach((id) => { $(id).value = ""; });
  $("promote-form").querySelector("details").open = false;
  $("m-error").hidden = true;
  $("m-category").replaceChildren(...categoryOptions());
  $("m-checked").textContent = t("modal.checked", { date: I18N.formatDate(new Date().toISOString().slice(0, 10)) });
  $("promote").showModal();
  $("m-answer").focus();
}

$("promote-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = val("m-question"), answer = val("m-answer"), source = val("m-source");
  if (question.length < 3 || answer.length < 3 || source.length < 2) return formError("m-error", "modal.required");
  const isUrl = /^https?:\/\/\S+$/i.test(source);
  const btn = $("m-approve");
  btn.disabled = true; btn.textContent = t("modal.approving");
  try {
    await api(`/api/unanswered/${current.id}/promote`, {
      method: "POST",
      body: JSON.stringify({ category_id: $("m-category").value, question, answer,
                             source_title: isUrl ? new URL(source).hostname + new URL(source).pathname.replace(/\/$/, "") : source,
                             source_url: isUrl ? source : null,
                             question_en: val("m-question-en") || null, answer_en: val("m-answer-en") || null,
                             source_title_en: val("m-source-en") || null }),
    });
    $("promote").close();
    toast(t("modal.done"));
    await Promise.all([currentView() === "overview" ? LOADERS.overview() : loadUnanswered(), loadAlerts()]);
  } catch (err) {
    if (err.message === "auth") return authFailed();
    formError("m-error", isOffline(err) ? "modal.offline" : "modal.error");
  } finally {
    btn.disabled = false; btn.textContent = t("modal.approve");
  }
});

/* ---------- Support cases ---------- */
function statusSelect(c) {
  const select = h("select", { class: "select", "aria-label": t("dash.statusAria") });
  ["new", "in_progress", "replied", "closed"].forEach((v) => select.add(new Option(t(`status.${v}`), v, false, v === c.status)));
  select.addEventListener("change", async () => {
    select.disabled = true;
    try {
      await api(`/api/support-cases/${c.id}`, { method: "PATCH", body: JSON.stringify({ status: select.value }) });
      c.status = select.value; toast(t("dash.statusSaved")); loadAlerts().catch(() => {}); loadCounts().catch(() => {}); loadCases().catch(() => {});
    } catch (err) {
      if (err.message === "auth") return authFailed();
      select.value = c.status; toast(t(isOffline(err) ? "dash.offline" : "dash.statusSaveError"));
    } finally { select.disabled = false; }
  });
  return select;
}

async function loadCases() {
  const params = new URLSearchParams();
  if ($("filter-category").value) params.set("category", $("filter-category").value);
  if ($("filter-status").value) params.set("case_status", $("filter-status").value);
  const filtered = params.toString() !== "";
  for (const [k, v] of new URLSearchParams(periodQuery("cases"))) params.set(k, v);
  const [cases, tiers] = await Promise.all([api(`/api/support-cases?${params}`), fetch("/api/memberships").then((r) => r.json())]);
  tierNames = Object.fromEntries(tiers.map((tier) => [tier.id, tier.name]));
  casesById = Object.fromEntries(cases.map((c) => [c.id, c]));
  $("cases-rows").replaceChildren(...cases.map((c) => h("tr", { class: c.overdue ? "overdue" : null },
    h("td", { class: "q", dir: "ltr" }, h("span", { class: "tag-row" }, ref(c.id),
      c.overdue ? h("span", { class: "tag tag-overdue", title: t("dash.overdueHint"), dir: "auto" }, ic("clock-alert", "icon-sm"), t("dash.overdue")) : null,
      c.demo ? h("span", { class: "tag" }, t("demo")) : null)),
    h("td", { "data-label": t("dash.colDate"), class: "muted" }, relative(c.created_at)),
    h("td", { "data-label": t("dash.colType") }, h("span", { class: `tag cat-${c.category || "inquiry"}` }, t(`cat.${c.category || "inquiry"}`))),
    h("td", { "data-label": t("dash.colQuestion"), dir: "auto" }, c.question,
      c.summary && c.summary !== c.question ? h("span", { class: "case-summary", dir: "auto" }, c.summary) : null),
    h("td", { "data-label": t("dash.colTier") }, tierNames[c.tier_id]?.[I18N.lang] || "—"),
    h("td", { "data-label": t("dash.colContact"), dir: "auto" }, c.contact || t("dash.noContact")),
    h("td", { "data-label": t("dash.colStatus") }, statusSelect(c)),
    h("td", { class: "act" }, h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: () => openCase(c.id) },
      ic(c.reply ? "message-square-text" : "reply", "icon-sm"), t("dash.details"))))));
  I18N.icons();
  $("cases-table").hidden = cases.length === 0;
  $("cases-state").hidden = cases.length > 0;
  $("cases-state").textContent = t(filtered ? "dash.casesFilteredEmpty" : periodQuery("cases") ? "dash.casesEmptyPeriod" : "dash.casesEmpty");
}

/* ---------- Case details + reply to the user ---------- */
let casesById = {};
let openCaseId = null;
async function openCase(id) {
  if (!Object.keys(tierNames).length) {
    fetch("/api/memberships").then((r) => r.json())
      .then((tiers) => { tierNames = Object.fromEntries(tiers.map((tier) => [tier.id, tier.name])); }).catch(() => {});
  }
  if (!casesById[id]) {  // opened from the overview
    try { casesById[id] = await api(`/api/support-cases/${encodeURIComponent(id)}`); } catch (err) {
      if (err.message === "auth") return authFailed();
      toast(t(isOffline(err) ? "dash.offline" : "dash.loadError")); return;
    }
  }
  const c = casesById[id];
  openCaseId = id;
  $("cd-ref").textContent = c.reference;
  $("cd-error").hidden = true;
  $("cd-text").value = c.reply || "";
  $("cd-send").textContent = t(c.reply ? "detail.update" : "detail.send");
  renderCase(c, null);
  if (!$("case-detail").open) $("case-detail").showModal();
  $("cd-text").focus();
  try {
    const [log, notes] = await Promise.all([
      api(`/api/audit-log?target_id=${encodeURIComponent(id)}`),
      api(`/api/support-cases/${encodeURIComponent(id)}/notifications`).catch((err) => { if (err.message === "auth") throw err; return null; }),
    ]);
    caseNotes[id] = notes;
    if (openCaseId === id) renderCase(casesById[id], log);
    // Sending runs right after the reply is saved: look again once if it is still going.
    if (notes?.some((n) => n.status === "pending")) setTimeout(() => { if (openCaseId === id) openCase(id); }, 1500);
  } catch (err) {
    if (err.message === "auth") return authFailed();
    if (openCaseId === id) renderCase(casesById[id], "error");
  }
}

/* The message to the user about the reply: email, WhatsApp, or the demo outbox. */
const caseNotes = {};
const NOTE_TAG = { sent: "badge-success", simulated: "tag-demo", failed: "badge-danger", skipped: "req-status", pending: "req-new" };
function notificationBlock(c) {
  const notes = caseNotes[c.id];
  if (notes === undefined) return null;
  const head = h("h3", {}, t("notify.title"));
  if (!notes || !notes.length) {
    return h("section", { class: "detail-block" }, head, h("p", { class: "muted" }, t(notes === null ? "detail.loadError" : "notify.none")));
  }
  const items = notes.map((n, i) => h("li", { class: "notify-item" },
    h("div", { class: "notify-row" },
      h("span", { class: "notify-chan" },
        ic(n.channel === "whatsapp" ? "message-circle" : n.channel === "email" ? "mail" : "bell-off", "icon-sm"),
        n.channel === "none" ? t("notify.s.skipped") : t(`notify.${n.channel}`),
        n.recipient ? h("span", { class: "muted", dir: "ltr" }, n.recipient) : null,
        n.kind === "case.reply_update" ? h("span", { class: "muted" }, `· ${t("notify.update")}`) : null),
      h("span", { class: `tag ${NOTE_TAG[n.status] || ""}` }, t(`notify.s.${n.status}`))),
    h("span", { class: "caption" }, relative(n.sent_at || n.created_at),
      n.attempts > 1 ? ` · ${t("notify.attempts", { n: n.attempts })}` : ""),
    n.error && n.status === "skipped" ? h("p", { class: "caption" }, t(`notify.e.${n.error}`)) : null,
    n.status === "failed" ? h("p", { class: "caption notify-error" }, n.error) : null,
    n.status === "simulated" && i === 0 ? h("p", { class: "caption" }, t("notify.demoHint")) : null,
    n.body ? h("details", { class: "translation" }, h("summary", {}, t("notify.preview")),
      n.subject ? h("strong", { dir: "auto" }, n.subject) : null,
      h("p", { class: "notify-body", dir: "auto" }, n.body)) : null));
  const canResend = c.reply && c.contact && notes[0].status !== "pending";
  return h("section", { class: "detail-block" }, head, h("ol", { class: "notify-list" }, ...items),
    canResend ? h("button", { class: `btn btn-sm ${notes[0].status === "failed" ? "btn-primary" : "btn-secondary"}`, type: "button",
      onclick: (e) => resendNotification(c.id, e.currentTarget) }, ic("send", "icon-sm"), t("notify.resend")) : null);
}

async function resendNotification(id, btn) {
  btn.disabled = true;
  try {
    await api(`/api/support-cases/${encodeURIComponent(id)}/notify`, { method: "POST" });
    toast(t("notify.resent"));
    await openCase(id);
  } catch (err) {
    if (err.message === "auth") return authFailed();
    toast(t(isOffline(err) ? "dash.offline" : "notify.resendError"));
    btn.disabled = false;
  }
}

function renderCase(c, log) {
  const fact = (label, value, attrs = {}) => h("div", {}, h("dt", { class: "caption" }, label), h("dd", attrs, value));
  const cat = c.category || "inquiry";
  const history = log === "error" ? h("p", { class: "muted" }, t("detail.loadError"))
    : log === null ? h("p", { class: "muted" }, t("dash.loading"))
    : h("ol", { class: "case-log" },
      ...[...log].reverse().map((e) => h("li", {},
        h("span", {}, t(`action.${e.action}`), " · ", e.actor || t("audit.unknown")),
        h("span", { class: "muted" }, relative(e.at)))),
      h("li", {}, h("span", {}, t("detail.logReceived")), h("span", { class: "muted" }, relative(c.created_at))));
  if (Array.isArray(log)) history.prepend(history.lastChild); // oldest first: received, then actions
  $("cd-body").replaceChildren(...[
    h("dl", { class: "detail-grid" },
      fact(t("detail.type"), h("span", { class: `tag cat-${cat}` }, t(`cat.${cat}`))),
      fact(t("detail.status"), h("span", { class: "tag-row" }, t(`status.${c.status}`),
        c.overdue ? h("span", { class: "tag tag-overdue" }, t("dash.overdue")) : null)),
      fact(t("detail.date"), relative(c.created_at)),
      fact(t("detail.due"), relative(c.due_at)),
      fact(t("detail.contact"), c.contact || t("dash.noContact"), { dir: "auto" }),
      fact(t("detail.tier"), tierNames[c.tier_id]?.[I18N.lang] || "—"),
      fact(t("detail.lang"), t(`detail.lang.${c.language}`))),
    h("section", { class: "detail-block" }, h("h3", {}, t("detail.text")), h("p", { dir: "auto" }, c.question)),
    c.summary && c.summary !== c.question
      ? h("section", { class: "detail-block" }, h("h3", {}, t("detail.summary")), h("p", { dir: "auto" }, c.summary)) : null,
    c.reply ? h("section", { class: "detail-block team-reply" }, h("h3", {}, t("detail.lastReply")),
      h("p", { dir: "auto" }, c.reply),
      h("span", { class: "caption" }, t("detail.replyBy", { actor: c.replied_by || t("audit.unknown"), when: relative(c.replied_at) }))) : null,
    notificationBlock(c),
    h("section", { class: "detail-block" }, h("h3", {}, t("detail.log")), history)].filter(Boolean));
  I18N.icons();
}

$("cd-reply").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = openCaseId;
  const text = $("cd-text").value.trim();
  const btn = $("cd-send");
  $("cd-error").hidden = true;
  if (text.length < 2) { formError("cd-error", "detail.needReply"); $("cd-text").focus(); return; }
  btn.disabled = true; btn.textContent = t("detail.sending");
  try {
    const updated = await api(`/api/support-cases/${id}/reply`, { method: "POST", body: JSON.stringify({ reply: text }) });
    casesById[id] = updated;
    toast(t("detail.sent"));
    loadAlerts().catch(() => {});
    loadCounts().catch(() => {});
    (currentView() === "overview" ? LOADERS.overview() : loadCases()).catch(() => {});
    await openCase(id);
  } catch (err) {
    if (err.message === "auth") return authFailed();
    formError("cd-error", isOffline(err) ? "detail.offline" : "detail.error");
  } finally {
    btn.disabled = false;
    btn.textContent = t(casesById[id]?.reply ? "detail.update" : "detail.send");
  }
});
$("case-detail").addEventListener("close", () => { openCaseId = null; });

$("filter-category").addEventListener("change", () => setHash("cases", { category: $("filter-category").value, status: $("filter-status").value }));
$("filter-status").addEventListener("change", () => setHash("cases", { category: $("filter-category").value, status: $("filter-status").value }));

/* ---------- FAQ management (idea 68) ---------- */
async function loadFaq() {
  const [items, faq] = await Promise.all([api("/api/staff/faq-items"), fetch("/api/faq").then((r) => r.json())]);
  faqItems = items;
  categories = faq;
  const chosen = $("faq-filter").value;
  $("faq-filter").replaceChildren(new Option(t("dash.allSections"), ""), ...categoryOptions(chosen));
  renderFaq();
}

function lastChange(it) {
  if (!it.last_action) return h("span", { class: "muted" }, it.demo ? t("faq.seed") : "—");
  const verb = t(`action.${it.last_action}`);
  return h("span", { class: "muted" }, `${verb} ${it.last_actor || t("audit.unknown")} · ${relative(it.last_at)}`);
}

function renderFaq() {
  const section = $("faq-filter").value;
  const titles = Object.fromEntries(categories.map((c) => [c.id, c.title[I18N.lang]]));
  const order = Object.fromEntries(categories.map((c, i) => [c.id, i]));
  const rows = faqItems.filter((it) => !section || it.category_id === section)
    .sort((a, b) => order[a.category_id] - order[b.category_id]);
  $("faq-rows").replaceChildren(...rows.map((it) => {
    const q = I18N.lang === "en" ? (it.question_en || it.question_ar) : (it.question_ar || it.question_en);
    const only = !it.question_en ? "faq.onlyAr" : !it.question_ar ? "faq.onlyEn" : null;
    return h("tr", {},
      h("td", { class: "q", dir: "auto" }, q),
      h("td", { "data-label": t("modal.category") }, titles[it.category_id] || it.category_id),
      h("td", { "data-label": t("dash.colFaqStatus") }, h("span", { class: "tag-row" },
        h("span", { class: `tag ${it.demo ? "" : "badge-success"}` }, t(it.demo ? "faq.demo" : "faq.approved")),
        only ? h("span", { class: "tag" }, t(only)) : null)),
      h("td", { "data-label": t("dash.colLastChange") }, lastChange(it)),
      h("td", { class: "act" }, h("span", { class: "row-actions" },
        h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: () => openFaqEdit(it) }, ic("pencil", "icon-sm"), t("dash.edit")),
        h("button", { class: "btn btn-sm btn-danger-text", type: "button", onclick: () => openFaqDelete(it) }, ic("trash-2", "icon-sm"), t("dash.delete")))));
  }));
  $("faq-table").hidden = rows.length === 0;
  $("faq-state").hidden = rows.length > 0;
  $("faq-state").textContent = t("dash.faqEmpty");
  I18N.icons();
}
$("faq-filter").addEventListener("change", renderFaq);

const FIELDS = { "f-question-ar": "question_ar", "f-answer-ar": "answer_ar", "f-question-en": "question_en",
                 "f-answer-en": "answer_en", "f-source": "source_title", "f-source-en": "source_title_en", "f-url": "source_url" };
function openFaqEdit(item) {
  editing = item;
  $("faq-edit-title").textContent = t(item ? "faqEdit.editTitle" : "faqEdit.addTitle");
  $("f-category").replaceChildren(...categoryOptions(item?.category_id || $("faq-filter").value));
  for (const [id, key] of Object.entries(FIELDS)) $(id).value = item?.[key] || "";
  $("f-demo").checked = item ? item.demo : false;
  $("f-error").hidden = true;
  $("faq-edit").showModal();
  $(I18N.lang === "en" ? "f-question-en" : "f-question-ar").focus();
}
$("faq-add").addEventListener("click", () => openFaqEdit(null));

$("faq-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = { category_id: $("f-category").value, demo: $("f-demo").checked };
  for (const [id, key] of Object.entries(FIELDS)) body[key] = val(id) || null;
  if (!(body.question_ar || body.question_en) || !(body.answer_ar || body.answer_en) || !body.source_title || body.source_title.length < 2)
    return formError("f-error", "faqEdit.required");
  if (body.source_url && !/^https?:\/\/\S+$/i.test(body.source_url)) return formError("f-error", "faqEdit.badUrl");
  const btn = $("f-save");
  btn.disabled = true; btn.textContent = t("faqEdit.saving");
  try {
    await api(editing ? `/api/staff/faq-items/${editing.id}` : "/api/staff/faq-items",
              { method: editing ? "PUT" : "POST", body: JSON.stringify(body) });
    $("faq-edit").close();
    toast(t("faqEdit.saved"));
    await loadFaq();
  } catch (err) {
    if (err.message === "auth") return authFailed();
    formError("f-error", isOffline(err) ? "modal.offline" : "modal.error");
  } finally {
    btn.disabled = false; btn.textContent = t("faqEdit.save");
  }
});

function openFaqDelete(item) {
  deleting = item;
  $("faq-delete-q").textContent = item.question_ar || item.question_en;
  $("d-error").hidden = true;
  $("faq-delete").showModal();
  $("faq-delete").querySelector("[data-close]").focus(); // safe default: Cancel
}
$("faq-delete-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("d-confirm");
  btn.disabled = true; btn.textContent = t("faqDelete.deleting");
  try {
    await api(`/api/staff/faq-items/${deleting.id}`, { method: "DELETE" });
    $("faq-delete").close();
    toast(t("faqDelete.done"));
    await loadFaq();
  } catch (err) {
    if (err.message === "auth") return authFailed();
    formError("d-error", isOffline(err) ? "modal.offline" : "modal.error");
  } finally {
    btn.disabled = false; btn.textContent = t("faqDelete.confirm");
  }
});

/* ---------- Auth ---------- */
$("staff-name").value = staffName();
$("auth").addEventListener("submit", (e) => {
  e.preventDefault();
  $("auth-error").hidden = true;
  const btn = $("auth").querySelector("button");
  btn.disabled = true; btn.textContent = t("dash.signingIn");
  store.set("staffName", val("staff-name"));
  setToken($("token").value);
  $("token").value = "";
  route();
});
$("logout").addEventListener("click", () => { setToken(""); route(); });

window.addEventListener("hashchange", route);
document.addEventListener("langchange", () => {
  if (token()) route(); else show(currentView());
  if (openCaseId) openCase(openCaseId);
});
I18N.apply();
route();
