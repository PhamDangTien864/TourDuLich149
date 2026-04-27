export function TourCardSkeleton() {
  return (
    <div className="group block">
      <div className="relative h-[450px] rounded-[50px] overflow-hidden mb-8 bg-slate-200 animate-pulse" />
      <div className="space-y-3 px-2">
        <div className="h-8 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-6 bg-slate-200 rounded-lg w-1/2 animate-pulse" />
        <div className="h-8 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
      </div>
    </div>
  );
}

export function TourTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl animate-pulse">
          <div className="w-12 h-12 bg-slate-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-20 bg-slate-200 animate-pulse" />
      <div className="container mx-auto px-4 py-24">
        <div className="h-16 bg-slate-200 rounded-2xl mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
          {[...Array(6)].map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
