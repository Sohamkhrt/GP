"use client";

import React from "react";

export interface SkeletonLoaderProps {
  title?: string;
  type?: "track" | "chart" | "table" | "custom";
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  title = "Data Link Synchronizing",
  type = "custom",
  className = "",
}) => {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Animated tire spinner */}
      <div className="relative w-16 h-16 mb-6">
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tire tread */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted) / 0.3)"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            strokeDasharray="55 110"
            pathLength="100"
          />

          {/* Tire blocks */}
          {[0, 90, 180, 270].map((angle) => (
            <circle
              key={angle}
              cx={50 + 35 * Math.cos((angle * Math.PI) / 180)}
              cy={50 + 35 * Math.sin((angle * Math.PI) / 180)}
              r="3"
              fill="hsl(var(--muted-foreground) / 0.6)"
            />
          ))}

          {/* Center hub */}
          <circle cx="50" cy="50" r="6" fill="hsl(var(--muted-foreground))" opacity="0.8" />
        </svg>

        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-pulse-subtle opacity-50" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-numeric font-medium text-foreground mb-2">{title}</h3>

      {/* Progress bar */}
      <div className="w-32 h-1 rounded-full bg-muted/20 overflow-hidden mb-4">
        <div className="h-full animate-shimmer rounded-full" />
      </div>

      {/* Data points skeleton based on type */}
      {type === "track" && (
        <div className="space-y-2 w-full max-w-xs">
          <div className="h-2 bg-muted/20 rounded animate-pulse" style={{ width: "75%" }} />
          <div className="h-2 bg-muted/20 rounded animate-pulse" style={{ width: "90%" }} />
          <div className="h-2 bg-muted/20 rounded animate-pulse" style={{ width: "65%" }} />
        </div>
      )}

      {type === "chart" && (
        <div className="flex gap-2 items-end w-full max-w-xs h-12 mb-2">
          {[0.6, 0.8, 0.7, 0.9, 0.5].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-muted/20 rounded animate-pulse"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
      )}

      {type === "table" && (
        <div className="space-y-2 w-full max-w-xs">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 bg-muted/20 rounded animate-pulse" />
          ))}
        </div>
      )}

      {/* Status text */}
      <p className="text-xs text-muted-foreground font-numeric mt-4 text-center">
        Retrieving telemetry data...
      </p>
    </div>
  );
};

SkeletonLoader.displayName = "SkeletonLoader";
