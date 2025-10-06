export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-96 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex space-x-3">
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              <div className="h-10 w-28 bg-muted animate-pulse rounded" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            <div className="h-12 bg-muted animate-pulse rounded" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
