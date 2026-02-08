"use client";

import * as React from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

export const heatmapCellSchema = z.object({
  row: z.string(),
  col: z.string(),
  value: z.number(),
  label: z.string().optional(),
});

export const heatmapSchema = z.object({
  data: z.array(heatmapCellSchema).describe("Array of heatmap cells"),
  title: z.string().optional(),
  colorScheme: z.enum(["blue", "purple", "green", "red"]).optional(),
});

export type HeatmapProps = z.infer<typeof heatmapSchema> & {
  className?: string;
};

const getColorByValue = (value: number, min: number, max: number, scheme: string) => {
  if (max === min) return "bg-blue-900/40";
  const normalized = (value - min) / (max - min);

  // Dark theme color maps optimized for #0b0e14 background
  const colorMap: Record<string, string[]> = {
    blue: [
      "bg-blue-900/20",
      "bg-blue-800/30",
      "bg-blue-700/40",
      "bg-blue-600/60",
      "bg-blue-500/80",
      "bg-blue-400",
    ],
    purple: [
      "bg-purple-900/20",
      "bg-purple-800/30",
      "bg-purple-700/40",
      "bg-purple-600/60",
      "bg-purple-500/80",
      "bg-purple-400",
    ],
    green: [
      "bg-emerald-900/20",
      "bg-emerald-800/30",
      "bg-emerald-700/40",
      "bg-emerald-600/60",
      "bg-emerald-500/80",
      "bg-emerald-400",
    ],
    red: [
      "bg-red-900/20",
      "bg-red-800/30",
      "bg-red-700/40",
      "bg-red-600/60",
      "bg-red-500/80",
      "bg-red-400",
    ],
  };

  const colors = colorMap[scheme] || colorMap.blue;
  const index = Math.floor(normalized * (colors.length - 1));
  return colors[Math.max(0, Math.min(index, colors.length - 1))];
};

export const Heatmap: React.FC<HeatmapProps> = ({
  data = [],
  title,
  colorScheme = "blue",
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <span className="text-white/50 text-sm font-numeric">No data available</span>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Extract unique rows and columns while preserving order
  const rows = Array.from(new Map(data.map((d) => [d.row, d.row])).values());
  const cols = Array.from(new Map(data.map((d) => [d.col, d.col])).values());

  // Create a lookup map for quick access
  const cellMap = new Map<string, (typeof data)[0]>();
  data.forEach((cell) => {
    cellMap.set(`${cell.row}-${cell.col}`, cell);
  });

  return (
    <div className={cn("w-full h-full flex flex-col overflow-auto p-2 font-numeric", className)}>
      {title && (
        <h3 className="text-xs font-numeric font-semibold mb-2 uppercase tracking-wider text-white/60">
          {title}
        </h3>
      )}
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-white/10 p-1 text-left bg-white/5 text-white/60 font-semibold">
                Driver
              </th>
              {cols.map((col, index) => (
                <th
                  key={`col-${col || 'index'}-${index}`}
                  className="border border-white/10 p-1 text-center bg-white/5 text-white/60 font-semibold w-12"
                >
                  {col || '-'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${row || 'index'}-${rowIndex}`}>
                <td className="border border-white/10 p-1 bg-white/5 font-semibold text-xs text-white/70">
                  {row || 'N/A'}
                </td>
                {cols.map((col, colIndex) => {
                  const cell = cellMap.get(`${row}-${col}`);
                  const bgColor = cell
                    ? getColorByValue(cell.value, minValue, maxValue, colorScheme)
                    : "bg-white/5";
                  return (
                    <td
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={cn(
                        "border border-white/10 p-1 text-center text-xs text-white/70 transition-colors hover:opacity-80",
                        bgColor,
                      )}
                      title={cell?.label || String(cell?.value || "")}
                    >
                      {cell ? (Math.round(cell.value * 100) / 100).toFixed(0) : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Heatmap.displayName = "Heatmap";
