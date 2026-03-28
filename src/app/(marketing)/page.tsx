"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Styles ───────────────────────────────────────────────────────────────────

const css = `
  :root {
    --green:     #1A6B4A;
    --green-2:   #15583D;
    --green-lt:  #E6F4ED;
    --green-mid: #3D9B6E;
    --amber:     #F59E0B;
    --amber-lt:  #FEF3C7;
    --blue-lt:   #EFF6FF;
    --red-lt:    #FEF2F2;
    --bg:        #F8FAF9;
    --white:     #FFFFFF;
    --ink:       #111827;
    --ink-2:     #374151;
    --ink-3:     #6B7280;
    --border:    #E5EDE9;
    --radius:    14px;
    --radius-lg: 20px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Sora', system-ui, sans-serif;
    background: var(--bg);
    color: var(--ink);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    line-height: 1.15;
  }

  /* ── Animations ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(1.3); }
  }

  .fade-up { animation: fadeUp 0.6s ease both; }
  .d1 { animation-delay: 0.05s; }
  .d2 { animation-delay: 0.12s; }
  .d3 { animation-delay: 0.20s; }
  .d4 { animation-delay: 0.30s; }
  .float { animation: float 4s ease-in-out infinite; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-family: 'Sora', system-ui; font-weight: 600; font-size: 15px;
    border-radius: 10px; text-decoration: none; cursor: pointer;
    transition: all 0.18s ease; border: none; padding: 13px 24px;
  }
  .btn-green  { background: var(--green); color: #fff; }
  .btn-green:hover  { background: var(--green-2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,107,74,0.25); }
  .btn-white  { background: #fff; color: var(--green); }
  .btn-white:hover  { background: var(--green-lt); }
  .btn-ghost  { background: transparent; color: var(--green); border: 1.5px solid var(--green); }
  .btn-ghost:hover  { background: var(--green-lt); }
  .btn-lg { padding: 16px 32px; font-size: 16px; border-radius: 12px; }
  .btn-sm { padding: 9px 18px; font-size: 13px; }

  /* ── Cards ── */
  .card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 28px;
  }
  .card-green {
    background: var(--green); color: #fff;
    border-radius: var(--radius-lg); padding: 28px;
  }

  /* ── Tag / pill ── */
  .pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--green-lt); color: var(--green);
    font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
    padding: 5px 12px; border-radius: 100px;
  }
  .pill-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green);
    animation: pulse-dot 2s ease-in-out infinite;
  }

  /* ── Ticker ── */
  .ticker-outer { overflow: hidden; background: var(--green); padding: 13px 0; }
  .ticker-track {
    display: flex; white-space: nowrap;
    animation: ticker 28s linear infinite;
  }

  /* ── Section layout ── */
  .section { padding: 88px 0; }
  .section-sm { padding: 56px 0; }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  .section-label {
    font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--green); margin-bottom: 14px;
  }
  .section-title {
    font-size: clamp(28px, 4vw, 42px); color: var(--ink);
    margin-bottom: 16px;
  }
  .section-sub {
    font-size: 17px; color: var(--ink-3); max-width: 520px;
    line-height: 1.7;
  }

  /* ── Dashboard mockup ── */
  .mockup-shell {
    background: #fff; border: 1px solid var(--border);
    border-radius: 20px; padding: 22px;
    box-shadow: 0 20px 60px rgba(26,107,74,0.10);
  }
  .mockup-topbar {
    display: flex; align-items: center; gap: 6px; margin-bottom: 18px;
  }
  .mockup-dot {
    width: 9px; height: 9px; border-radius: 50%;
  }
  .bar-track {
    height: 7px; border-radius: 4px;
    background: var(--green-lt); overflow: hidden;
  }
  .bar-fill { height: 100%; border-radius: 4px; }

  /* ── Feature icon box ── */
  .feat-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--green-lt); color: var(--green);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 16px;
  }

  /* ── Step ── */
  .step-num {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--green); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bricolage Grotesque'; font-size: 18px; font-weight: 700;
    flex-shrink: 0;
  }

  /* ── Check list ── */
  .check-row {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 14px; line-height: 1.55; color: var(--ink-2);
  }
  .check-icon {
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--green-lt); color: var(--green);
    font-size: 10px; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; margin-top: 1px;
  }
  .check-icon-white {
    background: rgba(255,255,255,0.15); color: #fff;
  }

  /* ── Pricing ── */
  .price-card {
    background: #fff; border: 1.5px solid var(--border);
    border-radius: 20px; padding: 36px 28px;
    position: relative; height: 100%;
  }
  .price-card.popular {
    background: var(--green); border-color: var(--green);
    color: #fff;
  }
  .popular-badge {
    position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
    background: var(--amber); color: var(--ink);
    font-family: 'Sora'; font-size: 11px; font-weight: 700;
    padding: 4px 14px; border-radius: 100px; white-space: nowrap;
  }

  /* ── Waitlist ── */
  .waitlist-input {
    flex: 1; min-width: 0;
    height: 52px; padding: 0 18px;
    border: 1.5px solid var(--border); border-radius: 10px;
    font-family: 'Sora'; font-size: 15px; color: var(--ink);
    background: #fff; outline: none;
    transition: border-color 0.15s;
  }
  .waitlist-input:focus { border-color: var(--green); }
  .waitlist-input::placeholder { color: var(--ink-3); }

  /* ── NTA callout ── */
  .nta-strip {
    background: var(--green); border-radius: 20px;
    padding: 52px 48px; position: relative; overflow: hidden;
  }
  .nta-strip::after {
    content: 'NTA';
    position: absolute; right: -16px; bottom: -32px;
    font-family: 'Bricolage Grotesque'; font-size: 160px;
    font-weight: 700; color: rgba(255,255,255,0.06);
    line-height: 1; pointer-events: none; user-select: none;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .hero-grid { grid-template-columns: 1fr !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .steps-grid { grid-template-columns: 1fr !important; }
    .pricing-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .nta-strip { padding: 36px 24px; }
    .nta-strip::after { display: none; }
    .nav-links { display: none; }
    .waitlist-form { flex-direction: column !important; }
    .waitlist-form .btn { width: 100%; }
  }
`;

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockBudgets = [
  { label: "Rent",      pct: 100, color: "#EF4444" },
  { label: "Food",      pct: 64,  color: "#1A6B4A" },
  { label: "Transport", pct: 72,  color: "#1A6B4A" },
  { label: "Savings",   pct: 45,  color: "#1A6B4A" },
];

// ─── Waitlist form ────────────────────────────────────────────────────────────

function WaitlistForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("done");
    setMessage("You're on the list! We'll be in touch soon. 🎉");
    setEmail("");
  }

  if (status === "done") {
    return (
      <div style={{
        background: dark ? "rgba(255,255,255,0.12)" : "var(--green-lt)",
        borderRadius: 12, padding: "14px 20px",
        color: dark ? "#fff" : "var(--green)",
        fontWeight: 500, fontSize: 15,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span>✓</span> {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="waitlist-form" style={{ display: "flex", gap: 10 }}>
        <input
          className="waitlist-input"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={dark ? { background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff" } : {}}
        />
        <button
          type="submit"
          className={`btn btn-lg ${dark ? "btn-white" : "btn-green"}`}
          disabled={status === "loading"}
          style={{ height: 52, flexShrink: 0 }}
        >
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      {status === "error" && (
        <p style={{ fontSize: 13, color: dark ? "#FCA5A5" : "#EF4444", marginTop: 8 }}>{message}</p>
      )}
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(248,250,249,0.92)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
            Fin<span style={{ color: "var(--green)" }}>tax</span>
          </span>

          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["#how-it-works", "How it works"], ["#features", "Features"], ["#pricing", "Pricing"]].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-2)", textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/signup" className="btn btn-green btn-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="container">
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>

            {/* Left */}
            <div>
              <div className="pill fade-up d1" style={{ marginBottom: 22 }}>
                <span className="pill-dot" />
                Built for NTA 2025 · Nigeria
              </div>

              <h1 className="fade-up d2" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 20, color: "var(--ink)" }}>
                Your money.
                <br />
                Your taxes.
                <br />
                <span style={{ color: "var(--green)" }}>Finally clear.</span>
              </h1>

              <p className="fade-up d3" style={{ fontSize: 17, color: "var(--ink-3)", lineHeight: 1.75, marginBottom: 32, maxWidth: 460 }}>
                Fintax tracks your income, logs expenses, scans receipts with AI, and
                calculates your exact NTA 2025 tax position — every single month.
                No accountant required.
              </p>

              <div className="fade-up d4" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                <Link href="/signup" className="btn btn-green btn-lg">
                  Start for free →
                </Link>
                <a href="#how-it-works" className="btn btn-ghost btn-lg">
                  See how it works
                </a>
              </div>

              <div className="fade-up d4" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {["Free to start", "No credit card", "NTA 2025 compliant"].map((t) => (
                  <span key={t} style={{ fontSize: 13, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--green)", fontWeight: 700 }}>✓</span> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — dashboard mockup */}
            <div className="float fade-up d3" style={{ position: "relative" }}>
              {/* Glow */}
              <div style={{ position: "absolute", inset: "-30px", background: "radial-gradient(ellipse at 50% 50%, rgba(26,107,74,0.10) 0%, transparent 65%)", zIndex: 0, borderRadius: "50%" }} />

              <div className="mockup-shell" style={{ position: "relative", zIndex: 1 }}>
                {/* Traffic lights */}
                <div className="mockup-topbar">
                  {["#FF5F56","#FFBD2E","#27C93F"].map((c) => (
                    <div key={c} className="mockup-dot" style={{ background: c }} />
                  ))}
                  <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: 8, fontWeight: 500 }}>Fintax Dashboard</span>
                </div>

                {/* Tax widget */}
                <div style={{ background: "var(--green)", borderRadius: 14, padding: "18px 20px", marginBottom: 16, color: "#fff" }}>
                  <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, fontWeight: 500 }}>Estimated tax liability · 2026</p>
                  <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 30, fontWeight: 700 }}>₦837,675</p>
                  <p style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>8.4% effective rate · Monthly: ₦69,806</p>
                </div>

                {/* Deduction saving */}
                <div style={{ background: "var(--green-lt)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>💚</span>
                  <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 500 }}>Deductions saving you ₦185,325</p>
                </div>

                {/* Budget bars */}
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 12 }}>
                  Budget · March 2026
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {mockBudgets.map((b) => (
                    <div key={b.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{b.label}</span>
                        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{b.pct}%</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────────────────────────── */}
      <div className="ticker-outer">
        <div className="ticker-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
              {[
                "Budget tracking",
                "AI receipt scanning",
                "NTA 2025 brackets",
                "WHT credit tracking",
                "Rent relief deduction",
                "Pension deduction",
                "NHF deduction",
                "PDF tax export",
                "Custom categories",
                "Real-time estimates",
                "LIRS & NRS ready",
              ].map((item) => (
                <span key={item} style={{ marginRight: 40 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", marginRight: 40 }}>✦</span>
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { value: "₦800k",  label: "Annual exemption threshold",  bg: "var(--green-lt)", color: "var(--green)" },
              { value: "₦500k",  label: "Max rent relief per year",     bg: "var(--amber-lt)", color: "#B45309"      },
              { value: "25%",    label: "Top PIT rate (NTA 2025)",      bg: "var(--blue-lt)",  color: "#1D4ED8"      },
              { value: "₦100k",  label: "Penalty for non-filing",       bg: "var(--red-lt)",   color: "#DC2626"      },
            ].map((s) => (
              <div key={s.value} style={{ background: s.bg, borderRadius: 14, padding: "22px 20px" }}>
                <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.4 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="section-label">Features</p>
            <h2 className="section-title">Everything in one place</h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              Budget, track expenses, scan receipts, and see your real tax number.
              No spreadsheets. No surprises.
            </p>
          </div>

          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
            {[
              {
                icon: "💰",
                title: "Smart budgeting",
                desc: "Set monthly limits per category. Create unlimited custom ones — Savings, Clothing, Side business. Real-time progress bars warn you at 80%.",
                tags: ["Fixed categories", "Custom categories", "80% alerts"],
              },
              {
                icon: "📸",
                title: "AI receipt scanning",
                desc: "Snap a photo of any receipt. Claude AI reads every line item, suggests categories, detects VAT, and fills the form for you.",
                tags: ["Line-item split", "VAT detection", "Instant entry"],
              },
              {
                icon: "📊",
                title: "Live tax estimate",
                desc: "As you log income, your NTA 2025 PIT estimate updates in real time — deductions applied, WHT credited, net liability shown clearly.",
                tags: ["NTA 2025 brackets", "WHT offset", "PDF export"],
              },
            ].map((f) => (
              <div key={f.title} className="card">
                <div className="feat-icon">{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.7, marginBottom: 16 }}>{f.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {f.tags.map((t) => (
                    <span key={t} style={{ fontSize: 11, fontWeight: 600, background: "var(--green-lt)", color: "var(--green)", padding: "4px 10px", borderRadius: 6 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Wide feature card */}
          <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
            <div>
              <div className="feat-icon">🧾</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Deductions that actually work for you</h3>
              <p style={{ fontSize: 15, color: "var(--ink-3)", lineHeight: 1.7, marginBottom: 20 }}>
                Most Nigerians miss deductions they&apos;re legally entitled to. Fintax
                automatically applies your rent relief, pension contributions, and NHF —
                and shows you exactly how much you&apos;re saving in naira.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Rent relief — 20% of annual rent (max ₦500k)",
                  "Pension — 8% of gross salary (PRA 2014)",
                  "NHF — 2.5% of monthly basic salary",
                  "Life assurance premium — up to 20% of gross",
                ].map((d) => (
                  <div key={d} className="check-row">
                    <div className="check-icon">✓</div>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini breakdown */}
            <div style={{ background: "var(--bg)", borderRadius: 14, padding: 22, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 16 }}>
                Sample calculation · Lagos professional
              </p>
              {[
                { label: "Gross income",    value: "₦6,500,000", accent: false },
                { label: "Rent relief",     value: "− ₦240,000",  accent: true  },
                { label: "Pension (8%)",    value: "− ₦480,000",  accent: true  },
                { label: "NHF (2.5%)",      value: "− ₦162,500",  accent: true  },
                { label: "Taxable income",  value: "₦5,617,500", accent: false },
                { label: "PIT estimate",    value: "₦887,675",   accent: false },
                { label: "WHT credit",      value: "− ₦50,000",  accent: true  },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < 6 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: row.accent ? "var(--green)" : "var(--ink)" }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, background: "var(--green-lt)", borderRadius: 8, padding: "12px 14px", marginTop: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>Net liability</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>₦837,675</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NTA 2025 ─────────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="nta-strip">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", position: "relative", zIndex: 1 }}>
              <div>
                <div className="pill" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", marginBottom: 20 }}>
                  New tax law · June 2025
                </div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: "clamp(24px, 3vw, 36px)", color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
                  Nigeria&apos;s biggest tax reform is live. Fintax is built for it.
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                  The Nigeria Tax Act 2025 replaced FIRS with the NRS, consolidated all
                  major tax laws, and introduced new PIT brackets, a ₦800k exemption,
                  and mandatory digital filing. Fintax applies every single rule
                  automatically.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  "₦800k annual exemption",
                  "Progressive PIT (0–25%)",
                  "20% rent relief (max ₦500k)",
                  "10% WHT on investment income",
                  "8% pension deduction",
                  "Digital e-filing mandate",
                  "NRS replaces FIRS",
                  "Joint Revenue Board",
                ].map((item) => (
                  <div key={item} className="check-row" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                    <div className="check-icon check-icon-white">✓</div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="section-label">How it works</p>
            <h2 className="section-title">Up and running in 3 steps</h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              No accountant, no spreadsheets. Just log and know.
            </p>
          </div>

          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              {
                n: "1",
                title: "Set up your profile",
                desc: "Tell us your state, rent, and pension contribution. Takes under 2 minutes. These unlock every deduction you're entitled to under NTA 2025.",
                color: "var(--green-lt)",
              },
              {
                n: "2",
                title: "Log income & expenses",
                desc: "Add salary, freelance, investment income. Upload a receipt and our AI splits it into line items automatically. Manual entry takes 10 seconds.",
                color: "var(--amber-lt)",
              },
              {
                n: "3",
                title: "See your tax number",
                desc: "Your real-time PIT estimate updates after every entry. See your net monthly liability, deductions saving you money, and export a filing-ready PDF.",
                color: "var(--blue-lt)",
              },
            ].map((step) => (
              <div key={step.n} style={{ background: step.color, borderRadius: 16, padding: "32px 28px" }}>
                <div className="step-num" style={{ marginBottom: 20 }}>{step.n}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="section-label">Pricing</p>
            <h2 className="section-title">Simple pricing, big savings</h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              The average user saves more in tax deductions than the cost of a year of Premium.
            </p>
          </div>

          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 700, margin: "0 auto" }}>
            {/* Free */}
            <div className="price-card">
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}>Free</p>
              <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 44, fontWeight: 700, color: "var(--ink)", lineHeight: 1, marginBottom: 4 }}>₦0</p>
              <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 28 }}>Always free</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {["Budget tracking", "Manual expense entry", "Income log", "3 custom categories"].map((f) => (
                  <div key={f} className="check-row">
                    <div className="check-icon">✓</div>
                    <span style={{ fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                Get started
              </Link>
            </div>

            {/* Premium */}
            <div className="price-card popular">
              <div className="popular-badge">Most popular</div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>Premium</p>
              <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 44, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 4 }}>₦3,500</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 28 }}>per month · 30-day free trial</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "Everything in Free",
                  "NTA 2025 tax estimation",
                  "AI receipt scanning",
                  "WHT tracking & PDF export",
                  "Deduction optimizer",
                  "Unlimited custom categories",
                ].map((f) => (
                  <div key={f} className="check-row">
                    <div className="check-icon check-icon-white">✓</div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn btn-white" style={{ width: "100%", justifyContent: "center" }}>
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Waitlist ─────────────────────────────────────────────────────── */}
      <section id="waitlist" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{
            background: "var(--green)", borderRadius: 24,
            padding: "64px 56px", textAlign: "center",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
              <div className="pill" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", marginBottom: 22 }}>
                🚀 Early access
              </div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: "clamp(26px, 4vw, 40px)", color: "#fff", marginBottom: 14 }}>
                Get early access to Fintax
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 32, lineHeight: 1.7 }}>
                Join professionals across Lagos on the waitlist. Be the first to know
                when we launch new features, and get 3 months of Premium free.
              </p>
              <WaitlistForm dark />
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 14 }}>
                No spam. Unsubscribe any time. Your data is never sold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 20, fontWeight: 700 }}>
            Fin<span style={{ color: "var(--green)" }}>tax</span>
          </span>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
            © {new Date().getFullYear()} Fintax · Built for Nigeria 🇳🇬
          </p>
        </div>
      </footer>
    </>
  );
}
