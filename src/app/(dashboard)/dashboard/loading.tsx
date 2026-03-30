export default function PageLoading() {
  return (
    <div className="space-y-6 max-w-2xl animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-40 bg-muted rounded-md" />
        <div className="h-4 w-56 bg-muted rounded-md" />
      </div>

      {/* Form skeleton */}
      <div className="bg-background border rounded-xl p-6 space-y-4">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="flex gap-2 flex-wrap">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-20 bg-muted rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-muted rounded-md" />
          <div className="h-10 bg-muted rounded-md" />
        </div>
        <div className="h-10 bg-muted rounded-md" />
        <div className="h-10 bg-muted rounded-xl" />
      </div>

      {/* List skeleton */}
      <div className="bg-background border rounded-xl p-6 space-y-4">
        <div className="h-5 w-28 bg-muted rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-1">
            <div className="space-y-1.5">
              <div className="h-5 w-16 bg-muted rounded-full" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
