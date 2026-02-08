"use client";

import React from "react";

export interface DataCardProps {
  type?: "map" | "telemetry" | "standings" | "stats" | "heatmap";
  label?: string;
  description?: string;
  driver?: string;
  session?: string;
  onFocus?: () => void;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  type = "map",
  label,
  description,
  driver,
  session,
  onFocus,
  className = "",
}) => {
  const typeConfig = {
    map: {
      icon: "🗺️",
      defaultLabel: "Track Map",
      defaultDesc: "Circuit layout generated",
      color: "border-blue-500/30 bg-blue-500/5",
    },
    telemetry: {
      icon: "📊",
      defaultLabel: "Telemetry Data",
      defaultDesc: "Speed & lap data ready",
      color: "border-cyan-500/30 bg-cyan-500/5",
    },
    standings: {
      icon: "🏁",
      defaultLabel: "Driver Standings",
      defaultDesc: "Championship data loaded",
      color: "border-emerald-500/30 bg-emerald-500/5",
    },
    stats: {
      icon: "📈",
      defaultLabel: "Statistics Chart",
      defaultDesc: "Distribution analysis ready",
      color: "border-amber-500/30 bg-amber-500/5",
    },
    heatmap: {
      icon: "🔥",
      defaultLabel: "Performance Heatmap",
      defaultDesc: "Season-wide data compiled",
      color: "border-red-500/30 bg-red-500/5",
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`
        rounded-lg border transition-all-smooth cursor-pointer
        hover:shadow-lg hover:scale-105 active:scale-95
        ${config.color}
        ${className}
      `}
      onClick={onFocus}
    >
      <div className="p-3">
        {/* Header with icon and label */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <div>
              <p className="text-xs font-numeric font-semibold text-foreground">
                {label || config.defaultLabel}
              </p>
              {driver && (
                <p className="text-xs font-numeric text-muted-foreground">{driver}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description and session */}
        <p className="text-xs font-numeric text-muted-foreground/80 mb-2">
          {description || config.defaultDesc}
        </p>
        {session && (
          <p className="text-xs font-numeric text-muted-foreground/60">{session}</p>
        )}

        {/* Focus prompt */}
        <div className="mt-2 pt-2 border-t border-current/10">
          <p className="text-xs font-numeric text-muted-foreground/70 text-center hover:text-muted-foreground">
            Click to focus view
          </p>
        </div>
      </div>

      {/* Animated indicator */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 animate-pulse-subtle" />
    </div>
  );
};

DataCard.displayName = "DataCard";
