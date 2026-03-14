"use client";

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "../../firebase/firebase";

const COLLECTION = "groceryLists";

const noop = () => {};

function useGroceryListFirestore() {
  const [list, setListState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const writeList = useCallback(async (uid, newList) => {
    try {
      const ref = doc(db, COLLECTION, uid);
      await setDoc(ref, {
        items: newList,
        updatedAt: serverTimestamp(),
      });
      setFirebaseError(null);
    } catch (err) {
      console.warn("Firestore write failed:", err);
      setFirebaseError(err.message || "Failed to save list");
    }
  }, []);

  const setList = useCallback(
    (nextList) => {
      const newList = typeof nextList === "function" ? nextList(list) : nextList;
      setListState(newList);
      const user = auth.currentUser;
      if (user) {
        writeList(user.uid, newList);
      }
    },
    [list, writeList]
  );

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    async function init() {
      try {
        const user = auth.currentUser;
        const uid = user
          ? user.uid
          : (await signInAnonymously(auth)).user.uid;

        if (cancelled) return;

        const ref = doc(db, COLLECTION, uid);
        const snap = await getDoc(ref);

        if (cancelled) return;

        if (snap.exists() && Array.isArray(snap.data().items)) {
          setListState(snap.data().items);
        }
        setFirebaseError(null);
      } catch (err) {
        if (!cancelled) {
          console.warn("Firestore read failed:", err);
          setFirebaseError(err.message || "Failed to load list");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        init();
      } else {
        signInAnonymously(auth).catch((err) => {
          if (!cancelled) {
            setFirebaseError(err.message || "Auth failed");
            setLoading(false);
          }
        });
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [mounted]);

  if (!mounted) {
    return {
      list: [],
      setList: noop,
      loading: true,
      firebaseError: null,
    };
  }
  return { list, setList, loading, firebaseError };
}

export { useGroceryListFirestore };
