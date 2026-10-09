export const PortfolioSkeleton = () => (
  <div className="min-h-screen bg-[#FAFAF7] animate-pulse">
    {/* Nav skeleton */}
    <div className="h-16 bg-white border-b border-[#E8DCC8]" />

    {/* Hero skeleton */}
    <div className="min-h-[80vh] flex flex-col md:flex-row items-center justify-center px-8 max-w-6xl mx-auto gap-12">
      <div className="flex-1 space-y-6 max-w-xl w-full">
        <div className="h-5 bg-amber-200/50 rounded-full w-44" />
        <div className="h-14 bg-stone-200 rounded-2xl w-full" />
        <div className="h-14 bg-stone-200 rounded-2xl w-4/5" />
        <div className="h-6 bg-stone-100 rounded-full w-3/4" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 bg-amber-400/40 rounded-xl w-36" />
          <div className="h-12 bg-stone-200 rounded-xl w-36" />
        </div>
      </div>
      <div className="w-64 h-64 md:w-80 md:h-80 bg-amber-100/60 rounded-full shrink-0" />
    </div>
  </div>
);
