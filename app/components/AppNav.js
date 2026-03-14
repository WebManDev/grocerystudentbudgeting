"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Grocery List" },
  { href: "/store-prices", label: "Store Prices" },
];

export function AppNav({ currentPath = "/" }) {
  return (
    <nav className="navbar navbar-expand-lg bg-transparent fixed-top">
      <div className="container py-3">
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          href="/"
        >
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
        </Link>
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
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href} className="nav-item">
                <Link
                  href={href}
                  className={`nav-link ${currentPath === href ? "fw-semibold" : ""}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
