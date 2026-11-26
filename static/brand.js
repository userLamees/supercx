/* SuperCX brand assets as inline SVG: the SuperCX logo mark (colored and white versions) and
   the avatar of the assistant. Original artwork; not the association's logo.
   Injected once per page as a hidden sprite, then used with <svg><use href="#..."/></svg>. */
(function () {
  const S_PATH = "M20.6 10.6c-1-1.6-2.8-2.6-4.8-2.6-2.9 0-5 1.6-5 4 0 5.6 10.6 3 10.6 8.6 0 2.5-2.2 4.4-5.6 4.4-2.3 0-4.3-1-5.3-2.8";
  const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <linearGradient id="sx-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1A2390"/><stop offset="1" stop-color="#3040D0"/>
    </linearGradient>
    <pattern id="av-shemagh" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="#C8203A"/>
      <path d="M0 0h2v2H0zM2 2h2v2H2z" fill="#FFFFFF" opacity="0.16"/>
    </pattern>
    <clipPath id="av-clip"><circle cx="32" cy="32" r="32"/></clipPath>
  </defs>

  <!-- SuperCX mark: rounded square, indigo-to-blue gradient, white S -->
  <symbol id="sx-mark" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="8" fill="url(#sx-grad)"/>
    <path d="${S_PATH}" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <!-- White version for the green bar -->
  <symbol id="sx-mark-white" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="8" fill="#FFFFFF"/>
    <path d="${S_PATH}" fill="none" stroke="#102E1A" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>

  <!-- Assistant avatar: friendly flat face, red shemagh with a light check pattern, black agal -->
  <symbol id="assistant-avatar" viewBox="0 0 64 64">
    <g clip-path="url(#av-clip)">
      <circle cx="32" cy="32" r="32" fill="#ECEEFC"/>
      <path d="M6 66c2-11 10-17 20-18h12c10 1 18 7 20 18z" fill="#FFFFFF"/>
      <path d="M26 48h12l-6 6z" fill="#E4E6F2"/>
      <path d="M13 64c-1-17 1-33 6-41 3-5 8-8 13-8s10 3 13 8c5 8 7 24 6 41-4-3-8-10-9-17H22c-1 7-5 14-9 17z" fill="url(#av-shemagh)"/>
      <ellipse cx="32" cy="35" rx="10.5" ry="12.5" fill="#E2B08A"/>
      <path d="M21.6 37c.4 7.6 4.8 11 10.4 11s10-3.4 10.4-11c-1.6 4.4-4.4 6.6-10.4 6.6S23.2 41.4 21.6 37z" fill="#3B2A20"/>
      <path d="M28.4 40.4c1.2-.7 2.4-1 3.6-1s2.4.3 3.6 1c-1.1.5-2.3.7-3.6.7s-2.5-.2-3.6-.7z" fill="#3B2A20"/>
      <path d="M29 43.2c1 .8 2 1.1 3 1.1s2-.3 3-1.1" fill="none" stroke="#7A3E2B" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="28" cy="34.6" r="1.5" fill="#2B1D16"/>
      <circle cx="36" cy="34.6" r="1.5" fill="#2B1D16"/>
      <path d="M25.6 31.4c1.3-.8 2.8-1 4.2-.6M38.4 31.4c-1.3-.8-2.8-1-4.2-.6" fill="none" stroke="#3B2A20" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M20.4 31c1.4-6.4 6-9.4 11.6-9.4s10.2 3 11.6 9.4c-3.2-3.4-7.2-5-11.6-5s-8.4 1.6-11.6 5z" fill="url(#av-shemagh)"/>
      <path d="M19.4 22.6c3.2-3.4 7.6-5 12.6-5s9.4 1.6 12.6 5" fill="none" stroke="#141414" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M20.6 19.4c3-2.8 7-4.2 11.4-4.2s8.4 1.4 11.4 4.2" fill="none" stroke="#141414" stroke-width="2.4" stroke-linecap="round"/>
    </g>
  </symbol>
</svg>`;

  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  const NS = "http://www.w3.org/2000/svg";
  function use(id) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const u = document.createElementNS(NS, "use");
    u.setAttribute("href", `#${id}`);
    svg.append(u);
    return svg;
  }

  /* The assistant's avatar: size "sm" (28px, beside messages) or "lg" (72px, start screen). */
  function avatar(size = "sm") {
    const span = document.createElement("span");
    span.className = `avatar${size === "lg" ? " avatar-lg" : ""}`;
    span.append(use("assistant-avatar"));
    return span;
  }

  window.Brand = { avatar, use };
})();
