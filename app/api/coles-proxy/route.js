/**
 * Proxy for Coles search — avoids CORS when called from the browser.
 * The browser calls this route on our own server, which then calls Coles
 * server-side (no CORS restriction, and we can set proper headers).
 */

const COLES_HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json, text/html, */*",
    "Accept-Language": "en-AU,en;q=0.9",
    Referer: "https://www.coles.com.au/",
  };
  
  let colesBuildIdCache = null;
  let colesBuildIdCachedAt = null;
  const COLES_CACHE_TTL = 30 * 60 * 1000; // 30 min
  
  async function getColesBuildId() {
    const now = Date.now();
    if (
      colesBuildIdCache &&
      colesBuildIdCachedAt &&
      now - colesBuildIdCachedAt < COLES_CACHE_TTL
    ) {
      return colesBuildIdCache;
    }
  
    colesBuildIdCache = null;
    colesBuildIdCachedAt = null;
  
    try {
      const res = await fetch("https://www.coles.com.au", {
        headers: {
          ...COLES_HEADERS,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!res.ok) return null;
      const html = await res.text();
      // Try both formats Coles has used
      const match =
        html.match(/"buildId"\s*:\s*"([^"]+)"/) ||
        html.match(/<script id="__NEXT_DATA__"[^>]*>[\s\S]*?"buildId"\s*:\s*"([^"]+)"/);
      if (match) {
        colesBuildIdCache = match[1];
        colesBuildIdCachedAt = Date.now();
        return colesBuildIdCache;
      }
    } catch (e) {
      console.warn("Coles buildId fetch failed:", e.message);
    }
    return null;
  }
  
  // Normalisation (same logic as route.js)
  function extractQuantity(name) {
    const weightVol = name.match(/(\d+(\.\d+)?)\s*(ml|l|g|kg)/i);
    if (weightVol) return { value: parseFloat(weightVol[1]), unit: weightVol[3].toLowerCase() };
    const sheets = name.match(/(\d+(\.\d+)?)\s*(sheets?)/i);
    if (sheets) return { value: parseFloat(sheets[1]), unit: "sheets" };
    const pack = name.match(/(\d+(\.\d+)?)\s*(pk|pack|rolls?)/i);
    if (pack) return { value: parseFloat(pack[1]), unit: pack[3].toLowerCase() };
    return null;
  }
  
  function toBaseUnit(value, unit) {
    switch (unit) {
      case "ml":    return { value: value / 1000, unit: "l" };
      case "l":     return { value, unit: "l" };
      case "g":     return { value: value / 1000, unit: "kg" };
      case "kg":    return { value, unit: "kg" };
      case "sheets":
      case "sheet": return { value: value / 100, unit: "100 sheets" };
      default:      return { value, unit };
    }
  }
  
  function getNormalisedPrice(price, name) {
    const raw = extractQuantity(name);
    if (!raw) return null;
    const base = toBaseUnit(raw.value, raw.unit);
    if (base.value === 0) return null;
    return { normalisedPrice: price / base.value, unit: base.unit };
  }
  
  const REJECT_KEYWORDS = [
    "frother", "maker", "machine", "appliance", "grinder", "blender",
    "chocolate", "syrup", "supplement", "protein", "candle", "soap",
    "detergent", "cleaner", "bleach", "wrap", "foil", "sponge", "brush",
  ];
  const VAGUE_UNITS = ["each", "ea", "1each", "per each"];
  
  function isRelevantProduct(name, query) {
    const lname = name.toLowerCase();
    if (!lname.includes(query.toLowerCase())) return false;
    if (REJECT_KEYWORDS.some((kw) => lname.includes(kw))) return false;
    return true;
  }
  
  function scoreCandidate(p, query) {
    if (!isRelevantProduct(p.name, query)) return Infinity;
    const norm = getNormalisedPrice(p.price, p.name);
    const isVague = !norm || VAGUE_UNITS.some((u) => p.name.toLowerCase().includes(u));
    const base = norm ? norm.normalisedPrice : p.price * 10;
    return isVague ? base + 10000 : base;
  }
  
  function buildResult(best) {
    if (!best) return null;
    const norm = getNormalisedPrice(best.price, best.name);
    return {
      price: best.price,
      normalisedPrice: norm?.normalisedPrice ?? null,
      normalisedUnit: norm?.unit ?? null,
      productName: best.name,
      url: best.url ?? null,
    };
  }
  
  export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q) {
      return Response.json({ error: "Missing q param" }, { status: 400 });
    }
  
    const buildId = await getColesBuildId();
    if (!buildId) {
      return Response.json({ error: "Could not fetch Coles buildId" }, { status: 502 });
    }
  
    const url = `https://www.coles.com.au/_next/data/${buildId}/en/search/products.json?q=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(url, { headers: COLES_HEADERS });
      if (!res.ok) {
        // BuildId may have expired — clear cache so next request refreshes it
        colesBuildIdCache = null;
        colesBuildIdCachedAt = null;
        return Response.json({ error: `Coles returned ${res.status}` }, { status: 502 });
      }
  
      const data = await res.json();
      const results = data?.pageProps?.searchResults?.results;
      if (!Array.isArray(results) || results.length === 0) {
        return Response.json({ result: null });
      }
  
      const candidates = results
        .map((r) => ({
          name: r.name ?? r.Name ?? "",
          price: r?.pricing?.now ?? r?.Price?.now ?? r?.price ?? null,
          url: r.slug ? `https://www.coles.com.au/product/${r.slug}` : null,
        }))
        .filter((c) => typeof c.price === "number" && c.price > 0);
  
      if (candidates.length === 0) return Response.json({ result: null });
  
      let best = null, bestScore = Infinity;
      for (const c of candidates) {
        const score = scoreCandidate(c, q);
        if (score < bestScore) { bestScore = score; best = c; }
      }
  
      return Response.json({ result: buildResult(best) });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }