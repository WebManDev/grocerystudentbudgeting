"use client";

import { useState } from "react";
import { GroceryListBuilder } from "./components/GroceryListBuilder";

export default function HomePage() {
  const year = new Date().getFullYear();

  // Owner: list state lives here so it can be passed to the pricing engine later.
  const [list, setList] = useState([]);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-transparent fixed-top">
        <div className="container py-3">
          <a className="navbar-brand d-flex align-items-center gap-2" href="/">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "32px",
                height: "32px",
                background: "#111827",
                color: "#f9fafb",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              SS
            </span>
            <span>StudentSaver</span>
          </a>
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
              <li className="nav-item">
                <span className="nav-link">Grocery List</span>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="container">
          <GroceryListBuilder list={list} onListChange={setList} />
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
