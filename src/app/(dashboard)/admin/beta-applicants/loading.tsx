import React from 'react';

export default function AdminBetaApplicantsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded-xl" />
        <div className="h-4 w-96 bg-muted/60 rounded-lg" />
      </div>

      {/* Funnel Metrics Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-card border border-border/60 rounded-2xl p-4 space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-6 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Search & Filter skeleton */}
      <div className="h-12 bg-card border border-border/60 rounded-2xl" />

      {/* Table skeleton */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
        <div className="h-8 w-full bg-muted/40 rounded-lg" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full bg-muted/20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
