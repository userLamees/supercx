/* SuperCX brand pieces, each in one place so they are easy to swap later:
   - logo(): the temporary text logo ("Super" + "CX"). Every element with [data-brand-logo]
     gets it on load, so pages only hold a placeholder.
   - avatar(size): the assistant's photo (static/img/mishari.png) in a soft blue circle. */
(function () {
  const AVATAR_SRC = "/static/img/mishari.png";

  function logo() {
    const span = document.createElement("span");
    span.className = "logo";
    span.setAttribute("dir", "ltr");
    const a = document.createElement("span");
    a.textContent = "Super";
    const b = document.createElement("span");
    b.className = "logo-cx";
    b.textContent = "CX";
    span.append(a, b);
    return span;
  }

  /* size "sm" (32px on phones, 40px on laptops, beside messages) or "lg" (96px, start screen). */
  function avatar(size = "sm") {
    const span = document.createElement("span");
    span.className = `avatar${size === "lg" ? " avatar-lg" : ""}`;
    const img = document.createElement("img");
    img.src = AVATAR_SRC;
    img.alt = "";
    img.decoding = "async";
    img.width = img.height = size === "lg" ? 96 : 40;
    span.append(img);
    return span;
  }

  document.querySelectorAll("[data-brand-logo]").forEach((el) => el.replaceChildren(logo()));

  window.Brand = { logo, avatar };
})();
