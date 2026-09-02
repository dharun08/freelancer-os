import React from 'react';

export default function RevenueLoading() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-muted/70 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-muted/50 rounded-lg" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-2">
            <div className="h-3 w-28 bg-muted/60 rounded" />
            <div className="h-7 w-28 bg-muted/80 rounded-lg" />
            <div className="h-3 w-36 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="h-6 w-44 bg-muted/70 rounded" />
          <div className="h-72 w-full bg-muted/30 border border-border/40 rounded-xl" />
        </div>
        <div className="lg:col-span-1 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="h-6 w-40 bg-muted/70 rounded" />
          <div className="h-72 w-full bg-muted/30 border border-border/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
