"use client";

import { GroceryListBuilder } from "./components/GroceryListBuilder";
import { useGroceryListFirestore } from "./hooks/useGroceryListFirestore";

export default function GroceryListPage() {
  const { list, setList, loading, firebaseError } = useGroceryListFirestore();

  return (
    <>
      {loading ? (
        <p className="text-muted">Loading your list…</p>
      ) : (
        <>
          {firebaseError && (
            <div className="alert alert-warning py-2 mb-3" role="alert">
              <small>List is saved locally only: {firebaseError}</small>
            </div>
          )}
          <GroceryListBuilder list={list} onListChange={setList} />
        </>
      )}
    </>
  );
}
