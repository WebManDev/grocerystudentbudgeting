"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppNav } from "../components/AppNav";
import { useGroceryListFirestore } from "../hooks/useGroceryListFirestore";
import { calculateBasketTotals } from "../lib/cheapestBasket";
import { dummyPriceDatabase } from "../data/dummyPrices";

const STORE_LABELS = { aldi: "Aldi", coles: "Coles", woolworths: "Woolworths" };

export default function BudgetPage() {
  const year = new Date().getFullYear();
  const { list, loading, firebaseError } = useGroceryListFirestore();
  const [budget, setBudget] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem("studentSaver_budget");
    if (saved !== null && saved !== "") setBudget(saved);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || budget === "") return;
    localStorage.setItem("studentSaver_budget", budget);
  }, [mounted, budget]);

  const budgetNum = parseFloat(String(budget).replace(/[^0-9.]/g, "")) || 0;
  const basketResult = list.length > 0 ? calculateBasketTotals(list, dummyPriceDatabase) : null;
  const basketTotal = basketResult?.bestTotal ?? null;
  const remaining = basketTotal != null && budgetNum > 0 ? budgetNum - basketTotal : null;
  const mostExpensiveStore = basketResult?.totalsByStore
    ? Object.entries(basketResult.totalsByStore).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0])[0]
    : null;
  const savingsVsWorst = basketTotal != null && mostExpensiveStore
    ? (basketResult.totalsByStore[mostExpensiveStore] ?? 0) - basketTotal
    : 0;

  return (
    <>
      <AppNav currentPath="/budget" />
      <main className="hero-section">
        <div className="container">
          <div className="mb-4">
            <h1 className="hero-title mb-2">
              Your <span className="hero-highlight">budget</span>
            </h1>
            <p className="hero-subtitle mb-0">
              Set your weekly grocery budget. We’ll help you stay on track and compare basket totals.
            </p>
          </div>

          {firebaseError && (
            <div className="alert alert-warning py-2 mb-3" role="alert">
              <small>List may not be synced: {firebaseError}</small>
            </div>
          )}

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="hero-card p-4">
                <h5 className="mb-3">Budget</h5>
                <label htmlFor="budget-input" className="form-label small text-muted">
                  Weekly budget ($)
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">$</span>
                  <input
                    id="budget-input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 50"
                    className="form-control"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    aria-label="Weekly budget in dollars"
                  />
                </div>
                {budgetNum > 0 && (
                  <p className="small text-muted mt-2 mb-0">
                    You’re budgeting <strong>${budgetNum.toFixed(2)}</strong> for this shop.
                  </p>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-card p-4">
                <h5 className="mb-3">Summary</h5>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="metric-pill">
                    <strong>Budget:</strong> {budgetNum > 0 ? `$${budgetNum.toFixed(2)}` : "—"}
                  </span>
                  <span className="metric-pill">
                    <strong>Basket:</strong> {basketTotal != null ? `$${basketTotal.toFixed(2)}` : "—"}
                  </span>
                  <span className="metric-pill">
                    <strong>Remaining:</strong>{" "}
                    {remaining != null ? `$${remaining.toFixed(2)}` : "—"}
                  </span>
                </div>
                <p className="small text-muted mb-2" style={{ lineHeight: 1.4 }}>
                  <strong>Budget</strong> = what you plan to spend.{" "}
                  <strong>Basket</strong> = total cost of your list at the chosen store.{" "}
                  <strong>Remaining</strong> = budget minus basket.
                </p>
                {budgetNum > 0 && (
                  <div className="budget-bar mt-2">
                    <div
                      className="budget-bar-fill"
                      style={{
                        width:
                          basketTotal != null && budgetNum > 0
                            ? `${Math.min(100, (basketTotal / budgetNum) * 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                )}
                {basketResult?.bestStore && (
                  <p className="small text-success mt-2 mb-0">
                    Cheapest basket: <strong>{STORE_LABELS[basketResult.bestStore]}</strong> — ${basketTotal.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {savingsVsWorst > 0 && mostExpensiveStore && basketResult?.bestStore && (
            <div className="hero-card p-4 mt-4 border-success border-2">
              <h5 className="mb-2">Savings &amp; insights</h5>
              <p className="mb-1">
                You save <strong className="text-success">${savingsVsWorst.toFixed(2)}</strong> by shopping at {STORE_LABELS[basketResult.bestStore]} instead of {STORE_LABELS[mostExpensiveStore]}.
              </p>
              <p className="text-muted small mb-0">
                Budget: ${budgetNum.toFixed(2)} · Cheapest basket: ${basketTotal.toFixed(2)} · Remaining: ${remaining.toFixed(2)}
              </p>
            </div>
          )}

          <div className="hero-card p-4 mt-4">
            <h5 className="mb-3">Your grocery list</h5>
            {loading ? (
              <p className="text-muted small mb-0">Loading your list…</p>
            ) : list.length === 0 ? (
              <div className="text-center py-3">
                <p className="mb-2 fw-medium text-dark">
                  Your list is empty
                </p>
                <p className="text-muted small mb-3">
                  Add items on the Grocery List, then come back here to set your budget and see how much you’ll save.
                </p>
                <Link
                  href="/"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "var(--ss-primary)",
                    borderColor: "var(--ss-primary)",
                  }}
                >
                  Go to Grocery List
                </Link>
              </div>
            ) : (
              <>
                <ul className="list-unstyled mb-0">
                  {list.map((item) => (
                    <li key={item.id} className="mb-1 font-monospace">
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="small text-muted mt-2 mb-0">
                  <Link href="/" className="text-decoration-none">Edit list</Link>
                  {" · "}
                  <Link href="/store-prices" className="text-decoration-none">Compare store prices</Link>
                </p>
              </>
            )}
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
