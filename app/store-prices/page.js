"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { AppNav } from "../components/AppNav";
import { dummyPriceDatabase, getCheapestStore } from "../data/dummyPrices";
import { useGroceryListFirestore } from "../hooks/useGroceryListFirestore";
import { calculateBasketTotals } from "../lib/cheapestBasket";
import { useAuth } from "../contexts/AuthContext";

const STORE_LABELS = { aldi: "Aldi", coles: "Coles", woolworths: "Woolworths" };
const STORES = ["aldi", "coles", "woolworths"];

// ─── Normalisation (client-side, mirrors route.js) ───────────────────────────

function extractQuantity(name) {
  const match = name.match(/(\d+(\.\d+)?)\s*(ml|l|g|kg|pk|pack|sheets?|rolls?)/i);
  if (!match) return null;
  return { value: parseFloat(match[1]), unit: match[3].toLowerCase() };
}

function toBaseUnit(value, unit) {
  switch (unit) {
    case "ml":     return { value: value / 1000, unit: "l" };
    case "l":      return { value, unit: "l" };
    case "g":      return { value: value / 1000, unit: "kg" };
    case "kg":     return { value, unit: "kg" };
    case "sheet":
    case "sheets": return { value: value / 100, unit: "100 sheets" };
    default:       return { value, unit };
  }
}

function getNormalisedPrice(price, productName) {
  const raw = extractQuantity(productName);
  if (!raw) return null;
  const base = toBaseUnit(raw.value, raw.unit);
  if (base.value === 0) return null;
  return { normalisedPrice: price / base.value, unit: base.unit };
}

const REJECT_KEYWORDS = [
  "frother", "maker", "machine", "appliance", "grinder", "blender",
  "chocolate", "syrup", "supplement", "protein", "candle", "soap",
  "detergent", "cleaner", "bleach", "bag", "wrap", "foil", "sponge", "brush",
];
const REJECT_CATEGORIES = [
  "tea, coffee", "kitchenware", "appliance", "cleaning",
  "electronics", "clothing", "toys", "garden", "tools",
];
const VAGUE_UNITS = ["each", "ea", "1each", "per each"];

function isRelevantProduct(name, categories, query) {
  const lname = name.toLowerCase();
  if (!lname.includes(query.toLowerCase())) return false;
  if (REJECT_KEYWORDS.some((kw) => lname.includes(kw))) return false;
  if (categories?.length) {
    const catStr = categories.map((c) => (c.name || c).toLowerCase()).join(" ");
    if (REJECT_CATEGORIES.some((rc) => catStr.includes(rc))) return false;
  }
  return true;
}

function scoreCandidate(p) {
  const norm = getNormalisedPrice(p.price, p.name);
  const isVague = !norm || VAGUE_UNITS.some((u) => p.name.toLowerCase().includes(u));
  const base = norm ? norm.normalisedPrice : p.price * 10;
  return isVague ? base + 10000 : base;
}

function pickBestProduct(candidates, query) {
  const relevant = candidates.filter((p) =>
    isRelevantProduct(p.name, p.categories ?? [], query)
  );
  const pool = relevant.length > 0 ? relevant : candidates;
  let best = null, bestScore = Infinity;
  for (const p of pool) {
    const score = scoreCandidate(p);
    if (score < bestScore) { bestScore = score; best = p; }
  }
  return best;
}

function buildResult(best, price) {
  if (!best) return null;
  const norm = getNormalisedPrice(price ?? best.price, best.name);
  return {
    price: price ?? best.price,
    normalisedPrice: norm?.normalisedPrice ?? null,
    normalisedUnit: norm?.unit ?? null,
    productName: best.name,
    url: best.url ?? null,
  };
}

// ─── Coles client-side fetch ──────────────────────────────────────────────────

let colesBuildIdCache = null;
let colesBuildIdCachedAt = null;
const COLES_CACHE_TTL = 60 * 60 * 1000;

async function getColesBuildId() {
  const now = Date.now();
  if (colesBuildIdCache && colesBuildIdCachedAt && (now - colesBuildIdCachedAt) < COLES_CACHE_TTL) {
    return colesBuildIdCache;
  }
  // Fetch the Coles homepage to extract the Next.js buildId
  const res = await fetch("https://www.coles.com.au", {
    headers: { Accept: "text/html" },
    credentials: "omit",
  });
  const html = await res.text();
  const match = html.match(/"buildId"\s*:\s*"([^"]+)"/);
  if (match) {
    colesBuildIdCache = match[1];
    colesBuildIdCachedAt = now;
    return colesBuildIdCache;
  }
  return null;
}

async function searchColesClient(searchTerm) {
  try {
    const buildId = await getColesBuildId();
    if (!buildId) return null;

    const url = `https://www.coles.com.au/_next/data/${buildId}/en/search/products.json?q=${encodeURIComponent(searchTerm)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      credentials: "omit",
    });
    if (!res.ok) return null;

    const data = await res.json();
    const results = data?.pageProps?.searchResults?.results;
    if (!Array.isArray(results) || results.length === 0) return null;

    const candidates = results
      .map((r) => ({
        name: r.name ?? r.Name ?? "",
        price: r?.pricing?.now ?? r?.Price?.now ?? r?.price ?? null,
        categories: r.category ? [{ name: r.category }] : [],
        url: r.slug ? `https://www.coles.com.au/product/${r.slug}` : null,
      }))
      .filter((c) => typeof c.price === "number" && c.price > 0);

    if (candidates.length === 0) return null;
    const best = pickBestProduct(candidates, searchTerm);
    return buildResult(best, best?.price ?? null);
  } catch (e) {
    console.warn("Coles client fetch failed:", e.message);
    return null;
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatNormalisedAsStandard(normalisedPrice, normalisedUnit) {
  // normalisedPrice is already per base unit (per kg, per l, per 100 sheets, per pack)
  if (normalisedPrice == null || normalisedUnit == null) return null;
  return `$${Number(normalisedPrice).toFixed(2)}/${normalisedUnit}`;
}

function formatPrice(value) {
  return value == null ? "N/A" : `$${Number(value).toFixed(2)}`;
}

// ─── Price lookup helpers ─────────────────────────────────────────────────────

function flattenForBasket(livePricesByItem) {
  const out = {};
  for (const [item, stores] of Object.entries(livePricesByItem)) {
    out[item] = {};
    for (const store of STORES) {
      const price = stores[store]?.price;
      // Only include stores with a real price — null/undefined causes
      // calculateBasketTotals to treat them as 0 which skews totals
      if (typeof price === "number" && price > 0) {
        out[item][store] = price;
      }
    }
  }
  return out;
}

function getStorePrices(itemName, livePricesByItem) {
  const key = itemName.trim().toLowerCase();
  if (livePricesByItem) {
    return livePricesByItem[key] ?? { aldi: null, coles: null, woolworths: null };
  }
  const dummy = dummyPriceDatabase[key];
  if (!dummy) return { aldi: null, coles: null, woolworths: null };
  return {
    aldi:       dummy.aldi       != null ? { price: dummy.aldi,       normalisedPrice: null, normalisedUnit: null, productName: null, url: null } : null,
    coles:      dummy.coles      != null ? { price: dummy.coles,      normalisedPrice: null, normalisedUnit: null, productName: null, url: null } : null,
    woolworths: dummy.woolworths != null ? { price: dummy.woolworths, normalisedPrice: null, normalisedUnit: null, productName: null, url: null } : null,
  };
}

// ─── PriceCell component ──────────────────────────────────────────────────────

function PriceCell({ storeResult, quantity }) {
  if (!storeResult || storeResult.price == null) {
    return <span className="text-muted">N/A</span>;
  }

  // Display the normalised price × quantity if available, else raw price × quantity
  // const displayPrice = storeResult.normalisedPrice != null
  //   ? storeResult.normalisedPrice * quantity
  //   : storeResult.price * quantity;

  const displayPrice = storeResult.price * quantity;

  const normLabel = formatNormalisedAsStandard(storeResult.normalisedPrice, storeResult.normalisedUnit);

  const inner = (
    <span>
      <span className="fw-semibold">{formatPrice(displayPrice)}</span>
      {normLabel && (
        <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--ss-muted)" }}>
          {normLabel}
        </span>
      )}
      {storeResult.productName && (
        <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--ss-muted)" }}>
          {storeResult.productName}
        </span>
      )}
    </span>
  );

  if (storeResult.url) {
    return (
      <a href={storeResult.url} target="_blank" rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}>
        {inner}
        <span style={{ fontSize: "0.68rem", color: "var(--ss-primary)", display: "block" }}>↗ view</span>
      </a>
    );
  }
  return inner;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StorePricesPage() {
  const { user, authLoading } = useAuth();
  const { list, loading } = useGroceryListFirestore(user);
  const year = new Date().getFullYear();
  const [livePricesByItem, setLivePricesByItem] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const flatPrices = livePricesByItem ? flattenForBasket(livePricesByItem) : dummyPriceDatabase;
  const basketResult = list.length > 0 ? calculateBasketTotals(list, flatPrices) : null;

  const fetchLivePrices = useCallback(async () => {
    if (!list.length) return;
    setFetchLoading(true);
    setFetchError(null);
    try {
      // Step 1: fetch Woolworths + Aldi server-side
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: list }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data?.errors?.join(" ") || "Failed to fetch prices");
        return;
      }

      const combined = data.pricesByItem || {};

      // Step 2: fetch Coles client-side for each unique item
      const terms = [...new Set(list.map((i) => (i.name || "").trim().toLowerCase()).filter(Boolean))];
      await Promise.all(
        terms.map(async (term) => {
          const colesResult = await searchColesClient(term);
          if (combined[term]) {
            combined[term].coles = colesResult;
          } else {
            combined[term] = { woolworths: null, coles: colesResult, aldi: null };
          }
        })
      );

      setLivePricesByItem({ ...combined });
      if (data.errors?.length) setFetchError(data.errors.join(" "));
    } catch (e) {
      setFetchError(e.message || "Network error");
    } finally {
      setFetchLoading(false);
    }
  }, [list]);

  const rows = list.map((item) => {
    const storePrices = getStorePrices(item.name, livePricesByItem);
    const priceMap = {};
    if (storePrices.aldi?.price != null)       priceMap.aldi       = storePrices.aldi.price;
    if (storePrices.coles?.price != null)      priceMap.coles      = storePrices.coles.price;
    if (storePrices.woolworths?.price != null) priceMap.woolworths = storePrices.woolworths.price;
    const cheapestStore = Object.keys(priceMap).length > 0 ? getCheapestStore(priceMap) : null;
    return { ...item, storePrices, cheapestStore };
  });

  const totals = basketResult?.totalsByStore ?? { aldi: 0, coles: 0, woolworths: 0 };
  const bestStore = basketResult?.bestStore ?? null;
  const hasLivePrices = livePricesByItem != null;

  return (
    <>
      <AppNav currentPath="/store-prices" />
      <main className="hero-section">
        <div className="container">
          <div className="mb-4">
            <h1 className="hero-title mb-2">
              Store <span className="hero-highlight">price comparison</span>
            </h1>
            <p className="hero-subtitle mb-0">
              See how much each item costs at Aldi, Coles, and Woolworths.
              Totals show the cheapest basket for your list.
            </p>
          </div>

          <div className="hero-card p-4 mb-4">
            {authLoading || loading ? (
              <p className="text-muted small mb-0">Loading your list…</p>
            ) : list.length === 0 ? (
              <div className="text-center py-3">
                <p className="mb-2">Your list is empty.</p>
                <Link href="/" className="btn btn-primary btn-sm"
                  style={{ backgroundColor: "var(--ss-primary)", borderColor: "var(--ss-primary)" }}>
                  Add items on Grocery List
                </Link>
              </div>
            ) : (
              <>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <p className="text-muted small mb-0">
                    {hasLivePrices
                      ? "Live prices shown — normalised to standard units. Click a price to view the product."
                      : "Sample prices shown. Click below to fetch live prices."}
                  </p>
                  <button type="button"
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: "var(--ss-primary)", borderColor: "var(--ss-primary)" }}
                    onClick={fetchLivePrices}
                    disabled={fetchLoading}>
                    {fetchLoading ? "Fetching…" : "Fetch live prices"}
                  </button>
                </div>

                {fetchError && (
                  <div className="alert alert-warning py-2 mb-3 small" role="alert">
                    {fetchError}
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Aldi</th>
                        <th className="text-end">Coles</th>
                        <th className="text-end">Woolworths</th>
                        <th>Cheapest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td className="fw-semibold">{row.name}</td>
                          <td className="text-center">{row.quantity}</td>
                          <td className="text-end">
                            <PriceCell storeResult={row.storePrices.aldi} quantity={row.quantity} />
                          </td>
                          <td className="text-end">
                            <PriceCell storeResult={row.storePrices.coles} quantity={row.quantity} />
                          </td>
                          <td className="text-end">
                            <PriceCell storeResult={row.storePrices.woolworths} quantity={row.quantity} />
                          </td>
                          <td>
                            {row.cheapestStore
                              ? <span className="pill text-nowrap">{STORE_LABELS[row.cheapestStore]}</span>
                              : <span className="text-muted">N/A</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr className="fw-bold">
                        <td colSpan={2}>Basket total</td>
                        <td className="text-end">{totals.aldi  ? formatPrice(totals.aldi)  : "N/A"}</td>
                        <td className="text-end">{totals.coles ? formatPrice(totals.coles) : "N/A"}</td>
                        <td className="text-end">{totals.woolworths ? formatPrice(totals.woolworths) : "N/A"}</td>
                        <td>
                          {bestStore
                            ? <span className="badge rounded-pill" style={{ backgroundColor: "var(--ss-accent)", color: "#fff" }}>
                                Best: {STORE_LABELS[bestStore]}
                              </span>
                            : "N/A"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>

          {list.length > 0 && (
            <div className="hero-card p-4">
              <h5 className="mb-2">Summary</h5>
              <ul className="list-unstyled mb-0 text-muted small">
                {STORES.map((store) => (
                  <li key={store} className="mb-1">
                    <strong className="text-dark">{STORE_LABELS[store]}</strong> →{" "}
                    {totals[store] ? formatPrice(totals[store]) : "N/A"}
                  </li>
                ))}
                {bestStore && (
                  <li className="mt-2 pt-2 border-top">
                    <strong className="text-dark">Cheapest basket:</strong>{" "}
                    {STORE_LABELS[bestStore]} at {formatPrice(totals[bestStore])}
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="mt-4 p-3 rounded-3 bg-light border">
            <h6 className="mb-2">How prices are fetched</h6>
            <p className="small text-muted mb-0">
              Woolworths and Aldi are fetched server-side. Coles is fetched
              directly from your browser to avoid bot-detection blocks. All
              prices are normalised to standard units (per kg, per L, per 100
              sheets) so the best-value product is always selected. Click any
              price to view the listing. If no match is found, that cell shows N/A.
            </p>
          </div>
        </div>
      </main>

      <footer className="footer py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span className="text-muted small">© <span>{year}</span> StudentSaver. All rights reserved.</span>
          <span className="text-muted small">Prices fetched live from Aldi, Coles &amp; Woolworths.</span>
        </div>
      </footer>
    </>
  );
}