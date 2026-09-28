import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 font-sans animate-pulse">
      {/* Header and Welcome Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted/70 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-muted/50 rounded-lg" />
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <div className="h-3 w-24 bg-muted/60 rounded" />
              <div className="h-8 w-20 bg-muted/80 rounded-lg" />
              <div className="h-3 w-32 bg-muted/40 rounded" />
            </div>
            <div className="h-11 w-11 bg-muted/50 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-center">
            <div className="space-y-2.5 flex-1">
              <div className="h-3 w-28 bg-muted/60 rounded" />
              <div className="h-6 w-24 bg-muted/80 rounded" />
              <div className="h-3 w-36 bg-muted/40 rounded" />
            </div>
            <div className="h-12 w-12 bg-muted/50 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns: Quick operations & Active contracts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="h-5 w-36 bg-muted/70 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted/40 border border-border/60 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="h-5 w-40 bg-muted/70 rounded" />
              <div className="h-4 w-16 bg-muted/50 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted/30 border border-border/40 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Outreach reminders */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="h-5 w-40 bg-muted/70 rounded" />
              <div className="h-4 w-16 bg-muted/50 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted/30 border border-border/40 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
