"use client";

import { GroceryListBuilder } from "./components/GroceryListBuilder";
import { useGroceryListFirestore } from "./hooks/useGroceryListFirestore";
import { useAuth } from "./contexts/AuthContext";
import { calculateBasketTotals } from "./lib/cheapestBasket";
import { dummyPriceDatabase } from "./data/dummyPrices";

export default function GroceryListPage() {
  const { user, authLoading } = useAuth();
  const { list, setList, loading, firebaseError } = useGroceryListFirestore(user);
  const { list, setList, loading, firebaseError } = useGroceryListFirestore();

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
              <h5 className="mb-3">Cheapest basket (preview)</h5>
              <p className="text-muted small mb-2">Demo prices (Aldi, Coles, Woolworths). Algorithm: Le.</p>
              <ul className="list-unstyled mb-2">
                {Object.entries(basketResult.totalsByStore).map(([store, total]) => (
                  <li key={store} className="mb-1">
                    {store} → ${total.toFixed(2)}
                  </li>
                ))}
              </ul>
              {basketResult.bestStore && (
                <p className="mb-0 fw-semibold">Best store: {basketResult.bestStore} (${basketResult.bestTotal.toFixed(2)})</p>
              )}
              {basketResult.missingItems.length > 0 && (
                <p className="text-muted small mb-0 mt-2">No price for: {basketResult.missingItems.join(", ")}</p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
