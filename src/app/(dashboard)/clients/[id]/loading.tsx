import React from 'react';

export default function ClientDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse font-sans">
      {/* Header breadcrumb skeleton */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-muted/60 rounded-xl" />
        <div className="space-y-2">
          <div className="h-8 w-60 bg-muted/70 rounded-xl" />
          <div className="h-4 w-40 bg-muted/50 rounded-lg" />
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-2.5">
            <div className="h-3 w-28 bg-muted/60 rounded" />
            <div className="h-7 w-24 bg-muted/80 rounded-lg" />
            <div className="h-3 w-32 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Detail Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="h-6 w-36 bg-muted/70 rounded pb-2 border-b border-border" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-16 bg-muted/50 rounded" />
                  <div className="h-4 w-48 bg-muted/70 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content column: Linked Projects & Invoices */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="h-6 w-44 bg-muted/70 rounded" />
              <div className="h-4 w-20 bg-muted/50 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/30 border border-border/50 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="h-6 w-44 bg-muted/70 rounded" />
              <div className="h-4 w-20 bg-muted/50 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/30 border border-border/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
