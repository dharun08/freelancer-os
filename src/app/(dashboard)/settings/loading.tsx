import React from 'react';

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-muted/70 rounded-xl" />
        <div className="h-4 w-96 max-w-full bg-muted/50 rounded-lg" />
      </div>

      {/* Tabs bar */}
      <div className="flex space-x-2 border-b border-border pb-4">
        <div className="h-9 w-32 bg-muted/70 rounded-xl" />
        <div className="h-9 w-32 bg-muted/40 rounded-xl" />
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 max-w-4xl">
        <div className="space-y-2 pb-4 border-b border-border">
          <div className="h-5 w-44 bg-muted/70 rounded" />
          <div className="h-3.5 w-64 bg-muted/40 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted/50 rounded" />
            <div className="h-10 w-full bg-muted/30 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted/50 rounded" />
            <div className="h-10 w-full bg-muted/30 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
