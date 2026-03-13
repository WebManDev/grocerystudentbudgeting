export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-transparent fixed-top">
        <div className="container py-3">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "32px",
                height: "32px",
                background: "#111827",
                color: "#f9fafb",
                fontSize: "0.9rem",
                fontWeight: 700
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
                <a className="nav-link" href="#features">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how-it-works">
                  How it works
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#faq">
                  FAQ
                </a>
              </li>
              <li className="nav-item mt-2 mt-lg-0">
                <a className="btn btn-dark rounded-pill px-3 py-1" href="#waitlist">
                  Join waitlist
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="hero-section">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <div className="mb-3">
                <span className="hero-badge">
                  <span className="hero-badge-dot" />
                  Built for real student life
                </span>
              </div>
              <h1 className="hero-title mb-3">
                Take control of your <span className="hero-highlight">student budget.</span>
              </h1>
              <p className="hero-subtitle mb-4">
                StudentSaver helps you see exactly where your money goes, plan for rent,
                textbooks, and late‑night snacks, and save without spreadsheets or stress.
              </p>
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <a
                  href="#waitlist"
                  className="btn btn-primary btn-lg rounded-pill px-4 py-2"
                  style={{
                    backgroundColor: "var(--ss-primary)",
                    borderColor: "var(--ss-primary)"
                  }}
                >
                  Get early access
                </a>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg rounded-pill px-4 py-2"
                  disabled
                >
                  Demo coming soon
                </button>
              </div>
              <p className="text-muted small mb-1">
                No app yet — you’re early. Join the waitlist and help shape it.
              </p>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <span className="pill">Designed for students</span>
                <span className="pill">Works with real‑world budgets</span>
                <span className="pill">Powered by Firebase (soon)</span>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-card">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <div className="text-muted small mb-1">This month’s snapshot</div>
                    <h5 className="mb-0">Campus Budget Overview</h5>
                  </div>
                  <span className="metric-pill">
                    <span className="text-success me-1">●</span>
                    <strong>On track</strong> for savings
                  </span>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted">Budget used</span>
                    <span className="small fw-semibold">62% of $800</span>
                  </div>
                  <div className="budget-bar">
                    <div className="budget-bar-fill" />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="border rounded-3 p-3">
                      <div className="small text-muted mb-1">Essentials</div>
                      <div className="d-flex justify-content-between align-items-baseline">
                        <span className="fw-semibold">$420</span>
                        <span className="badge bg-light text-dark">Rent &amp; bills</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded-3 p-3">
                      <div className="small text-muted mb-1">Campus life</div>
                      <div className="d-flex justify-content-between align-items-baseline">
                        <span className="fw-semibold">$135</span>
                        <span className="badge bg-light text-dark">Food &amp; coffee</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="category-pill">Textbooks</span>
                  <span className="category-pill">Groceries</span>
                  <span className="category-pill">Clubs</span>
                  <span className="category-pill">Transit</span>
                  <span className="category-pill">Savings</span>
                </div>

                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle border d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <span className="small">🎓</span>
                    </div>
                    <div>
                      <div className="small fw-semibold">StudentSaver</div>
                      <div className="small text-muted">
                        Your future budgeting app — this is a mock preview.
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    Launching soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mt-5 pt-4">
          <div className="container">
            <div className="row align-items-center g-4">
              <div className="col-lg-5">
                <h2 className="fw-bold mb-3">Built around how students actually spend.</h2>
                <p className="text-muted mb-4">
                  StudentSaver is designed for campus life — irregular income, surprise
                  expenses, and that one week where everything seems to be due at once.
                  No financial jargon. No lectures. Just clarity.
                </p>
                <ul className="list-unstyled text-muted">
                  <li className="mb-2">
                    • See your essentials vs. fun spending at a glance.
                  </li>
                  <li className="mb-2">
                    • Plan for big items like rent, textbooks, and trips.
                  </li>
                  <li>• Get gentle nudges before you run out of cash — not after.</li>
                </ul>
              </div>
              <div className="col-lg-7">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="border rounded-4 p-3 h-100 bg-white">
                      <div className="feature-icon mb-3">
                        <span className="fs-5">📊</span>
                      </div>
                      <h5 className="mb-2">Simple budget view</h5>
                      <p className="text-muted small mb-0">
                        One clean dashboard for your monthly budget — no clutter, no
                        spreadsheets, just what matters.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border rounded-4 p-3 h-100 bg-white">
                      <div className="feature-icon mb-3">
                        <span className="fs-5">⚡</span>
                      </div>
                      <h5 className="mb-2">Smart categories</h5>
                      <p className="text-muted small mb-0">
                        Budgets for real categories like groceries, coffee, rideshares, and
                        late‑night pizza.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border rounded-4 p-3 h-100 bg-white">
                      <div className="feature-icon mb-3">
                        <span className="fs-5">🔒</span>
                      </div>
                      <h5 className="mb-2">Secure by design</h5>
                      <p className="text-muted small mb-0">
                        Planned to run on Firebase for secure auth and data storage once
                        the app launches.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border rounded-4 p-3 h-100 bg-white">
                      <div className="feature-icon mb-3">
                        <span className="fs-5">🎯</span>
                      </div>
                      <h5 className="mb-2">Goals you can reach</h5>
                      <p className="text-muted small mb-0">
                        Set realistic savings goals tailored to student budgets — no “skip
                        every latte” pressure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mt-5 pt-4">
          <div className="container">
            <div className="row justify-content-center text-center mb-4">
              <div className="col-lg-7">
                <h2 className="fw-bold mb-3">What using StudentSaver will feel like.</h2>
                <p className="text-muted">
                  The app isn’t live yet, but here’s the flow we’re building — and you can
                  help us shape it by joining early.
                </p>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="border rounded-4 p-4 h-100 bg-white">
                  <span className="badge bg-dark rounded-pill mb-3">Step 1</span>
                  <h5 className="mb-2">Set your real‑world budget</h5>
                  <p className="text-muted small mb-0">
                    Tell StudentSaver what you actually bring in and what you must cover —
                    rent, tuition, groceries, transit, and more.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded-4 p-4 h-100 bg-white">
                  <span className="badge bg-dark rounded-pill mb-3">Step 2</span>
                  <h5 className="mb-2">Track without overthinking</h5>
                  <p className="text-muted small mb-0">
                    Quickly log spending and see how it affects the rest of your month.
                    Visuals over spreadsheets.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded-4 p-4 h-100 bg-white">
                  <span className="badge bg-dark rounded-pill mb-3">Step 3</span>
                  <h5 className="mb-2">Stay ahead, not behind</h5>
                  <p className="text-muted small mb-0">
                    Get a heads‑up before things get tight so you can adjust — not a
                    shame‑y summary after it’s too late.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist */}
        <section id="waitlist" className="mt-5 pt-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="border rounded-4 p-4 p-lg-5 bg-white">
                  <h2 className="fw-bold mb-2">Be one of the first to try it.</h2>
                  <p className="text-muted mb-4">
                    StudentSaver is in active design and planning. Drop your email below
                    and we’ll reach out when the first beta is ready.
                  </p>
                  <form className="row g-2 g-sm-3">
                    <div className="col-sm-8">
                      <label htmlFor="waitlistEmail" className="visually-hidden">
                        Email address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg rounded-pill"
                        id="waitlistEmail"
                        placeholder="you@university.edu"
                        disabled
                      />
                    </div>
                    <div className="col-sm-4 d-grid">
                      <button
                        type="button"
                        className="btn btn-primary btn-lg rounded-pill"
                        style={{
                          backgroundColor: "var(--ss-primary)",
                          borderColor: "var(--ss-primary)"
                        }}
                        disabled
                      >
                        Join waitlist
                      </button>
                    </div>
                  </form>
                  <p className="text-muted small mt-3 mb-0">
                    This is a static landing page — the form is intentionally disabled
                    until the real app and Firebase backend are live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-5 pt-4 mb-5 pb-4">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-5">
                <h2 className="fw-bold mb-3">Questions, answered.</h2>
                <p className="text-muted">
                  Here’s what we can share now. As StudentSaver evolves, this page will be
                  updated with real screenshots and live features.
                </p>
              </div>
              <div className="col-lg-7">
                <div className="accordion" id="faqAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="faqOneHeading">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faqOne"
                        aria-expanded="true"
                        aria-controls="faqOne"
                      >
                        Is StudentSaver live yet?
                      </button>
                    </h2>
                    <div
                      id="faqOne"
                      className="accordion-collapse collapse show"
                      aria-labelledby="faqOneHeading"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        Not yet. What you’re seeing now is a design‑first landing page. The
                        real app is in progress, and we’re using this page to gather
                        interest and design feedback before we launch.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="faqTwoHeading">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faqTwo"
                        aria-expanded="false"
                        aria-controls="faqTwo"
                      >
                        What will you use Firebase for?
                      </button>
                    </h2>
                    <div
                      id="faqTwo"
                      className="accordion-collapse collapse"
                      aria-labelledby="faqTwoHeading"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        Firebase will power authentication, secure data storage, and
                        potentially sync across devices. Right now there’s no backend or
                        data collection — those pieces will only go live once the app is
                        ready for early testers.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="faqThreeHeading">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faqThree"
                        aria-expanded="false"
                        aria-controls="faqThree"
                      >
                        Will it connect to my bank?
                      </button>
                    </h2>
                    <div
                      id="faqThree"
                      className="accordion-collapse collapse"
                      aria-labelledby="faqThreeHeading"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        Bank connections are not planned for the very first version. We
                        want to start with simple, manual‑first budgeting that respects
                        privacy, then explore optional integrations with clear consent if
                        students want them.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="faqFourHeading">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faqFour"
                        aria-expanded="false"
                        aria-controls="faqFour"
                      >
                        How can I give feedback or ideas?
                      </button>
                    </h2>
                    <div
                      id="faqFour"
                      className="accordion-collapse collapse"
                      aria-labelledby="faqFourHeading"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        For now, the best way is to join the waitlist and reply to the
                        first email you receive once we start reaching out. We’d love to
                        hear how you currently manage your money and what would make
                        budgeting feel less stressful.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span className="text-muted small">
            © <span>{year}</span> StudentSaver. All rights reserved.
          </span>
          <span className="text-muted small">
            Built with Bootstrap &amp; Next.js. Backend will use Firebase.
          </span>
        </div>
      </footer>
    </>
  );
}

