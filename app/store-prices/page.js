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
              Your grocery list. Totals use the same algorithm as Budget and Home.
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
                    <th>Cheapest</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.name}</td>
                      <td className="text-center">{row.quantity}</td>
                      <td className="text-end">
                        {row.prices
                          ? formatPrice(row.aldiTotal)
                          : "—"}
                      </td>
                      <td className="text-end">
                        {row.prices
                          ? formatPrice(row.colesTotal)
                          : "—"}
                      </td>
                      <td className="text-end">
                        {row.prices
                          ? formatPrice(row.woolworthsTotal)
                          : "—"}
                      </td>
                      <td>
                        {row.prices ? (
                          <span className="pill text-nowrap">
                            {STORE_LABELS[row.cheapest]}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr className="fw-bold">
                    <td colSpan={2}>Basket total</td>
                    <td className="text-end">
                      {formatPrice(totals.aldi)}
                    </td>
                    <td className="text-end">
                      {formatPrice(totals.coles)}
                    </td>
                    <td className="text-end">
                      {formatPrice(totals.woolworths)}
                    </td>
                    <td>
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: "var(--ss-accent)",
                          color: "#fff",
                        }}
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

          {list.length > 0 && (
          <div className="hero-card p-4">
            <h5 className="mb-2">Summary</h5>
            <ul className="list-unstyled mb-0 text-muted small">
              <li className="mb-1">
                <strong className="text-dark">Aldi</strong> → {formatPrice(totals.aldi)}
              </li>
              <li className="mb-1">
                <strong className="text-dark">Coles</strong> → {formatPrice(totals.coles)}
              </li>
              <li className="mb-1">
                <strong className="text-dark">Woolworths</strong> → {formatPrice(totals.woolworths)}
              </li>
              <li className="mt-2 pt-2 border-top">
                <strong className="text-dark">Cheapest basket:</strong> {STORE_LABELS[bestStore]} at {formatPrice(totals[bestStore])}
              </li>
            </ul>
          </div>
          )}

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
            Grocery list → pricing engine (coming soon).
          </span>
        </div>
      </footer>
    </>
  );
}
