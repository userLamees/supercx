/* SuperCX chat (v2): start screen, recommendation questions, tier card, escalation with
   consent, confirmation, simulated phone verification and membership status. */
const { t, icon } = I18N;

I18N.add({
  ar: {
    "page.title": "SuperCX | مساعد جمعية تجربة العميل",
    "chat.new": "محادثة جديدة",
    "hero.title": "أهلًا، أنا {assistant}",
    "hero.sub": "مساعدك في جمعية تجربة العميل",
    "hero.start": "ابدأ بسؤال",
    "start.fit": "أي عضوية تناسبني؟",
    "start.compare": "قارن بين العضويات",
    "start.events": "الفعاليات القادمة",
    "start.status": "حالة عضويتي",
    "start.eventsQ": "ما الفعاليات القادمة للجمعية؟",
    "followups": "اقتراحات",
    "followup.contact": "تواصل مع الفريق",
    "nav.chat": "المحادثة",
    "nav.faq": "الأسئلة الشائعة",
    "nav.main": "التنقل الرئيسي",
    "req.contact": "تفضّل التواصل مع الفريق مباشرة؟",
    "composer.note": "{assistant} يجيب من المحتوى المعتمد للجمعية فقط، وما لا يعرفه يحوّله للفريق.",
    "typing": "{assistant} يكتب...",
    "hero.privacy": "لا نطلب بياناتك الشخصية إلا بموافقتك",
    "hero.status": "حالة عضويتي",
    "hero.faq": "الأسئلة الشائعة",
    "hero.contact": "تواصل مع الفريق",
    "cat.inquiry": "استفسار",
    "cat.complaint": "شكوى",
    "cat.suggestion": "مقترح",
    "cat.service": "طلب خدمة",
    "consent.type": "نوع الطلب",
    "contact.title": "تواصل مع فريق الجمعية",
    "contact.sub": "اكتب استفسارك أو شكواك أو مقترحك، ويصل مباشرة إلى فريق الجمعية.",
    "contact.type": "نوع الطلب",
    "contact.message": "رسالتك",
    "contact.messagePh": "اكتب رسالتك هنا…",
    "contact.messageHelp": "لا تكتب بيانات شخصية في الرسالة؛ نحذف أي رقم أو بريد قبل حفظها.",
    "contact.consent": "أوافق على إرسال رسالتي إلى فريق الجمعية",
    "contact.needMessage": "اكتب رسالتك (10 أحرف على الأقل).",
    "contact.needConsent": "يلزم الموافقة على إرسال الرسالة.",
    "composer.ph": "اكتب سؤالك…",
    "composer.phQuiz": "أو اكتب احتياجك بأسلوبك…",
    "composer.aria": "رسالتك",
    "composer.send": "إرسال",
    "voice.record": "تسجيل سؤالك بالصوت",
    "voice.stop": "إيقاف التسجيل",
    "voice.listen": "استمع",
    "voice.stopListen": "إيقاف",
    "voice.transcribing": "جارٍ تحويل الصوت إلى نص…",
    "voice.listening": "أستمع إليك… {time} · اضغط ■ عند الانتهاء",
    "voice.unclear": "لم أتمكن من فهم التسجيل. تحدّث بوضوح بعد ظهور «أستمع إليك» ثم حاول مرة أخرى.",
    "voice.check": "راجع النص ثم اضغط إرسال",
    "voice.failed": "تعذّر تحويل الصوت. حاول مرة أخرى أو اكتب سؤالك.",
    "voice.denied": "لم يُسمح باستخدام الميكروفون. فعّله من إعدادات المتصفح.",
    "voice.playFailed": "تعذّر تشغيل الصوت.",
    "sugg.fit": "أي عضوية تناسبني؟",
    "sugg.diff": "ما الفرق بين العضويات؟",
    "sugg.vote": "أي عضوية تمنحني حق التصويت؟",
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

    "tier.popular": "الأكثر شعبية",
    "tier.best": "الأنسب لك",
    "tier.get": "احصل على العضوية",
    "tier.cardsIntro": "هذه عضويات الجمعية المتاحة:",
    "tier.cardsAria": "بطاقات العضويات",
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
    "state.request": "تحويل لفريق الجمعية",
    "state.sending": "جارٍ الإرسال",
    "state.sendingBody": "نرسل طلبك إلى فريق الدعم، لحظات من فضلك.",
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
    "consent.needContact": "أدخل بريدًا إلكترونيًا صحيحًا أو رقم جوال سعوديًا (05XXXXXXXX)، أو ألغِ الموافقة على التواصل.",
    "consent.sending": "جارٍ الإرسال…",
    "consent.declined": "لن نرسل شيئًا. يمكنك متابعة أسئلتك هنا.",


    "statusPrompt": "لعرض حالة عضويتك أحتاج أولًا إلى التحقق من رقم جوالك.",
    "statusPrompt.btn": "التحقق من الجوال",

    "verify.title": "التحقق من الجوال",
    "verify.sub": "لعرض بيانات عضويتك نحتاج التحقق من رقم جوالك",
    "verify.demoHint": "محاكاة: لا تُرسل رسائل فعلية. جرّب الجوال 500000001 أو 500000002، أو البريد ambassador@example.com، وأي رمز من 4 أرقام.",
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
    "verify.registryDown": "تحققنا من رمزك، لكن سجل الأعضاء لا يرد الآن. حاول بعد قليل.",
    "status.sourceLive": "المصدر: سجل أعضاء الجمعية",
    "verify.offline": "لا يوجد اتصال. تحقق من الإنترنت ثم أعد المحاولة.",
    "verify.cell": "الخانة {n}",
    "verify.subEmail": "لعرض بيانات عضويتك نحتاج التحقق من بريدك الإلكتروني",
    "verify.titleEmail": "التحقق من البريد الإلكتروني",
    "verify.channel": "استلام الرمز عبر",
    "verify.viaWhatsapp": "واتساب",
    "verify.viaEmail": "البريد الإلكتروني",
    "verify.email": "البريد الإلكتروني",
    "verify.codeHelpEmail": "أدخل الرمز المكوّن من 4 أرقام المرسل إلى بريدك",
    "verify.badEmail": "أدخل بريدًا إلكترونيًا صحيحًا.",
    "verify.codeSentDemo": "محاكاة: لم تُرسل رسالة فعلية إلى \u2066{to}\u2069. أدخل أي 4 أرقام.",
    "verify.codeSentEmail": "أرسلنا رمزًا إلى \u2066{to}\u2069. صالح لمدة 5 دقائق. تحقق من مجلد الرسائل غير المرغوب فيها إن لم يصلك.",
    "verify.codeSentWhatsapp": "أرسلنا رمزًا عبر واتساب إلى \u2066{to}\u2069. صالح لمدة 5 دقائق.",
    "verify.resendIn": "إعادة الإرسال بعد {s} ث",
    "verify.cooldown": "انتظر {s} قبل طلب رمز جديد.",
    "verify.rateLimited": "طلبت رموزًا كثيرة. حاول مرة أخرى بعد {m}.",
    "verify.deliveryEmail": "تعذّر إرسال البريد الآن. تحقق من العنوان أو حاول لاحقًا.",
    "verify.deliveryWhatsapp": "تعذّر إرسال رسالة واتساب الآن. حاول لاحقًا أو استخدم البريد الإلكتروني.",
    "verify.wrongCode": "الرمز غير صحيح. بقي لك {n}.",
    "verify.expired": "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.",
    "verify.tooMany": "تجاوزت عدد المحاولات. اطلب رمزًا جديدًا.",
    "verify.noCode": "لا يوجد رمز نشط. اطلب رمزًا جديدًا.",

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
    "hero.title": "Hi, I'm {assistant}",
    "hero.sub": "Your assistant at the Customer Experience Association",
    "hero.start": "Start with a question",
    "start.fit": "Which membership suits me?",
    "start.compare": "Compare the memberships",
    "start.events": "Upcoming events",
    "start.status": "My membership status",
    "start.eventsQ": "What are the association's upcoming events?",
    "followups": "Suggestions",
    "followup.contact": "Contact the team",
    "nav.chat": "Chat",
    "nav.faq": "FAQ",
    "nav.main": "Main navigation",
    "req.contact": "Prefer to contact the team directly?",
    "composer.note": "{assistant} answers only from the association's approved content, and passes anything it doesn't know to the team.",
    "typing": "{assistant} is typing...",
    "hero.privacy": "We never ask for personal details without your consent",
    "hero.status": "My membership status",
    "hero.faq": "FAQ",
    "hero.contact": "Contact the team",
    "cat.inquiry": "Inquiry",
    "cat.complaint": "Complaint",
    "cat.suggestion": "Suggestion",
    "cat.service": "Service request",
    "consent.type": "Request type",
    "contact.title": "Contact the association team",
    "contact.sub": "Write your inquiry, complaint or suggestion and it goes straight to the association team.",
    "contact.type": "Request type",
    "contact.message": "Your message",
    "contact.messagePh": "Write your message here…",
    "contact.messageHelp": "Don't include personal details in the message; any number or email is removed before saving.",
    "contact.consent": "I agree to send my message to the association team",
    "contact.needMessage": "Write your message (at least 10 characters).",
    "contact.needConsent": "Please agree to send the message.",
    "composer.ph": "Type your question…",
    "composer.phQuiz": "Or describe what you need…",
    "composer.aria": "Your message",
    "composer.send": "Send",
    "voice.record": "Ask by voice",
    "voice.stop": "Stop recording",
    "voice.listen": "Listen",
    "voice.stopListen": "Stop",
    "voice.transcribing": "Turning your voice into text…",
    "voice.listening": "Listening… {time} · press ■ when done",
    "voice.unclear": "I couldn't understand the recording. Speak clearly once \u201cListening\u201d appears, then try again.",
    "voice.check": "Check the text, then press send",
    "voice.failed": "Couldn't transcribe the recording. Try again or type your question.",
    "voice.denied": "Microphone access was blocked. Allow it in your browser settings.",
    "voice.playFailed": "Couldn't play the audio.",
    "sugg.fit": "Which membership suits me?",
    "sugg.diff": "What's the difference between the memberships?",
    "sugg.vote": "Which membership lets me vote?",
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
    "tier.best": "Best for you",
    "tier.get": "Get the membership",
    "tier.cardsIntro": "These are the association's memberships:",
    "tier.cardsAria": "Membership cards",
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
    "state.request": "Handed to the association's team",
    "state.sending": "Sending",
    "state.sendingBody": "Sending your request to the support team, one moment please.",
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
    "consent.needContact": "Enter a valid email or a Saudi mobile number (05XXXXXXXX), or untick the contact consent.",
    "consent.sending": "Sending…",
    "consent.declined": "Nothing was sent. You can keep asking here.",


    "statusPrompt": "To show your membership status I first need to verify your mobile number.",
    "statusPrompt.btn": "Verify mobile number",

    "verify.title": "Mobile verification",
    "verify.sub": "To show your membership details we need to verify your mobile number",
    "verify.demoHint": "Simulation: no real messages are sent. Try mobile 500000001 or 500000002, or ambassador@example.com, with any 4-digit code.",
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
    "verify.registryDown": "Your code was verified, but the member registry isn't answering right now. Please try again shortly.",
    "status.sourceLive": "Source: the association's member registry",
    "verify.offline": "No connection. Check your internet and try again.",
    "verify.cell": "Digit {n}",
    "verify.subEmail": "To show your membership details we need to verify your email",
    "verify.titleEmail": "Email verification",
    "verify.channel": "Receive the code by",
    "verify.viaWhatsapp": "WhatsApp",
    "verify.viaEmail": "Email",
    "verify.email": "Email",
    "verify.codeHelpEmail": "Enter the 4-digit code sent to your email",
    "verify.badEmail": "Enter a valid email address.",
    "verify.codeSentDemo": "Simulation: no message was sent to \u2066{to}\u2069. Enter any 4 digits.",
    "verify.codeSentEmail": "We sent a code to \u2066{to}\u2069. It is valid for 5 minutes. Check your spam folder if it doesn't arrive.",
    "verify.codeSentWhatsapp": "We sent a code on WhatsApp to \u2066{to}\u2069. It is valid for 5 minutes.",
    "verify.resendIn": "Resend in {s}s",
    "verify.cooldown": "Wait {s} before requesting a new code.",
    "verify.rateLimited": "Too many codes requested. Try again in {m}.",
    "verify.deliveryEmail": "Couldn't send the email right now. Check the address or try later.",
    "verify.deliveryWhatsapp": "Couldn't send the WhatsApp message right now. Try later or use email.",
    "verify.wrongCode": "Incorrect code. {n} left.",
    "verify.expired": "The code has expired. Request a new one.",
    "verify.tooMany": "Too many attempts. Request a new code.",
    "verify.noCode": "No active code. Request a new one.",

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
const startGrid = document.getElementById("start-grid");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

let history = [];
let tiersById = {};
let busy = false;
let quizActive = false;
let lastRecommended = null;  // keeps "Best for you" on later comparisons in the same chat
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

// Smooth scrolling only when the visitor hasn't asked for reduced motion.
const scrollBehavior = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

function add(el) {
  log.appendChild(el);
  I18N.icons();
  requestAnimationFrame(() => el.scrollIntoView({ block: "nearest", behavior: scrollBehavior() }));
  return el;
}

function setBusy(on) { busy = on; sendBtn.disabled = on; micBtn.disabled = on && !recorder; }

function setPlaceholder() { input.placeholder = t(quizActive ? "composer.phQuiz" : "composer.ph"); }

/* Same rules as app/redact.py: emails and phone numbers are removed. */
function redact(text) {
  return text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]")
    .replace(/(?:\+|00)?[\d٠-٩][\d٠-٩\s-]{6,}[\d٠-٩]/g, "[phone]")
    .replace(/\s+/g, " ").trim();
}

/* ---------- Start screen ---------- */
const START = [
  { key: "start.fit", icon: "sparkles", ask: "start.fit" },
  { key: "start.compare", icon: "scale", ask: "start.compare" },
  { key: "start.events", icon: "calendar-days", ask: "start.eventsQ" },
  { key: "start.status", icon: "badge-check", ask: "start.status" },
];
function renderStart() {
  startGrid.replaceChildren(...START.map((c) =>
    h("button", { class: "start-card", type: "button", onclick: () => send(t(c.ask)) },
      h("span", { class: "start-icon" }, ic(c.icon)), h("span", {}, t(c.key)))));
  I18N.icons();
}

/* Pill suggestions under the latest reply (only the newest reply keeps them). */
function followUps(question) {
  log.querySelectorAll(".followups").forEach((el) => el.remove());
  const q = (question || "").trim();
  const items = [["start.fit"], ["start.compare"], ["start.events", "start.eventsQ"]]
    .map(([label, ask]) => ({ label: t(label), ask: t(ask || label) }))
    .filter((it) => it.ask !== q && it.label !== q);
  const row = h("div", { class: "followups", role: "group", "aria-label": t("followups") },
    ...items.slice(0, 2).map((it) => h("button", { class: "pill", type: "button", onclick: () => send(it.ask) }, it.label)),
    h("a", { class: "pill", href: "#contact" }, t("followup.contact")));
  return add(row);
}

function hideStart() { hero.hidden = true; document.body.classList.add("chatting"); }

function resetChat() {
  history = []; quizActive = false; lastRecommended = null; setBusy(false);
  log.replaceChildren(hero);
  hero.hidden = false; document.body.classList.remove("chatting");
  if (location.hash && location.hash !== "#chat") location.hash = "#chat";
  input.value = ""; setPlaceholder(); input.focus();
}

/* ---------- Messages ---------- */
function userBubble(text) { return add(h("div", { class: "msg msg-user", dir: "auto" }, text)); }
function botText(text, lang) { return add(h("div", { class: "msg msg-bot", dir: lang ? dirOf(lang) : "auto" }, h("p", { class: "msg-text" }, text))); }

/* The assistant's avatar and name above its turn (user messages have neither). */
function agentMeta(l = I18N.lang) {
  return add(h("div", { class: "bot-meta", dir: dirOf(l) }, Brand.avatar("sm"), h("span", {}, I18N.assistantName(l))));
}
function typingRow() {
  return add(h("div", { class: "bot-meta", role: "status", "aria-live": "polite" }, Brand.avatar("sm"),
    h("span", { class: "typing" }, t("typing"), h("span", { class: "typing-dots", "aria-hidden": "true" }, h("i"), h("i"), h("i")))));
}

// "Listen" goes on the agent's replies only (not on interface notes like "nothing was sent"),
// placed last, after the sources line.
function addListen(msg, text, lang) {
  if (!voiceEnabled) return;
  msg.append(h("div", {}, listenButton(text, lang)));
  I18N.icons();
}

function sourcesLine(sources, lang, checkedAt) {
  const row = h("div", { class: "sources", dir: dirOf(lang) }, ic("link", "icon-sm"), t("src.label", null, lang));
  const membershipUrls = new Set(Object.values(tiersById).map((tier) => tier.source_url));
  sources.forEach((s, i) => {
    const title = membershipUrls.has(s.url) ? t("src.memberships", null, lang) : s.title;
    row.append(h("a", { href: s.url, target: "_blank", rel: "noopener", dir: "auto" }, title));
    if (i < sources.length - 1) row.append(lang === "ar" ? "، " : ", ");
  });
  if (checkedAt) row.append(" · ", t("src.checked", { date: I18N.formatDate(checkedAt, lang) }, lang));
  return row;
}

/* 09 Status messages. kind: info | warn | success | error */
function stateCard(kind, title, body, action, lang = I18N.lang) {
  const kindKey = { info: "progress", warn: "warn", success: "success", error: "error" }[kind];
  const act = typeof action === "function" ? { label: t("state.retry", null, lang), onClick: action } : action;
  const el = h("div", { class: "state", "data-kind": kind, role: kind === "error" ? "alert" : "status" },
    h("span", { class: "state-kind" }, t(`state.kind.${kindKey}`, null, lang)),
    h("span", { class: "state-title" }, title),
    body ? h("p", { class: "state-body", dir: "auto" }, body) : null,
    act ? h("button", { class: "btn btn-sm btn-secondary", type: "button", onclick: act.onClick }, act.label) : null);
  return el;
}

function isOffline(err) { return !navigator.onLine || err instanceof TypeError; }

/* ---------- Agent call ---------- */
async function askAgent(text) {
  userBubble(text);
  const searching = typingRow();
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
  const lang = reply.lang;  // language of the agent's own text
  const ui = I18N.lang;     // language of everything the interface adds around it
  agentMeta(ui);

  if (reply.action === "verify") {
    // Personal question: the agent never shows member data, it sends the user to verification.
    const msg = botText(reply.answer, lang);
    msg.append(h("div", {}, h("a", { class: "chip", href: "#verify" }, ic("badge-check", "icon-sm"), t("statusPrompt.btn"))));
    addListen(msg, reply.answer, lang);
    I18N.icons();
    return;
  }

  if (reply.action === "escalate") {
    if (reply.needs_contact) consentCard(question, reply, reply.answer);
    else add(stateCard("warn", t("state.noInfo"), reply.answer));
    return;
  }

  // Comparison cards: for a recommendation, a comparison question, or a reply naming 2+ tiers.
  const decision = Tiers.cardsFor(reply, question, Object.values(tiersById), lastRecommended);
  if (decision) {
    if (reply.action === "recommend") lastRecommended = reply.tier_id;
    // The cards carry prices and benefits, so list lines are dropped from the text above them.
    const text = reply.action === "recommend" ? reply.answer.split(/\n\s*\n/)[0]
      : reply.answer.split("\n").filter((l) => !/^\s*([•\-*]|\d+[.)])\s/.test(l)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
    const shown = text || t("tier.cardsIntro", null, lang);
    addListen(botText(shown, lang), shown, lang);
    const block = add(tierCards(decision, ui, reply.chat_event_id));
    // On a phone the cards scroll sideways: bring the recommended one into view.
    const rec = block.querySelector(".tier.is-recommended");
    const row = block.querySelector(".tier-cards");
    if (rec && row.scrollWidth > row.clientWidth) {
      // inline "center" works in both RTL and LTR scroll containers.
      setTimeout(() => rec.scrollIntoView({ inline: "center", block: "nearest", behavior: scrollBehavior() }), 50);
    }
    followUps(question);
    return;
  }

  const msg = botText(reply.answer, lang);
  if (reply.sources?.length) msg.append(sourcesLine(reply.sources, ui));
  addListen(msg, reply.answer, lang);
  followUps(question);
}

/* 03 Recommendation card (matched by tier_id, never by name) */
/* Counts "registration after a recommendation" on the staff overview. Only the event id is sent. */
function trackRegister(eventId) {
  if (!eventId) return;
  const url = `/api/chat-events/${encodeURIComponent(eventId)}/register`;
  try { if (navigator.sendBeacon && navigator.sendBeacon(url)) return; } catch { /* fall back to fetch */ }
  fetch(url, { method: "POST", keepalive: true }).catch(() => {});
}

/* 03 Membership cards, in the pattern of the cxa.sa membership cards. Data comes from the tiers
   API only (matched by tier_id); see static/tiers.js for which cards show and their badges. */
function tierCards(decision, lang, eventId) {
  const tones = Tiers.tones(Object.values(tiersById));
  const models = decision.ids.map((id) => Tiers.cardModel(tiersById[id], lang, decision));
  const cards = models.map((m) => {
    const unit = m.periodYears > 1 ? t("tier.perYears", { n: m.periodYears }, lang) : t("tier.perYear", null, lang);
    const badge = m.badge ? t(m.badge === "recommended" ? "tier.best" : "tier.popular", null, lang) : null;
    return h("article", { class: `tier${m.recommended ? " is-recommended" : ""}`, role: "listitem",
                          "aria-label": badge ? `${m.name} · ${badge}` : m.name },
      h("div", { class: "tier-top", "data-tone": tones[m.id] },
        badge ? h("span", { class: `tier-badge tier-badge-${m.badge}` }, badge) : null,
        h("h3", {}, m.name),
        h("div", { class: "tier-cost" }, h("strong", { class: "num-latin" }, I18N.formatNumber(m.price, lang)), h("span", {}, unit))),
      h("div", { class: "tier-body" },
        h("ul", { class: "benefits" }, ...m.features.map((f) => h("li", {}, ic("check"), h("span", {}, f)))),
        h("a", { class: `btn ${m.recommended ? "btn-primary" : "btn-secondary"}`, href: m.url, target: "_blank", rel: "noopener",
                 onclick: () => trackRegister(eventId) }, t("tier.get", null, lang))));
  });
  const first = tiersById[decision.ids[0]];
  const row = h("div", { class: "tier-cards", role: "list", "aria-label": t("tier.cardsAria", null, lang) }, ...cards);
  // Position dots (phones only, where the cards scroll sideways).
  const dots = h("div", { class: "tier-dots", "aria-hidden": "true" }, ...cards.map(() => h("span")));
  const mark = () => {
    const box = row.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    let best = 0, dist = Infinity;
    cards.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < dist) { dist = d; best = i; } });
    [...dots.children].forEach((d, i) => d.classList.toggle("on", i === best));
  };
  row.addEventListener("scroll", () => requestAnimationFrame(mark), { passive: true });
  requestAnimationFrame(mark);
  return h("div", { class: "tiers", dir: dirOf(lang) }, row, dots,
    sourcesLine([{ title: t("src.memberships", null, lang), url: first.source_url }], lang, first.checked_at),
    h("p", { class: "footnote" }, t("tier.pending", null, lang)));
}

/* Same rules as the server: an email address or a Saudi mobile number. */
function validContact(value) {
  const v = value.trim();
  if (/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)) return true;
  return /^(?:\+966|00966|966|0)?5\d{8}$/.test(toLatin(v).replace(/[\s-]/g, ""));
}

/* 04 Unpublished question. One card holds the notice, both consents and the send
   state; on success it collapses to a "sent" line and the confirmation opens as its own page. */
function consentCard(question, reply, notice) {
  const lang = reply.lang;  // sent to support as the question's language
  const ui = I18N.lang;
  const tl = (k, v) => t(k, v, ui);
  const summary = redact((reply.summary || question).replace(/^\[(ar|en)\]\s*/, ""));
  const uid = Math.random().toString(36).slice(2, 8);

  const consentSummary = h("input", { type: "checkbox", id: `cs-${uid}` });
  const consentContact = h("input", { type: "checkbox", id: `cc-${uid}` });
  const contactInput = h("input", { class: "input", id: `ci-${uid}`, type: "text", inputmode: "email", autocomplete: "email", maxlength: "200", dir: "auto", placeholder: tl("consent.contactPh"), "aria-describedby": `ce-${uid}` });
  const contactField = h("div", { class: "field", hidden: true },
    h("label", { class: "label", for: `ci-${uid}` }, tl("consent.contactLabel")), contactInput);
  // A question the assistant couldn't answer is filed as "unanswered" unless the visitor picks a request type.
  const types = reply.category ? ["inquiry", "complaint", "suggestion", "service"] : ["unanswered", "inquiry", "complaint", "suggestion", "service"];
  const categorySelect = h("select", { class: "select", id: `ct-${uid}` }, ...types.map((c) => new Option(tl(`cat.${c}`), c)));
  categorySelect.value = reply.category || "unanswered";  // the agent recognized a request, or not
  const error = h("p", { class: "form-error", id: `ce-${uid}`, role: "alert", hidden: true });
  const status = h("div", { class: "consent-status" });
  const sendButton = h("button", { class: "btn btn-primary btn-block", type: "submit" }, tl("consent.send"));
  const noButton = h("button", { class: "btn btn-text btn-block", type: "button" }, tl("consent.no"));

  consentContact.addEventListener("change", () => {
    contactField.hidden = !consentContact.checked;
    if (consentContact.checked) contactInput.focus();
    else { error.hidden = true; contactInput.removeAttribute("aria-invalid"); }
  });
  contactInput.addEventListener("input", () => { if (!error.hidden && validContact(contactInput.value)) { error.hidden = true; contactInput.removeAttribute("aria-invalid"); } });

  const wrap = h("form", { class: "escalation", dir: dirOf(ui), novalidate: true },
    h("div", { class: "card consent" },
      h("div", { class: "escalation-head" },
        h("span", { class: "state-kind" }, tl("state.kind.warn")),
        h("span", { class: "state-title" }, tl(reply.category ? "state.request" : "state.noInfo")),
        notice ? h("p", { class: "state-body", dir: "auto" }, notice) : null),
      h("hr", { class: "divider" }),
      h("div", { class: "field" }, h("label", { class: "label", for: `ct-${uid}` }, tl("consent.type")), categorySelect),
      h("label", { class: "check", for: `cs-${uid}` }, consentSummary, h("span", {}, tl("consent.summary"))),
      h("div", { class: "preview" }, h("span", { class: "caption" }, tl("consent.preview")), h("p", { dir: "auto" }, summary)),
      h("label", { class: "check", for: `cc-${uid}` }, consentContact, h("span", {}, tl("consent.contact"))),
      contactField),
    error, status, sendButton, noButton,
    h("p", { class: "alt-channel" }, ic("mail", "icon-sm"), tl("consent.alt"), " ",
      h("a", { href: `mailto:${CARE_EMAIL}`, dir: "ltr" }, CARE_EMAIL)));

  noButton.addEventListener("click", () => { wrap.replaceWith(botText(tl("consent.declined"), ui)); });

  const fail = (msg, focusEl) => { error.textContent = msg; error.hidden = false; focusEl.focus(); };
  wrap.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true; contactInput.removeAttribute("aria-invalid");
    if (!consentSummary.checked) return fail(tl("consent.needSummary"), consentSummary);
    const contact = consentContact.checked ? contactInput.value.trim() : "";
    if (consentContact.checked && !validContact(contact)) {
      contactInput.setAttribute("aria-invalid", "true");
      return fail(tl("consent.needContact"), contactInput);
    }

    sendButton.disabled = true; noButton.disabled = true;
    sendButton.textContent = tl("consent.sending");
    status.replaceChildren(stateCard("info", tl("state.sending"), tl("state.sendingBody"), null, ui));
    try {
      if (!navigator.onLine) throw new TypeError("offline");
      const body = { question: redact(question), language: lang, summary, tier_id: reply.tier_id || null,
                     category: categorySelect.value, chat_event_id: reply.chat_event_id || null };
      if (contact) body.contact = contact; else body.anonymous = true;
      const res = await fetch("/api/support-cases", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.status === 422 && contact) {
        status.replaceChildren();
        contactInput.setAttribute("aria-invalid", "true");
        fail(tl("consent.needContact"), contactInput);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json(); // success is shown only after the server confirms
      // The conversation stays open: the confirmation replaces the form in place.
      const saved = Requests.remember(data.reference, data.tracking_code);
      const card = Requests.confirmCard(data, ui, saved);
      wrap.replaceWith(card);
      I18N.icons();
      card.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
      Requests.updateDot();
    } catch (err) {
      const offline = isOffline(err);
      status.replaceChildren(stateCard("error", tl(offline ? "state.offline" : "state.failed"),
        tl(offline ? "state.offlineBody" : "state.failedBody"), () => wrap.requestSubmit(), ui));
    } finally {
      if (wrap.isConnected) {
        sendButton.disabled = false; noButton.disabled = false;
        sendButton.textContent = tl("consent.send");
      }
    }
  });
  add(wrap);
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
  agentMeta();
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
  consentCard(t("quiz.orgQuestion"), { lang, action: "escalate", needs_contact: true, summary: t("quiz.orgSummary"), tier_id: null },
              t("quiz.orgNoInfo"));
}

function statusPrompt(text) {
  userBubble(text);
  agentMeta();
  const msg = botText(t("statusPrompt"));
  msg.append(h("div", {}, h("a", { class: "chip", href: "#verify" }, ic("badge-check", "icon-sm"), t("statusPrompt.btn"))));
  I18N.icons();
}

/* ---------- Voice (speech-to-text and text-to-speech) ----------
   Shown only when the server has an OpenAI key (GET /api/speech) and the browser can record. */
const micBtn = document.getElementById("mic");
let voiceEnabled = false;
let recorder = null;
let recordTimer = null;
let clockTimer = null;
let player = null;
const MAX_RECORDING_MS = 60000;

async function initVoice() {
  try {
    voiceEnabled = (await (await fetch("/api/speech")).json()).enabled === true;
  } catch { voiceEnabled = false; }
  micBtn.hidden = !(voiceEnabled && window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
}

function setMicIcon(recording) {
  micBtn.classList.toggle("recording", recording);
  form.classList.toggle("recording", recording);
  micBtn.setAttribute("aria-label", t(recording ? "voice.stop" : "voice.record"));
  micBtn.replaceChildren(ic(recording ? "square" : "mic"));
  input.disabled = recording;
  clearInterval(clockTimer);
  if (recording) {
    // The box itself shows that the microphone is on, with a running timer.
    const started = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - started) / 1000);
      input.value = "";
      input.placeholder = t("voice.listening", { time: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` });
    };
    tick();
    clockTimer = setInterval(tick, 500);
  } else {
    setPlaceholder();
  }
  I18N.icons();
}

async function startRecording() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    add(stateCard("error", t("voice.denied")));
    return;
  }
  const chunks = [];
  let startedAt = 0;
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  recorder.onstop = async () => {
    clearTimeout(recordTimer);
    stream.getTracks().forEach((track) => track.stop());
    const type = (recorder.mimeType || "audio/webm").split(";")[0];
    recorder = null;
    setMicIcon(false);
    if (Date.now() - startedAt < 800) return;  // a tap, not a question: nothing to transcribe
    if (chunks.length) await transcribe(new Blob(chunks, { type }));
  };
  recorder.onstart = () => { startedAt = Date.now(); setMicIcon(true); };  // "Listening" appears only once audio is really captured
  recorder.start();
  recordTimer = setTimeout(() => recorder?.state === "recording" && recorder.stop(), MAX_RECORDING_MS);
}

async function transcribe(blob) {
  const working = add(stateCard("info", t("voice.transcribing")));
  setBusy(true);
  try {
    const res = await fetch("/api/speech/transcribe", {
      method: "POST", headers: { "Content-Type": blob.type }, body: blob,
    });
    if (res.status === 422) throw new Error("unclear");
    if (!res.ok) throw new Error(String(res.status));
    const { text } = await res.json();
    working.remove();
    setBusy(false);
    // The transcript goes into the box so the user can check or fix it before sending.
    input.value = text.trim();
    input.placeholder = t("voice.check");
    input.focus();
  } catch (err) {
    working.remove();
    setBusy(false);
    add(stateCard("error", t(err.message === "unclear" ? "voice.unclear" : "voice.failed")));
  }
}

micBtn.addEventListener("click", () => {
  if (recorder?.state === "recording") recorder.stop();
  else if (!busy) startRecording();
});

function listenButton(text, lang) {
  const label = h("span", {}, t("voice.listen", null, lang));
  const btn = h("button", { class: "listen-btn", type: "button" }, ic("volume-2", "icon-sm"), label);
  let audioUrl = null;  // generated once per reply, replayed from memory
  btn.addEventListener("click", async () => {
    if (player && btn.classList.contains("playing")) { player.pause(); return; }
    player?.pause();
    try {
      if (!audioUrl) {
        btn.disabled = true;
        const res = await fetch("/api/speech/synthesize", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.slice(0, 1500), lang }),
        });
        if (!res.ok) throw new Error(String(res.status));
        audioUrl = URL.createObjectURL(await res.blob());
      }
      player = new Audio(audioUrl);
      const done = () => { btn.classList.remove("playing"); label.textContent = t("voice.listen", null, lang); };
      player.onpause = done;
      player.onended = done;
      btn.classList.add("playing");
      label.textContent = t("voice.stopListen", null, lang);
      await player.play();
    } catch {
      add(stateCard("error", t("voice.playFailed")));
    } finally {
      btn.disabled = false;
    }
  });
  return btn;
}

/* ---------- Send ---------- */
function send(text) {
  if (busy || !text) return;
  hideStart();
  log.querySelectorAll(".followups").forEach((el) => el.remove());
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
const emailInput = document.getElementById("verify-email");
const phoneError = document.getElementById("phone-error");
const sendCodeBtn = document.getElementById("send-code");
const codeForm = document.getElementById("code-form");
const codeError = document.getElementById("code-error");
const codeSent = document.getElementById("code-sent");
const checkBtn = document.getElementById("check-code");
const cells = [...document.querySelectorAll("#otp input")];
let channels = { email: false, whatsapp: false, demo: true };
let pending = null;     // { channel, phone?, email?, display } while a code is outstanding
let cooldownTimer = null;

const toLatin = (s) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
function normalizePhone(raw) {
  let d = toLatin(raw).replace(/\D/g, "");
  for (const p of ["00966", "966", "0"]) if (d.startsWith(p) && d.length - p.length === 9) { d = d.slice(p.length); break; }
  return /^5\d{8}$/.test(d) ? d : null;
}
const normalizeEmail = (raw) => { const e = raw.trim().toLowerCase(); return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e) ? e : null; };
function showError(el, key, vars) { el.textContent = key ? t(key, vars) : ""; el.hidden = !key; }
function code() { return cells.map((c) => c.value).join(""); }
function updateCheck() { checkBtn.disabled = !pending || code().length !== 4; }
const selectedChannel = () => document.querySelector("input[name=channel]:checked")?.value || "whatsapp";

/* Which channels exist decides what the page offers. With no provider configured,
   the page says plainly that it is a simulation. */
async function loadChannels() {
  try { channels = await (await fetch("/api/verify/channels")).json(); } catch { /* keep the simulation default */ }
  const both = channels.demo || (channels.email && channels.whatsapp);
  document.getElementById("channel-switch").hidden = !both;
  if (!both) document.querySelector(`input[name=channel][value=${channels.email ? "email" : "whatsapp"}]`).checked = true;
  document.getElementById("verify-demo").hidden = !channels.demo;
  applyChannel();
}

function applyChannel() {
  const email = selectedChannel() === "email";
  document.getElementById("phone-group").hidden = email;
  document.getElementById("email-group").hidden = !email;
  document.getElementById("verify-title").textContent = t(email ? "verify.titleEmail" : "verify.title");
  document.getElementById("verify-sub").textContent = t(email ? "verify.subEmail" : "verify.sub");
  document.getElementById("code-help").textContent = t(email ? "verify.codeHelpEmail" : "verify.codeHelp");
}
document.querySelectorAll("input[name=channel]").forEach((r) => r.addEventListener("change", () => {
  resetCode(); showError(phoneError, null); applyChannel();
}));

function resetCode() {
  pending = null; clearInterval(cooldownTimer);
  cells.forEach((c) => { c.value = ""; c.disabled = true; });
  codeSent.hidden = true; showError(codeError, null);
  sendCodeBtn.disabled = false; sendCodeBtn.textContent = t("verify.send");
  updateCheck();
}

function startCooldown(seconds) {
  clearInterval(cooldownTimer);
  let left = seconds;
  const tick = () => {
    if (left <= 0) { clearInterval(cooldownTimer); sendCodeBtn.disabled = false; sendCodeBtn.textContent = t(pending ? "verify.resend" : "verify.send"); return; }
    sendCodeBtn.disabled = true; sendCodeBtn.textContent = t("verify.resendIn", { s: left }); left -= 1;
  };
  tick(); cooldownTimer = setInterval(tick, 1000);
}

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

async function readError(res) { try { return (await res.json()).detail || {}; } catch { return {}; } }

phoneForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError(phoneError, null);
  const channel = selectedChannel();
  const target = channel === "email" ? normalizeEmail(emailInput.value) : normalizePhone(phoneInput.value);
  if (!target) {
    showError(phoneError, channel === "email" ? "verify.badEmail" : "verify.badPhone");
    (channel === "email" ? emailInput : phoneInput).focus();
    return;
  }
  const label = pending ? "verify.resend" : "verify.send";
  sendCodeBtn.disabled = true; sendCodeBtn.textContent = t("verify.sending");
  const body = channel === "email" ? { channel, email: target, lang: I18N.lang } : { channel, phone: target, lang: I18N.lang };
  try {
    if (!navigator.onLine) throw new TypeError("offline");
    const res = await fetch("/api/verify/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 422) { showError(phoneError, channel === "email" ? "verify.badEmail" : "verify.badPhone"); sendCodeBtn.disabled = false; sendCodeBtn.textContent = t(label); return; }
    if (res.status === 429) {
      const d = await readError(res);
      showError(phoneError, d.code === "cooldown" ? "verify.cooldown" : "verify.rateLimited",
                { s: I18N.count(d.retry_after || 30, "second"), m: I18N.count(Math.ceil((d.retry_after || 60) / 60), "minute") });
      startCooldown(d.retry_after || 30);
      return;
    }
    if (res.status === 502) { showError(phoneError, channel === "email" ? "verify.deliveryEmail" : "verify.deliveryWhatsapp"); sendCodeBtn.disabled = false; sendCodeBtn.textContent = t(label); return; }
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    pending = { ...body, display: channel === "email" ? target : `+966 ${target}`, demo: data.demo };
    cells.forEach((c) => { c.disabled = false; c.value = ""; });
    codeSent.textContent = t(data.demo ? "verify.codeSentDemo" : channel === "email" ? "verify.codeSentEmail" : "verify.codeSentWhatsapp", { to: pending.display });
    codeSent.hidden = false;
    showError(codeError, null);
    updateCheck();
    cells[0].focus();
    if (data.demo) { sendCodeBtn.disabled = false; sendCodeBtn.textContent = t("verify.resend"); } else startCooldown(30);
  } catch (err) {
    showError(phoneError, isOffline(err) ? "verify.offline" : "verify.failed");
    sendCodeBtn.disabled = false; sendCodeBtn.textContent = t(label);
  }
});

const CHECK_ERRORS = { invalid_code: "verify.wrongCode", expired: "verify.expired", too_many_attempts: "verify.tooMany", no_code: "verify.noCode" };
codeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError(codeError, null);
  if (!pending || code().length !== 4) { showError(codeError, "verify.badCode"); return; }
  checkBtn.disabled = true;
  checkBtn.textContent = t("verify.checking");
  const { display, demo, ...body } = pending;
  try {
    if (!navigator.onLine) throw new TypeError("offline");
    const res = await fetch("/api/verify/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, code: code() }) });
    if (res.status === 422 || res.status === 429) {
      const d = await readError(res);
      const key = CHECK_ERRORS[d.code] || "verify.badCode";
      showError(codeError, key, { n: I18N.count(d.attempts_left ?? 0, "attempt") });
      cells.forEach((c) => { c.value = ""; });
      if (d.code === "expired" || d.code === "too_many_attempts" || d.code === "no_code") { cells.forEach((c) => { c.disabled = true; }); pending = null; }
      else cells[0].focus();
      return;
    }
    if (res.status === 503) { showError(codeError, "verify.registryDown"); return; }
    if (!res.ok) throw new Error(String(res.status));
    lastStatus = await res.json();
    // The number or email is not kept once verification is done.
    phoneInput.value = ""; emailInput.value = "";
    resetCode();
    location.hash = "#status";
  } catch (err) {
    showError(codeError, isOffline(err) ? "verify.offline" : "verify.failed");
  } finally {
    checkBtn.textContent = t("verify.check");
    updateCheck();
  }
});

/* ---------- Contact the team (idea 79) ---------- */
const contactForm = document.getElementById("contact-form");
const contactReply = document.getElementById("contact-reply");
const contactChannel = document.getElementById("contact-channel");
const contactError = document.getElementById("contact-error");
const contactStatus = document.getElementById("contact-status");
const contactSend = document.getElementById("contact-send");
contactReply.addEventListener("change", () => {
  document.getElementById("contact-reply-field").hidden = !contactReply.checked;
  if (contactReply.checked) contactChannel.focus();
});
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError(contactError, null);
  const message = document.getElementById("contact-message").value.trim();
  const consent = document.getElementById("contact-consent");
  if (message.length < 10) { showError(contactError, "contact.needMessage"); document.getElementById("contact-message").focus(); return; }
  if (!consent.checked) { showError(contactError, "contact.needConsent"); consent.focus(); return; }
  const contact = contactReply.checked ? contactChannel.value.trim() : "";
  if (contactReply.checked && !validContact(contact)) { showError(contactError, "consent.needContact"); contactChannel.focus(); return; }
  contactSend.disabled = true; contactSend.textContent = t("consent.sending");
  contactStatus.replaceChildren(stateCard("info", t("state.sending"), t("state.sendingBody")));
  try {
    if (!navigator.onLine) throw new TypeError("offline");
    const clean = redact(message);
    const body = { question: clean, summary: clean, language: detectLang(message), category: document.getElementById("contact-category").value };
    if (contact) body.contact = contact; else body.anonymous = true;
    const res = await fetch("/api/support-cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 422 && contact) { contactStatus.replaceChildren(); showError(contactError, "consent.needContact"); return; }
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    contactForm.reset(); contactStatus.replaceChildren();
    document.getElementById("contact-reply-field").hidden = true;
    // Back to the conversation, with the confirmation as its latest message.
    const saved = Requests.remember(data.reference, data.tracking_code);
    hideStart();
    add(Requests.confirmCard(data, I18N.lang, saved));
    Requests.updateDot();
    location.hash = "#chat";
  } catch (err) {
    const offline = isOffline(err);
    contactStatus.replaceChildren(stateCard("error", t(offline ? "state.offline" : "state.failed"),
      t(offline ? "state.offlineBody" : "state.failedBody"), () => contactForm.requestSubmit()));
  } finally {
    contactSend.disabled = false; contactSend.textContent = t("consent.send");
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
      h("p", { class: "demo-note" }, h("span", { class: "caption" }, t("status.altCaption")), s.demo === false ? null : h("span", { class: "tag" }, t("demoData"))),
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
    h("p", { class: "caption" }, t(s.demo === false ? "status.sourceLive" : "status.source"))));
}

/* ---------- Views (hash routing) ---------- */
const views = { chat: "view-chat", verify: "view-verify", status: "view-status", contact: "view-contact", requests: "view-requests" };
function route() {
  let name = location.hash.slice(1) || "chat";
  if (!views[name]) name = "chat";
  if (name === "status" && !lastStatus) { location.replace("#verify"); return; }
  for (const [key, id] of Object.entries(views)) document.getElementById(id).hidden = key !== name;
  if (name === "status") renderStatus();
  if (name === "requests") Requests.render();
  if (name === "chat") { // back to the conversation where it left off
    window.scrollTo(0, document.body.scrollHeight);
    input.focus({ preventScroll: true });
  } else window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* Laptop nav: the link of the current view is marked. */
function markNav() {
  const name = location.hash.slice(1) || "chat";
  document.querySelectorAll(".nav-links [data-nav]").forEach((a) => {
    if (a.dataset.nav === name) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}
window.addEventListener("hashchange", markNav);

document.addEventListener("langchange", () => {
  renderStart(); setPlaceholder(); markNav();
  cells.forEach((c, i) => c.setAttribute("aria-label", t("verify.cell", { n: i + 1 })));
  applyChannel();
  if (pending) codeSent.textContent = t(pending.demo ? "verify.codeSentDemo" : pending.channel === "email" ? "verify.codeSentEmail" : "verify.codeSentWhatsapp", { to: pending.display });
  renderStatus();
  if (!document.getElementById("view-requests").hidden) Requests.render(false);
});

document.getElementById("hero-avatar").append(Brand.avatar("lg"));
I18N.apply();
renderStart();
markNav();
setPlaceholder();
loadChannels();
initVoice();
Requests.init();
loadTiers().then(route);