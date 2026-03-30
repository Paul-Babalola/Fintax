"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            background: "#F8FAF9",
            padding: "24px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <p style={{ fontSize: 64, fontWeight: 700, color: "#1A6B4A", margin: "0 0 12px" }}>
              500
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px", color: "#111827" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#6B7280", marginBottom: 28, lineHeight: 1.6 }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            <button
              onClick={reset}
              style={{
                background: "#1A6B4A", color: "#fff",
                border: "none", borderRadius: 8,
                padding: "12px 24px", fontSize: 14,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
