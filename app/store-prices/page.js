"use client";

import Link from "next/link";
import { AppNav } from "../components/AppNav";
import {
  dummyPriceDatabase,
  getPrices,
  getCheapestStore,
  STORES,
} from "../data/dummyPrices";
import { useGroceryListFirestore } from "../hooks/useGroceryListFirestore";
import { calculateBasketTotals } from "../lib/cheapestBasket";

const STORE_LABELS = {
  aldi: "Aldi",
  coles: "Coles",
  woolworths: "Woolworths",
};

function formatPrice(value) {
  return value == null ? "—" : `$${Number(value).toFixed(2)}`;
}

export default function StorePricesPage() {
  const year = new Date().getFullYear();
  const { list, loading } = useGroceryListFirestore();
  const basketResult = list.length > 0 ? calculateBasketTotals(list, dummyPriceDatabase) : null;

  const rows = list.map((item) => {
    const prices = getPrices(item.name);
    const aldiTotal = prices ? prices.aldi * item.quantity : null;
    const colesTotal = prices ? prices.coles * item.quantity : null;
    const woolworthsTotal = prices ? prices.woolworths * item.quantity : null;
    const cheapest = getCheapestStore(prices);
    return {
      ...item,
      prices,
      aldiTotal,
      colesTotal,
      woolworthsTotal,
      cheapest,
    };
  });

  const totals = basketResult?.totalsByStore ?? { aldi: 0, coles: 0, woolworths: 0 };
  const bestStore = basketResult?.bestStore ?? "aldi";

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
              See how much each item costs at Aldi, Coles, and Woolworths. Totals show the cheapest basket for your list.
            </p>
          </div>

          {/* Recommendation banner */}
          {!loading && list.length > 0 && basketResult && (
            <div
              className="hero-card p-4 mb-4 border-2"
              style={{ borderColor: "var(--ss-accent)", borderStyle: "solid", borderRadius: "1rem" }}
            >
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    backgroundColor: "var(--ss-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  🏆
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-1 fw-bold">
                    Shop at <span style={{ color: "var(--ss-accent)" }}>{STORE_LABELS[bestStore]}</span> to save the most
                  </h5>
                  <p className="mb-0 text-muted small">
                    Your cheapest basket is{" "}
                    <strong className="text-dark">{formatPrice(totals[bestStore])}</strong>
                    {(() => {
                      const worstTotal = Math.max(...Object.values(totals).filter(Boolean));
                      const savings = worstTotal - totals[bestStore];
                      return savings > 0 ? (
                        <> — you save <strong className="text-success">{formatPrice(savings)}</strong> vs the most expensive option</>
                      ) : null;
                    })()}
                  </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {Object.entries(totals)
                    .sort((a, b) => a[1] - b[1])
                    .map(([store, total], i) => (
                      <div
                        key={store}
                        className="text-center px-3 py-2 rounded-3"
                        style={{
                          backgroundColor: store === bestStore ? "var(--ss-accent)" : "#f1f3f5",
                          color: store === bestStore ? "#fff" : "#555",
                          minWidth: 90,
                        }}
                      >
                        <div className="fw-bold small">{STORE_LABELS[store]}</div>
                        <div className="fw-semibold">{formatPrice(total)}</div>
                        {i === 0 && <div style={{ fontSize: 10 }}>CHEAPEST</div>}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          <div className="hero-card p-4 mb-4">
            {loading ? (
              <p className="text-muted small mb-0">Loading your list…</p>
            ) : list.length === 0 ? (
              <div className="text-center py-3">
                <p className="mb-2">Your list is empty.</p>
                <Link href="/" className="btn btn-primary btn-sm" style={{ backgroundColor: "var(--ss-primary)", borderColor: "var(--ss-primary)" }}>Add items on Grocery List</Link>
              </div>
            ) : (
            <>
            <p className="text-muted small mb-3">
              Green cells = cheapest price for that item. Totals use the Cheapest Basket Engine.
            </p>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Aldi</th>
                    <th className="text-end">Coles</th>
                    <th className="text-end">Woolworths</th>
                    <th>Best pick</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.name}</td>
                      <td className="text-center">{row.quantity}</td>
                      {["aldi", "coles", "woolworths"].map((store) => {
                        const total = row[`${store}Total`];
                        const isCheapest = row.cheapest === store && row.prices;
                        return (
                          <td
                            key={store}
                            className="text-end fw-semibold"
                            style={isCheapest ? { backgroundColor: "#d1fae5", color: "#065f46" } : {}}
                          >
                            {row.prices ? formatPrice(total) : "—"}
                            {isCheapest && <span style={{ marginLeft: 4, fontSize: 12 }}>✓</span>}
                          </td>
                        );
                      })}
                      <td>
                        {row.prices ? (
                          <span
                            className="badge rounded-pill text-nowrap"
                            style={{ backgroundColor: "var(--ss-accent)", color: "#fff" }}
                          >
                            {STORE_LABELS[row.cheapest]}
                          </span>
                        ) : (
                          <span className="text-muted small">No data</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr className="fw-bold">
                    <td colSpan={2}>Basket total</td>
                    {["aldi", "coles", "woolworths"].map((store) => (
                      <td
                        key={store}
                        className="text-end"
                        style={store === bestStore ? { backgroundColor: "#d1fae5", color: "#065f46" } : {}}
                      >
                        {formatPrice(totals[store])}
                        {store === bestStore && <span style={{ marginLeft: 4, fontSize: 12 }}>✓</span>}
                      </td>
                    ))}
                    <td>
                      <span
                        className="badge rounded-pill"
                        style={{ backgroundColor: "var(--ss-accent)", color: "#fff" }}
                      >
                        Best: {STORE_LABELS[bestStore]}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            </>
            )}
          </div>

          <div className="mt-4 p-3 rounded-3 bg-light border">
            <h6 className="mb-2">Real data later</h6>
            <p className="small text-muted mb-0">
              Prices above are <strong>dummy data</strong>. For real data, options include: (1) <strong>No official API</strong> — Coles, Woolworths, and Aldi don’t offer public developer APIs. (2) <strong>Reverse‑engineered / community APIs</strong> — e.g. Woolworths’ site uses APIs that can be documented (see GitHub “au-supermarket-apis”). (3) <strong>Third‑party scraping/API services</strong> — e.g. retail data providers that expose Coles/Woolworths/Aldi prices via their own API. (4) <strong>Open datasets</strong> — e.g. community projects like “aus_grocery_price_database” on GitHub. The Supermarket Price Database owner can replace <code>app/data/dummyPrices.js</code> with an API client or imported dataset when ready.
            </p>
          </div>
        </div>
      </main>

      <footer className="footer py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span className="text-muted small">
            © <span>{year}</span> StudentSaver. All rights reserved.
          </span>
          <span className="text-muted small">
            Prices are demo data. Real store prices coming soon.
          </span>
        </div>
      </footer>
    </>
  );
}
