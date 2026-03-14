"use client";

import { GroceryListBuilder } from "./components/GroceryListBuilder";
import { useGroceryListFirestore } from "./hooks/useGroceryListFirestore";
import { useAuth } from "./contexts/AuthContext";
import { calculateBasketTotals } from "./lib/cheapestBasket";
import { dummyPriceDatabase } from "./data/dummyPrices";

export default function GroceryListPage() {
  const { user, authLoading } = useAuth();
  const { list, setList, loading, firebaseError } = useGroceryListFirestore(user);

  const basketResult = list.length > 0 ? calculateBasketTotals(list, dummyPriceDatabase) : null;

  return (
    <>
      {authLoading || loading ? (
        <p className="text-muted">Loading your list…</p>
      ) : !user ? (
        <p className="text-muted mb-0">
          Sign in to create and save your grocery list.
        </p>
      ) : (
        <>
          {firebaseError && (
            <div className="alert alert-warning py-2 mb-3" role="alert">
              <small>List is saved locally only: {firebaseError}</small>
            </div>
          )}
          <GroceryListBuilder list={list} onListChange={setList} />
          {basketResult && (
            <div className="hero-card p-4 mt-4">
              <h5 className="mb-1">Cheapest basket</h5>
              <p className="text-muted small mb-3">Compare the prices at Aldi, Coles, and Woolworths.</p>
              <div className="d-flex gap-2 flex-wrap mb-3">
                {Object.entries(basketResult.totalsByStore)
                  .sort((a, b) => a[1] - b[1])
                  .map(([store, total]) => {
                    const labels = { aldi: "Aldi", coles: "Coles", woolworths: "Woolworths" };
                    const isBest = store === basketResult.bestStore;
                    return (
                      <div
                        key={store}
                        className="text-center px-3 py-2 rounded-3"
                        style={{
                          backgroundColor: isBest ? "var(--ss-accent)" : "#f1f3f5",
                          color: isBest ? "#fff" : "#555",
                          minWidth: 90,
                        }}
                      >
                        <div className="fw-bold small">{labels[store]}</div>
                        <div className="fw-semibold">${total.toFixed(2)}</div>
                        {isBest && <div style={{ fontSize: 10 }}>CHEAPEST</div>}
                      </div>
                    );
                  })}
              </div>
              {basketResult.missingItems.length > 0 && (
                <p className="text-muted small mb-0">No price data for: {basketResult.missingItems.join(", ")}</p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
