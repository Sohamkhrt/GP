"use client";

import React from "react";

export interface LegendProps {
  type?: "speed" | "gear" | "drs" | "custom";
  title?: string;
  min?: number;
  max?: number;
  unit?: string;
  className?: string;
}

export const Legend: React.FC<LegendProps> = ({
  type = "speed",
  title,
  min = 0,
  max = 350,
  unit = "km/h",
  className = "",
}) => {
  const renderSpeedLegend = () => (
    <div className="w-full">
      {/* Gradient Bar */}
      <div
        className="h-6 rounded-sm mb-2 border border-border/50"
        style={{
          background:
            "linear-gradient(90deg, hsl(240 100% 50%) 0%, hsl(300 100% 50%) 25%, hsl(0 100% 50%) 50%, hsl(30 100% 50%) 75%, hsl(60 100% 50%) 100%)",
        }}
      />

      {/* Labels */}
      <div className="flex justify-between text-xs font-numeric text-muted-foreground">
        <span>{min}{unit}</span>
        <span className="text-foreground/60">{Math.round((min + max) / 2)}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  const renderGearLegend = () => (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-8 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((gear) => (
          <div
            key={gear}
            className="aspect-square rounded-sm border border-border/50 flex items-center justify-center text-xs font-numeric font-semibold"
            style={{
              backgroundColor: `hsl(${gear * 45} 70% 40%)`,
              color: "white",
            }}
          >
            {gear}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center font-numeric">Gear Selection</p>
    </div>
  );

  const renderDrsLegend = () => (
    <div className="w-full space-y-2">
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-blue-500 border border-border/50" />
          <span className="text-xs font-numeric text-muted-foreground">DRS Closed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-green-500 border border-border/50" />
          <span className="text-xs font-numeric text-muted-foreground">DRS Open</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`rounded-lg border border-border/30 bg-muted/10 p-3 backdrop-blur-sm ${className}`}
    >
      {title && (
        <h3 className="text-xs font-numeric font-semibold text-foreground/80 mb-2 uppercase tracking-widest">
          {title}
        </h3>
      )}

      {type === "speed" && renderSpeedLegend()}
      {type === "gear" && renderGearLegend()}
      {type === "drs" && renderDrsLegend()}
    </div>
  );
};

Legend.displayName = "Legend";
