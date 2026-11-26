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
    "dash.sessionEnded": "انتهت جلستك. سجّل الدخول مرة أخرى.",
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
    "login.email": "البريد الإلكتروني",
    "login.password": "كلمة المرور",
    "login.help": "نسيت كلمة المرور؟ اطلب من مدير النظام تعيين كلمة مؤقتة.",
    "login.tokenToggle": "الدخول برمز الفريق (للإدارة)",
    "login.tokenSubmit": "دخول بالرمز",
    "login.bad": "البريد أو كلمة المرور غير صحيحة.",
    "login.need": "اكتب بريدك وكلمة المرور.",
    "login.tooMany": "محاولات كثيرة. حاول بعد {time}.",
    "login.viaToken": "دخول برمز الفريق",
    "role.admin": "مدير",
    "role.staff": "موظف",
    "pw.change": "تغيير كلمة المرور",
    "pw.title": "تغيير كلمة المرور",
    "pw.required": "كلمة المرور الحالية مؤقتة. اختر كلمة جديدة لتكمل.",
    "pw.optional": "اختر كلمة مرور جديدة. ستخرج الأجهزة الأخرى من حسابك.",
    "pw.current": "كلمة المرور الحالية",
    "pw.new": "كلمة المرور الجديدة",
    "pw.confirm": "تأكيد كلمة المرور الجديدة",
    "pw.rule": "10 أحرف على الأقل، وتجمع بين الحروف والأرقام أو الرموز.",
    "pw.save": "حفظ كلمة المرور",
    "pw.saved": "تم تغيير كلمة المرور.",
    "pw.mismatch": "كلمتا المرور غير متطابقتين.",
    "pw.e.wrong_password": "كلمة المرور الحالية غير صحيحة.",
    "pw.e.too_short": "كلمة المرور قصيرة: 10 أحرف على الأقل.",
    "pw.e.too_simple": "اجمع بين الحروف والأرقام أو الرموز.",
    "pw.e.same_password": "اختر كلمة مختلفة عن الحالية.",
    "pw.e.failed": "تعذّر حفظ كلمة المرور. حاول مرة أخرى.",
    "int.nav": "التكاملات",
    "int.title": "التكاملات",
    "int.sub": "ما يعمل فعليًا وما يزال تجريبيًا. كل بند تجريبي يتحول إلى فعلي بإضافة الإعدادات المذكورة في Replit Secrets، دون تعديل الكود.",
    "int.summary": "{live} فعلي · {demo} تجريبي · {missing} ناقص",
    "int.needs": "الإعدادات المطلوبة",
    "int.state.live": "فعلي",
    "int.state.demo": "تجريبي",
    "int.state.off": "متوقف",
    "int.state.missing": "ناقص",
    "int.ai_agent": "المساعد الذكي",
    "int.ai_agent.llm": "يجيب بالذكاء الاصطناعي ({model}) من المحتوى المعتمد.",
    "int.ai_agent.rules": "يعمل بالوكيل الاحتياطي المبني على قواعد. أضف مفتاح OpenAI لتفعيل الذكاء الاصطناعي.",
    "int.memberships": "بيانات العضويات",
    "int.memberships.live": "مربوطة مباشرة بواجهة العضويات العامة في موقع الجمعية.",
    "int.memberships.cache": "آخر نسخة محفوظة، لأن واجهة الجمعية لم ترد مؤخرًا.",
    "int.memberships.fixture": "نسخة مرفقة بالمشروع، لأن واجهة الجمعية لا ترد.",
    "int.memberships.not_loaded": "لم تُحمّل بعد.",
    "int.member_registry": "سجل الأعضاء",
    "int.member_registry.demo": "أعضاء تجريبيون من ملف المشروع. اربطه بواجهة سجل الأعضاء لدى الجمعية.",
    "int.member_registry.file": "ملف أعضاء من الجمعية (MEMBERS_FILE).",
    "int.member_registry.api": "واجهة سجل الأعضاء لدى الجمعية.",
    "int.case_sync": "إرسال الطلبات لنظام الجمعية",
    "int.case_sync.demo": "تُحفظ الطلبات في صندوق تجريبي يقرؤه الموظف من تفاصيل الحالة، ولا يُرسل شيء.",
    "int.case_sync.webhook": "تُرسل الطلبات والردود موقّعة إلى رابط نظام الجمعية (webhook).",
    "int.case_sync.email": "تُرسل الطلبات والردود بالبريد إلى صندوق فريق الجمعية.",
    "int.case_sync.off": "متوقف: الطلبات في هذا التطبيق فقط.",
    "int.email": "البريد الإلكتروني",
    "int.email.smtp": "رموز التحقق والإشعارات تُرسل بالبريد فعليًا.",
    "int.email.simulated": "رموز التحقق محاكاة، والإشعارات في الصندوق التجريبي.",
    "int.whatsapp": "واتساب",
    "int.whatsapp.template": "مفعّل، مع قالب معتمد للإشعارات.",
    "int.whatsapp.no_template": "مفعّل، لكن بلا قالب معتمد: الإشعار يصل فقط لمن راسلكم خلال 24 ساعة.",
    "int.whatsapp.simulated": "غير مربوط: الرموز محاكاة والإشعارات في الصندوق التجريبي.",
    "int.notifications": "إشعارات الرد",
    "int.notifications.base_url": "الرابط في الرسالة يشير إلى العنوان العام المضبوط.",
    "int.notifications.no_base_url": "اضبط العنوان العام للتطبيق ليكون الرابط في الرسالة صحيحًا دائمًا.",
    "int.database": "قاعدة البيانات",
    "int.database.postgresql": "Postgres · نسخة الجداول {version}.",
    "int.database.sqlite": "SQLite محلية للتجربة · نسخة الجداول {version}. على Replit تُستخدم Postgres تلقائيًا.",
    "int.staff_accounts": "حسابات الفريق",
    "int.staff_accounts.token_on": "{admins} مدير نشط. رمز الفريق المشترك ما يزال يعمل كمفتاح إدارة.",
    "int.staff_accounts.token_off": "{admins} مدير نشط. رمز الفريق المشترك متوقف.",
    "int.secrets": "مفتاح التشفير",
    "int.secrets.set": "مضبوط.",
    "int.secrets.random_per_start": "يُولَّد عشوائيًا عند كل تشغيل، فتضيع رموز التحقق المعلقة عند إعادة التشغيل.",
    "sync.title": "نظام الجمعية",
    "sync.none": "لم يُرسل شيء لنظام الجمعية بعد.",
    "sync.off": "إرسال الطلبات لنظام الجمعية متوقف.",
    "sync.e.case.created": "طلب جديد",
    "sync.e.case.replied": "الرد",
    "sync.e.case.status": "تغيّر الحالة",
    "sync.t.webhook": "رابط النظام",
    "sync.t.email": "بريد الفريق",
    "sync.t.demo": "صندوق تجريبي",
    "sync.s.pending": "قيد الإرسال",
    "sync.s.sent": "أُرسل",
    "sync.s.simulated": "تجريبي: لم يُرسل فعليًا",
    "sync.s.failed": "تعذّر الإرسال",
    "sync.external": "رقمه في نظام الجمعية: {id}",
    "sync.payload": "البيانات المرسلة",
    "sync.resend": "إعادة الإرسال",
    "sync.resent": "أُعيد الإرسال لنظام الجمعية.",
    "sync.resendError": "تعذّر إعادة الإرسال. حاول مرة أخرى.",
    "action.case.sync": "أعاد الإرسال لنظام الجمعية",
    "team.nav": "الفريق",
    "team.title": "حسابات الفريق",
    "team.sub": "لكل موظف حساب باسمه، فيظهر اسمه في السجل وفي «تم الرد بواسطة». المدير وحده يضيف الحسابات ويعدّلها.",
    "team.tempHelp": "سلّمها للموظف بطريقة آمنة؛ سيُطلب منه تغييرها عند أول دخول.",
    "team.add": "إضافة حساب",
    "team.name": "الاسم",
    "team.role": "الصلاحية",
    "team.status": "الحالة",
    "team.lastLogin": "آخر دخول",
    "team.temp": "كلمة مرور مؤقتة",
    "team.generate": "توليد",
    "team.create": "إضافة الحساب",
    "team.created": "أُضيف الحساب. سلّم كلمة المرور المؤقتة للموظف.",
    "team.active": "نشط",
    "team.inactive": "موقوف",
    "team.mustChange": "بانتظار تغيير كلمة المرور",
    "team.never": "لم يدخل بعد",
    "team.you": "أنت",
    "team.makeAdmin": "اجعله مديرًا",
    "team.makeStaff": "اجعله موظفًا",
    "team.deactivate": "إيقاف",
    "team.activate": "تفعيل",
    "team.reset": "كلمة مؤقتة",
    "team.resetDone": "كلمة المرور المؤقتة لـ {name}:",
    "team.copy": "نسخ",
    "team.copied": "نُسخت.",
    "team.saved": "حُفظ التعديل.",
    "team.empty": "لا توجد حسابات بعد. أضف أول حساب من النموذج أعلاه.",
    "team.need": "اكتب الاسم والبريد وكلمة المرور المؤقتة.",
    "team.e.email_taken": "يوجد حساب بهذا البريد.",
    "team.e.invalid_email": "البريد غير صحيح.",
    "team.e.last_admin": "لا يمكن إيقاف آخر مدير أو تحويله إلى موظف.",
    "team.e.cannot_deactivate_self": "لا يمكنك إيقاف حسابك.",
    "team.e.failed": "تعذّر الحفظ. حاول مرة أخرى.",
    "action.staff.login": "سجّل الدخول",
    "action.staff.password": "غيّر كلمة المرور",
    "action.staff.create": "أضاف حسابًا",
    "action.staff.update": "عدّل حسابًا",
    "action.staff.reset_password": "عيّن كلمة مؤقتة",
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
    "dash.sessionEnded": "Your session ended. Please sign in again.",
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
    "login.email": "Email",
    "login.password": "Password",
    "login.help": "Forgot your password? Ask an admin to set a temporary one.",
    "login.tokenToggle": "Sign in with the team token (admins)",
    "login.tokenSubmit": "Sign in with token",
    "login.bad": "Incorrect email or password.",
    "login.need": "Enter your email and password.",
    "login.tooMany": "Too many attempts. Try again in {time}.",
    "login.viaToken": "Signed in with the team token",
    "role.admin": "Admin",
    "role.staff": "Staff",
    "pw.change": "Change password",
    "pw.title": "Change password",
    "pw.required": "Your current password is temporary. Choose a new one to continue.",
    "pw.optional": "Choose a new password. Your other devices will be signed out.",
    "pw.current": "Current password",
    "pw.new": "New password",
    "pw.confirm": "Confirm new password",
    "pw.rule": "At least 10 characters, mixing letters with digits or symbols.",
    "pw.save": "Save password",
    "pw.saved": "Password changed.",
    "pw.mismatch": "The passwords don't match.",
    "pw.e.wrong_password": "The current password is incorrect.",
    "pw.e.too_short": "Too short: at least 10 characters.",
    "pw.e.too_simple": "Mix letters with digits or symbols.",
    "pw.e.same_password": "Choose a password different from the current one.",
    "pw.e.failed": "Couldn't save the password. Please try again.",
    "int.nav": "Integrations",
    "int.title": "Integrations",
    "int.sub": "What is live and what is still demo. Each demo item goes live by adding the listed settings in Replit Secrets, with no code change.",
    "int.summary": "{live} live · {demo} demo · {missing} missing",
    "int.needs": "Settings needed",
    "int.state.live": "Live",
    "int.state.demo": "Demo",
    "int.state.off": "Off",
    "int.state.missing": "Missing",
    "int.ai_agent": "AI assistant",
    "int.ai_agent.llm": "Answers with AI ({model}) from approved content.",
    "int.ai_agent.rules": "Runs on the rule-based fallback. Add an OpenAI key to turn on AI.",
    "int.memberships": "Membership data",
    "int.memberships.live": "Connected to the association's public memberships API.",
    "int.memberships.cache": "Last saved copy; the association's API didn't answer recently.",
    "int.memberships.fixture": "Bundled copy; the association's API doesn't answer.",
    "int.memberships.not_loaded": "Not loaded yet.",
    "int.member_registry": "Member registry",
    "int.member_registry.demo": "Demo members from the project file. Connect it to the association's registry API.",
    "int.member_registry.file": "A member file from the association (MEMBERS_FILE).",
    "int.member_registry.api": "The association's member registry API.",
    "int.case_sync": "Requests to the association's system",
    "int.case_sync.demo": "Requests are kept in a demo outbox staff can read in the case details; nothing is sent.",
    "int.case_sync.webhook": "Requests and replies are sent, signed, to the association's system (webhook).",
    "int.case_sync.email": "Requests and replies are emailed to the association team's inbox.",
    "int.case_sync.off": "Off: requests stay in this app only.",
    "int.email": "Email",
    "int.email.smtp": "Verification codes and notifications are really emailed.",
    "int.email.simulated": "Verification codes are simulated; notifications go to the demo outbox.",
    "int.whatsapp": "WhatsApp",
    "int.whatsapp.template": "On, with an approved notification template.",
    "int.whatsapp.no_template": "On, but without an approved template: notifications reach only people who messaged you in the last 24 hours.",
    "int.whatsapp.simulated": "Not connected: codes are simulated and notifications go to the demo outbox.",
    "int.notifications": "Reply notifications",
    "int.notifications.base_url": "The link in the message uses the configured public address.",
    "int.notifications.no_base_url": "Set the app's public address so the link in the message is always right.",
    "int.database": "Database",
    "int.database.postgresql": "Postgres · schema version {version}.",
    "int.database.sqlite": "Local SQLite for testing · schema version {version}. Replit uses Postgres automatically.",
    "int.staff_accounts": "Team accounts",
    "int.staff_accounts.token_on": "{admins} active admin(s). The shared team token still works as an admin key.",
    "int.staff_accounts.token_off": "{admins} active admin(s). The shared team token is off.",
    "int.secrets": "Encryption key",
    "int.secrets.set": "Set.",
    "int.secrets.random_per_start": "Random at every start, so pending verification codes are lost on restart.",
    "sync.title": "Association system",
    "sync.none": "Nothing sent to the association's system yet.",
    "sync.off": "Sending requests to the association's system is off.",
    "sync.e.case.created": "New request",
    "sync.e.case.replied": "Reply",
    "sync.e.case.status": "Status change",
    "sync.t.webhook": "System link",
    "sync.t.email": "Team inbox",
    "sync.t.demo": "Demo outbox",
    "sync.s.pending": "Sending",
    "sync.s.sent": "Sent",
    "sync.s.simulated": "Demo: not actually sent",
    "sync.s.failed": "Failed",
    "sync.external": "Its id in the association's system: {id}",
    "sync.payload": "Data sent",
    "sync.resend": "Send again",
    "sync.resent": "Sent again to the association's system.",
    "sync.resendError": "Couldn't send it again. Please try again.",
    "action.case.sync": "Resent to the association's system",
    "team.nav": "Team",
    "team.title": "Team accounts",
    "team.sub": "Each staff member has their own account, so their name appears in the log and as the replier. Only admins add and edit accounts.",
    "team.tempHelp": "Give it to the staff member safely; they must change it at first sign-in.",
    "team.add": "Add an account",
    "team.name": "Name",
    "team.role": "Role",
    "team.status": "Status",
    "team.lastLogin": "Last sign-in",
    "team.temp": "Temporary password",
    "team.generate": "Generate",
    "team.create": "Add account",
    "team.created": "Account added. Give the temporary password to the staff member.",
    "team.active": "Active",
    "team.inactive": "Deactivated",
    "team.mustChange": "Must change password",
    "team.never": "Not signed in yet",
    "team.you": "You",
    "team.makeAdmin": "Make admin",
    "team.makeStaff": "Make staff",
    "team.deactivate": "Deactivate",
    "team.activate": "Activate",
    "team.reset": "Temporary password",
    "team.resetDone": "Temporary password for {name}:",
    "team.copy": "Copy",
    "team.copied": "Copied.",
    "team.saved": "Saved.",
    "team.empty": "No accounts yet. Add the first one with the form above.",
    "team.need": "Enter the name, email and temporary password.",
    "team.e.email_taken": "An account with this email already exists.",
    "team.e.invalid_email": "The email is not valid.",
    "team.e.last_admin": "The last admin can't be deactivated or made staff.",
    "team.e.cannot_deactivate_self": "You can't deactivate your own account.",
    "team.e.failed": "Couldn't save. Please try again.",
    "action.staff.login": "Signed in",
    "action.staff.password": "Changed password",
    "action.staff.create": "Added an account",
    "action.staff.update": "Edited an account",
    "action.staff.reset_password": "Set a temporary password",
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
const token = () => store.get("supportToken");          // shared team token (admin key)
const setToken = (v) => store.set("supportToken", v);
const staffName = () => store.get("staffName");
const sessionToken = () => store.get("staffSession");   // personal account session
const setSessionToken = (v) => store.set("staffSession", v);
const isAuthed = () => Boolean(sessionToken() || token());
let me = null;          // the signed-in staff member (GET /api/staff/me)
let pwOptional = false; // password panel opened from the sidebar (can be cancelled)

const isOffline = (err) => !navigator.onLine || err instanceof TypeError;
const staffHeaders = () => (sessionToken()
  ? { Authorization: `Bearer ${sessionToken()}` }
  : { "X-Support-Token": token(), "X-Staff-Name": encodeURIComponent(staffName()) });

async function api(path, options = {}) {
  if (!navigator.onLine) throw new TypeError("offline");
  const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...staffHeaders(), ...(options.headers || {}) } });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).detail; } catch { /* no body */ }
    if (detail === "password_change_required") throw new Error("pwchange");
    const err = new Error(String(res.status));
    err.detail = typeof detail === "string" ? detail : "";
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

function toast(text) {
  const el = $("toast");
  el.textContent = text; el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 3500);
}

function signOutLocal() { setToken(""); setSessionToken(""); me = null; pwOptional = false; }
function authFailed() { signOutLocal(); document.querySelectorAll("dialog[open]").forEach((d) => d.close()); show(currentView()); showAuthError(); }

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
const VIEWS = ["overview", "cases", "unanswered", "faq", "team", "integrations"];
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
  bar.hidden = !isAuthed() || needsPassword() || !PERIOD_VIEWS.includes(view);
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

const needsPassword = () => Boolean(me?.must_change_password) || pwOptional;
function show(view) {
  const authed = isAuthed();
  const pw = authed && needsPassword();
  $("login").hidden = authed;
  $("pw-panel").hidden = !pw;
  $("logout").hidden = !authed;
  if (!authed || pw) { $("alerts").hidden = true; $("period-bar").hidden = true; }
  VIEWS.forEach((v) => { $(`view-${v}`).hidden = !authed || pw || v !== view; });
  document.querySelectorAll("[data-view]").forEach((a) => {
    if (a.dataset.view === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-admin]").forEach((el) => { el.hidden = me?.role !== "admin"; });
  const name = me ? (me.name || staffName()) : "";
  $("side-name").textContent = authed && name ? name : t("dash.team");
  $("side-role").textContent = !authed || !me ? "" : me.via === "token" ? t("login.viaToken") : t(`role.${me.role}`);
  $("open-pw").hidden = !(authed && me?.via === "account") || pw;
  if (pw) {
    $("pw-why").textContent = t(me?.must_change_password ? "pw.required" : "pw.optional");
    $("pw-cancel").hidden = Boolean(me?.must_change_password);
    $("pw-user").value = me?.email || "";
  }
}

const STATE = { overview: ["overview-state", "overview-body"], unanswered: ["unanswered-state", "unanswered-table"],
                cases: ["cases-state", "cases-table"], faq: ["faq-state", "faq-table"], team: ["team-state", "team-table"],
                integrations: ["integrations-state", "integrations-list"] };
const LOADERS = { overview: () => Overview.load(periodQuery("overview")), unanswered: () => loadUnanswered(),
                  cases: () => loadCases(), faq: () => loadFaq(), team: () => loadTeam(),
                  integrations: () => loadIntegrations() };
async function route() {
  let view = currentView();
  if (!isAuthed()) { show(view); syncPeriodBar(view); $("login-email").focus(); return; }
  if (!me) {
    try { me = await api("/api/staff/me"); } catch (e) {
      if (e.message === "auth") return authFailed();
      show(view); $("overview-state").textContent = t(isOffline(e) ? "dash.offline" : "dash.loadError"); return;
    } finally { resetSignInButtons(); }
  }
  if ((view === "team" || view === "integrations") && me.role !== "admin") { location.replace("#overview"); return; }
  show(view);
  if (needsPassword()) { $("pw-current").focus(); return; }
  syncPeriodBar(view);
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
    if (e.message === "pwchange") { me = { ...me, must_change_password: true }; return route(); }
    $(stateId).textContent = t(isOffline(e) ? "dash.offline" : "dash.loadError"); $(stateId).hidden = false;
  } finally {
    resetSignInButtons();
  }
}

function resetSignInButtons() {
  const a = $("auth").querySelector("button"), b = $("auth-token").querySelector("button");
  a.disabled = false; a.textContent = t("dash.signIn");
  b.disabled = false; b.textContent = t("login.tokenSubmit");
}
// A session that ended (expired, signed out elsewhere, or a wrong token).
let lastSignIn = "account";  // which form was used last: account | token
function showAuthError() {
  if (lastSignIn === "token") { $("auth-token").closest("details").open = true; formError("auth-token-error", "dash.badToken"); }
  else formError("auth-error", "dash.sessionEnded");
}

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
function formError(id, key, vars) { $(id).textContent = t(key, vars); $(id).hidden = false; }

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
    const soft = (err) => { if (err.message === "auth") throw err; return null; };
    const [log, notes, sent] = await Promise.all([
      api(`/api/audit-log?target_id=${encodeURIComponent(id)}`),
      api(`/api/support-cases/${encodeURIComponent(id)}/notifications`).catch(soft),
      api(`/api/support-cases/${encodeURIComponent(id)}/syncs`).catch(soft),
    ]);
    caseNotes[id] = notes;
    caseSyncs[id] = sent;
    if (openCaseId === id) renderCase(casesById[id], log);
    // Sending runs right after the reply is saved: look again once if it is still going.
    if ([...(notes || []), ...(sent || [])].some((n) => n.status === "pending")) setTimeout(() => { if (openCaseId === id) openCase(id); }, 1500);
  } catch (err) {
    if (err.message === "auth") return authFailed();
    if (openCaseId === id) renderCase(casesById[id], "error");
  }
}

/* What was sent to the association's system for this case: webhook, team email, or demo outbox. */
const caseSyncs = {};
const SYNC_TAG = { sent: "badge-success", simulated: "tag-demo", failed: "badge-danger", pending: "req-new" };
function syncBlock(c) {
  const rows = caseSyncs[c.id];
  if (rows === undefined) return null;
  const head = h("h3", {}, t("sync.title"));
  if (!rows || !rows.length) return h("section", { class: "detail-block" }, head, h("p", { class: "muted" }, t(rows === null ? "detail.loadError" : "sync.none")));
  const pretty = (p) => { try { return JSON.stringify(JSON.parse(p), null, 2); } catch { return p; } };
  const items = rows.map((r) => h("li", { class: "notify-item" },
    h("div", { class: "notify-row" },
      h("span", { class: "notify-chan" }, ic(r.target === "webhook" ? "webhook" : r.target === "email" ? "mail" : "archive", "icon-sm"),
        t(`sync.e.${r.event}`), h("span", { class: "muted" }, `· ${t(`sync.t.${r.target}`)}`)),
      h("span", { class: `tag ${SYNC_TAG[r.status] || ""}` }, t(`sync.s.${r.status}`))),
    h("span", { class: "caption" }, relative(r.sent_at || r.created_at), r.attempts > 1 ? ` · ${t("notify.attempts", { n: r.attempts })}` : ""),
    r.external_id ? h("p", { class: "caption" }, t("sync.external", { id: r.external_id })) : null,
    r.status === "failed" ? h("p", { class: "caption notify-error" }, r.error) : null,
    h("details", { class: "translation" }, h("summary", {}, t("sync.payload")), h("pre", { class: "sync-payload", dir: "ltr" }, pretty(r.payload)))));
  const canResend = rows[0].status !== "pending";
  return h("section", { class: "detail-block" }, head, h("ol", { class: "notify-list" }, ...items),
    canResend ? h("button", { class: `btn btn-sm ${rows[0].status === "failed" ? "btn-primary" : "btn-secondary"}`, type: "button",
      onclick: (e) => resendSync(c.id, e.currentTarget) }, ic("send", "icon-sm"), t("sync.resend")) : null);
}

async function resendSync(id, btn) {
  btn.disabled = true;
  try {
    await api(`/api/support-cases/${encodeURIComponent(id)}/sync`, { method: "POST" });
    toast(t("sync.resent"));
    await openCase(id);
  } catch (err) {
    if (err.message === "auth") return authFailed();
    toast(t(isOffline(err) ? "dash.offline" : err.status === 409 ? "sync.off" : "sync.resendError"));
    btn.disabled = false;
  }
}

/* ---------- Integrations (admins): live vs demo, and the settings each item needs ---------- */
async function loadIntegrations() {
  const items = await api("/api/integrations");
  const count = (s) => items.filter((i) => i.state === s).length;
  $("integrations-summary").textContent = t("int.summary", { live: count("live"), demo: count("demo") + count("off"), missing: count("missing") });
  const ORDER = { missing: 0, demo: 1, off: 2, live: 3 };
  const STATE_TAG = { live: "badge-success", demo: "tag-demo", off: "req-status", missing: "badge-danger" };
  $("integrations-list").replaceChildren(...[...items].sort((a, b) => ORDER[a.state] - ORDER[b.state]).map((i) =>
    h("section", { class: `int-card int-${i.state}` },
      h("div", { class: "notify-row" }, h("h3", {}, t(`int.${i.key}`)), h("span", { class: `tag ${STATE_TAG[i.state]}` }, t(`int.state.${i.state}`))),
      h("p", { class: "int-detail" }, t(`int.${i.key}.${i.detail}`, { model: i.model || "", version: i.version || "—", admins: i.admins ?? 0 })),
      i.state === "live" ? null : h("div", { class: "int-needs" }, h("span", { class: "caption" }, t("int.needs")),
        h("div", { class: "int-keys", dir: "ltr" }, ...i.needs.map((n) => h("code", {}, n)))))));
  $("integrations-list").hidden = false;
  $("integrations-state").hidden = true;
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
    syncBlock(c),
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

/* ---------- Auth: personal account, or the shared team token (admin key) ---------- */
$("staff-name").value = staffName();
$("auth").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("auth-error").hidden = true;
  const email = val("login-email"), password = $("login-password").value;
  if (!email || !password) { formError("auth-error", "login.need"); return; }
  const btn = $("auth").querySelector("button");
  btn.disabled = true; btn.textContent = t("dash.signingIn");
  try {
    const res = await fetch("/api/staff/login", { method: "POST", headers: { "Content-Type": "application/json" },
                                                 body: JSON.stringify({ email, password }) });
    if (res.status === 429) {
      const wait = Number(res.headers.get("Retry-After")) || 60;
      formError("auth-error", "login.tooMany", { time: I18N.count(Math.ceil(wait / 60), "minute") }); return;
    }
    if (!res.ok) { formError("auth-error", res.status === 401 ? "login.bad" : "dash.loadError"); return; }
    const data = await res.json();
    setToken(""); setSessionToken(data.token); me = data.user; pwOptional = false; lastSignIn = "account";
    $("login-password").value = "";
    route();
  } catch (err) {
    formError("auth-error", isOffline(err) ? "dash.offline" : "dash.loadError");
  } finally {
    resetSignInButtons();
  }
});
$("auth-token").addEventListener("submit", (e) => {
  e.preventDefault();
  $("auth-token-error").hidden = true;
  const btn = $("auth-token").querySelector("button");
  btn.disabled = true; btn.textContent = t("dash.signingIn");
  store.set("staffName", val("staff-name"));
  lastSignIn = "token";
  setSessionToken(""); me = null;
  setToken($("token").value);
  $("token").value = "";
  route();
});
$("logout").addEventListener("click", () => {
  if (sessionToken()) fetch("/api/staff/logout", { method: "POST", headers: staffHeaders() }).catch(() => {});
  signOutLocal();
  route();
});

/* Change password: required after a temporary one, or chosen from the sidebar. */
$("open-pw").addEventListener("click", () => { pwOptional = true; route(); });
$("pw-cancel").addEventListener("click", () => { pwOptional = false; $("pw-form").reset(); route(); });
$("pw-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("pw-error").hidden = true;
  const current = $("pw-current").value, next = $("pw-new").value;
  if (!current || !next) { formError("pw-error", "pw.e.too_short"); return; }
  if (next !== $("pw-confirm").value) { formError("pw-error", "pw.mismatch"); $("pw-confirm").focus(); return; }
  const btn = $("pw-save");
  btn.disabled = true;
  try {
    me = { ...me, ...(await api("/api/staff/me/password", { method: "POST", body: JSON.stringify({ current_password: current, new_password: next }) })) };
    pwOptional = false;
    $("pw-form").reset();
    toast(t("pw.saved"));
    route();
  } catch (err) {
    if (err.message === "auth") return authFailed();
    const known = ["wrong_password", "too_short", "too_simple", "same_password"];
    formError("pw-error", isOffline(err) ? "dash.offline" : `pw.e.${known.includes(err.detail) ? err.detail : "failed"}`);
  } finally {
    btn.disabled = false;
  }
});

/* ---------- Team accounts (admins) ---------- */
let teamNotice = null;  // { name, password } after a reset, shown once above the table
function genPassword() {
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", num = "23456789";
  const pick = (set, n) => Array.from(crypto.getRandomValues(new Uint32Array(n)), (x) => set[x % set.length]).join("");
  return `${pick(abc, 4)}-${pick(num, 2)}${pick(abc, 2)}-${pick(abc + num, 4)}`;
}
async function loadTeam() {
  const users = await api("/api/staff/users");
  renderTeam(users);
}
function teamError(err) {
  const known = ["email_taken", "invalid_email", "last_admin", "cannot_deactivate_self"];
  if (["too_short", "too_simple"].includes(err.detail)) return `pw.e.${err.detail}`;
  return `team.e.${known.includes(err.detail) ? err.detail : "failed"}`;
}
async function teamAction(path, body, method = "PATCH") {
  try {
    const updated = await api(path, { method, body: JSON.stringify(body) });
    return updated;
  } catch (err) {
    if (err.message === "auth") { authFailed(); return null; }
    toast(t(isOffline(err) ? "dash.offline" : teamError(err)));
    return null;
  }
}
function renderTeam(users) {
  $("team-state").hidden = users.length > 0;
  $("team-state").textContent = t("team.empty");
  $("team-table").hidden = users.length === 0;
  const notice = teamNotice ? h("tr", { class: "team-notice-row" }, h("td", { colspan: "5", class: "q" },
    h("div", { class: "team-notice", role: "status" },
      h("span", {}, t("team.resetDone", { name: teamNotice.name })),
      h("code", { dir: "ltr" }, teamNotice.password),
      h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: () => {
        navigator.clipboard?.writeText(teamNotice.password).then(() => toast(t("team.copied")), () => {});
      } }, ic("copy", "icon-sm"), t("team.copy"))))) : null;
  $("team-rows").replaceChildren(...[notice, ...users.map((u) => {
    const self = me && u.id === me.id;
    return h("tr", { class: u.active ? "" : "row-muted" },
      h("td", { class: "q", "data-label": t("team.name") },
        h("span", { class: "tag-row" }, h("span", { dir: "auto" }, u.name), self ? h("span", { class: "tag" }, t("team.you")) : null),
        h("span", { class: "case-summary", dir: "ltr" }, u.email)),
      h("td", { "data-label": t("team.role") }, t(`role.${u.role}`)),
      h("td", { "data-label": t("team.status") }, h("span", { class: "tag-row" },
        h("span", { class: `tag ${u.active ? "badge-success" : "req-status"}` }, t(u.active ? "team.active" : "team.inactive")),
        u.must_change_password && u.active ? h("span", { class: "tag tag-demo" }, t("team.mustChange")) : null)),
      h("td", { "data-label": t("team.lastLogin") }, u.last_login_at ? relative(u.last_login_at) : h("span", { class: "muted" }, t("team.never"))),
      h("td", { class: "act" }, h("div", { class: "row-actions" },
        h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: async () => {
          if (await teamAction(`/api/staff/users/${u.id}`, { role: u.role === "admin" ? "staff" : "admin" })) { toast(t("team.saved")); loadTeam(); }
        } }, t(u.role === "admin" ? "team.makeStaff" : "team.makeAdmin")),
        h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: async () => {
          const password = genPassword();
          if (await teamAction(`/api/staff/users/${u.id}/password`, { password }, "POST")) { teamNotice = { name: u.name, password }; loadTeam(); }
        } }, ic("key-round", "icon-sm"), t("team.reset")),
        self ? null : h("button", { class: `btn btn-sm ${u.active ? "btn-danger-text" : "btn-secondary"}`, type: "button", onclick: async () => {
          if (await teamAction(`/api/staff/users/${u.id}`, { active: !u.active })) { toast(t("team.saved")); loadTeam(); }
        } }, t(u.active ? "team.deactivate" : "team.activate")))));
  })].filter(Boolean));
  I18N.icons();
}
$("tm-generate").addEventListener("click", () => { $("tm-password").value = genPassword(); });
$("team-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("tm-error").hidden = true;
  const body = { name: val("tm-name"), email: val("tm-email"), role: $("tm-role").value, password: $("tm-password").value };
  if (!body.name || !body.email || !body.password) { formError("tm-error", "team.need"); return; }
  const btn = $("tm-save");
  btn.disabled = true;
  try {
    await api("/api/staff/users", { method: "POST", body: JSON.stringify(body) });
    teamNotice = { name: body.name, password: body.password };
    $("team-form").reset();
    toast(t("team.created"));
    await loadTeam();
  } catch (err) {
    if (err.message === "auth") return authFailed();
    formError("tm-error", isOffline(err) ? "dash.offline" : teamError(err));
  } finally {
    btn.disabled = false;
  }
});
window.addEventListener("hashchange", route);
document.addEventListener("langchange", () => {
  if (isAuthed()) route(); else show(currentView());
  if (openCaseId) openCase(openCaseId);
});
I18N.apply();
route();
