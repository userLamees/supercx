/* Membership comparison cards: which cards to show for a chat reply, and the data on each card.
   Pure functions (no DOM), so they are tested with Node from pytest (tests/test_brand.py).
   Prices and benefits come only from the tiers API (get_tiers), matched by tier_id. */
(function (root) {
  // A comparison question: "what's the difference between memberships", "compare", "membership types"...
  const COMPARE = /الفرق بين|قارن|مقارنة|العضويات المتاحة|أنواع العضوي|ما هي العضويات|كم عضوية|كل العضويات|compare|comparison|difference between|membership (types|options|levels)|types of membership|all (the )?memberships/i;

  const isComparison = (question) => COMPARE.test(question || "");

  /* Ids of tiers whose Arabic or English name appears in the text. */
  function mentionedTiers(text, tiers) {
    const t = (text || "").toLowerCase();
    return tiers.filter((tier) => [tier.name.ar, tier.name.en].some((n) => n && t.includes(n.toLowerCase())))
      .map((tier) => tier.id);
  }

  /* Decide the cards for a reply. Returns null (no cards) or
     { ids: [...] (display order), recommended: id|null, popular: id|null }. */
  function cardsFor(reply, question, tiers, lastRecommended) {
    if (!reply || !Array.isArray(tiers) || tiers.length < 2) return null;
    const known = new Set(tiers.map((t) => t.id));
    const ordered = [...tiers].sort((a, b) => a.display_order - b.display_order);
    let recommended = null;
    if (reply.action === "recommend" && known.has(reply.tier_id)) recommended = reply.tier_id;
    else if (reply.action === "answer" && (isComparison(question) || mentionedTiers(reply.answer, tiers).length >= 2)) {
      recommended = known.has(lastRecommended) ? lastRecommended : null;  // an earlier recommendation stays marked
    } else return null;
    const popular = ordered.find((t) => t.is_most_common)?.id || null;
    return { ids: ordered.map((t) => t.id), recommended, popular };
  }

  /* Header color by price rank, like the cxa.sa cards: lowest gray, middle blue, highest indigo. */
  function tones(tiers) {
    const byPrice = [...tiers].sort((a, b) => a.price_sar - b.price_sar);
    const names = byPrice.length >= 3 ? ["gray", "blue", "indigo"] : ["gray", "indigo"];
    const out = {};
    byPrice.forEach((t, i) => { out[t.id] = names[Math.min(i, names.length - 1)]; });
    return out;
  }

  /* Everything a card shows, from the tier record only. */
  function cardModel(tier, lang, decision) {
    // "Best for you" wins on the recommended card; "Most popular" stays on the popular one.
    const badge = decision.recommended === tier.id ? "recommended" : decision.popular === tier.id ? "popular" : null;
    return {
      id: tier.id,
      name: tier.name[lang],
      price: tier.price_sar,
      periodYears: tier.period_years,
      features: tier.features[lang],
      url: tier.source_url,
      checkedAt: tier.checked_at || null,
      badge,
      recommended: decision.recommended === tier.id,
    };
  }

  const api = { isComparison, mentionedTiers, cardsFor, tones, cardModel };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Tiers = api;
})(typeof window !== "undefined" ? window : globalThis);
