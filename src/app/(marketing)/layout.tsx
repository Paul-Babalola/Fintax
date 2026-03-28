import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fintax — Budget, Expenses & Tax Filing for Nigeria",
  description:
    "Track your income, log expenses, and know your exact NTA 2025 tax position — every month, not just in March. Free to start.",
  openGraph: {
    title: "Fintax — Know Your Tax Position Year-Round",
    description:
      "Budget, expenses, and NTA 2025 tax estimation in one place. Built for Lagos professionals.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
