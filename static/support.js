const STATUS = { new: "جديدة", in_progress: "قيد المعالجة", closed: "مغلقة" };
const tokenInput = document.getElementById("token");
const state = document.getElementById("state");
const table = document.getElementById("table");
const rows = document.getElementById("rows");
let tierNames = {};

function token() { return sessionStorage.getItem("supportToken") || ""; }

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", "X-Support-Token": token(), ...(options.headers || {}) },
  });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function cell(text) { const td = document.createElement("td"); td.dir = "auto"; td.textContent = text ?? "—"; return td; }

function statusSelect(c) {
  const td = document.createElement("td");
  const select = document.createElement("select");
  select.setAttribute("aria-label", "حالة الطلب");
  Object.entries(STATUS).forEach(([value, label]) => select.add(new Option(label, value, false, value === c.status)));
  select.addEventListener("change", async () => {
    select.disabled = true;
    try { await api(`/api/support-cases/${c.id}`, { method: "PATCH", body: JSON.stringify({ status: select.value }) }); }
    catch { select.value = c.status; state.textContent = "لم يُحفظ تغيير الحالة. أعد المحاولة."; }
    finally { select.disabled = false; }
  });
  td.appendChild(select);
  return td;
}

async function load() {
  try {
    const [cases, tiers] = await Promise.all([api("/api/support-cases"), fetch("/api/memberships").then((r) => r.json())]);
    tierNames = Object.fromEntries(tiers.map((t) => [t.id, t.name.ar]));
    rows.replaceChildren(...cases.map((c) => {
      const tr = document.createElement("tr");
      tr.append(
        cell(new Date(/[zZ]|[+-]\d\d:\d\d$/.test(c.created_at) ? c.created_at : c.created_at + "Z").toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })),
        cell(c.question), cell(c.summary), cell(c.language === "ar" ? "عربي" : "English"),
        cell(tierNames[c.tier_id]), cell(c.contact), statusSelect(c),
      );
      return tr;
    }));
    table.hidden = cases.length === 0;
    state.textContent = cases.length ? `${cases.length} حالة` : "لا توجد حالات بعد. ستظهر هنا عند تحويل أي سؤال من المساعد.";
  } catch (e) {
    table.hidden = true;
    state.textContent = e.message === "auth" ? "الرمز غير صحيح. تحقق منه وأعد المحاولة." : "تعذّر تحميل الحالات. أعد المحاولة.";
  }
}

document.getElementById("auth").addEventListener("submit", (e) => {
  e.preventDefault();
  sessionStorage.setItem("supportToken", tokenInput.value);
  load();
});

if (token()) load();
