import React from 'react';

export default function ClientsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted/70 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-muted/50 rounded-lg" />
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="h-10 w-72 max-w-full bg-muted/50 rounded-xl" />
        <div className="flex items-center space-x-3">
          <div className="h-10 w-32 bg-muted/50 rounded-xl" />
          <div className="h-10 w-28 bg-muted/70 rounded-xl" />
        </div>
      </div>

      {/* Grid of Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 bg-muted/70 rounded-lg" />
                <div className="h-3.5 w-28 bg-muted/50 rounded" />
              </div>
              <div className="h-5 w-16 bg-muted/50 rounded-full" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="h-3.5 w-48 bg-muted/40 rounded" />
              <div className="h-3.5 w-36 bg-muted/40 rounded" />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border/60">
              <div className="h-4 w-20 bg-muted/50 rounded" />
              <div className="h-4 w-24 bg-muted/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
