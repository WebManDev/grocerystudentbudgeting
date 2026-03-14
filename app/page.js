"use client";

import dynamic from "next/dynamic";
import { AppNav } from "./components/AppNav";

// Load Firestore-backed list only on client to avoid SSR "window is not defined"
const GroceryListPage = dynamic(
  () => import("./GroceryListPage"),
  { ssr: false }
);

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      <AppNav currentPath="/" />

      <main className="hero-section">
        <div className="container">
          <GroceryListPage />
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
