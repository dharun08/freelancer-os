import React from 'react';

export default function FollowUpsLoading() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-muted/70 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-muted/50 rounded-lg" />
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-2">
            <div className="h-3 w-28 bg-muted/60 rounded" />
            <div className="h-7 w-20 bg-muted/80 rounded-lg" />
            <div className="h-3 w-32 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Action controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="h-10 w-64 bg-muted/50 rounded-xl" />
        <div className="h-10 w-36 bg-muted/70 rounded-xl" />
      </div>

      {/* Tasks List Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="h-6 w-40 bg-muted/70 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted/30 border border-border/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
