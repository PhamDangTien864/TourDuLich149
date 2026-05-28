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

export function TourDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-3/4" />
        <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-full" />
        <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-2/3" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function BookingFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-1/4" />
            <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-14 bg-slate-200 rounded-xl animate-pulse" />
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-1/3" />
          <div className="h-3 bg-slate-200 rounded-lg animate-pulse w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-full" />
        <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-5/6" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="h-96 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl animate-pulse" />
  );
}

export function SearchSkeleton() {
  return (
    <div className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
  );
}
