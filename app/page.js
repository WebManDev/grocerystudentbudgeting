"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
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
          <div className="hero-card p-4 mt-4 text-center">
            <Link
              href="/budget"
              className="btn btn-primary btn-lg"
              style={{
                backgroundColor: "var(--ss-primary)",
                borderColor: "var(--ss-primary)",
              }}
            >
              Finalise list & go to Budget
            </Link>
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
