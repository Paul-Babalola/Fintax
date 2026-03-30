import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-[#1A6B4A] mb-4">404</p>
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          This page doesn&apos;t exist or was moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#1A6B4A] text-white rounded-lg text-sm font-medium hover:bg-[#145a3d] transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
