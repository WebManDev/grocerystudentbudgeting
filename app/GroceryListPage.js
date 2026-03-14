"use client";

import { GroceryListBuilder } from "./components/GroceryListBuilder";
import { useGroceryListFirestore } from "./hooks/useGroceryListFirestore";
import { useAuth } from "./contexts/AuthContext";

export default function GroceryListPage() {
  const { user, authLoading } = useAuth();
  const { list, setList, loading, firebaseError } = useGroceryListFirestore(user);

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
        </>
      )}
    </>
  );
}
