"use client";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import * as React from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { z } from "zod/v3";

const racetrackVariants = cva(
  "w-full rounded-lg overflow-hidden transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background",
        solid: [
          "shadow-lg shadow-zinc-900/10 dark:shadow-zinc-900/20",
          "bg-muted",
        ].join(" "),
        bordered: ["border-2", "border-border"].join(" "),
      },
      size: {
        default: "h-64",
        sm: "h-48",
        lg: "h-96",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const trackPointSchema = z.object({
  x: z.number().describe("X coordinate of a track point"),
  y: z.number().describe("Y coordinate of a track point"),
  // Optional numeric value for this point (e.g., Speed, Gear)
  value: z.number().optional().describe("Optional scalar value for the point"),
  // Optional precomputed color for this point segment
  color: z.string().optional().describe("Optional color for the point (CSS color string)"),
});

export const trackCornerSchema = z.object({
  number: z.union([z.number(), z.string()]).describe("Corner number"),
  letter: z.string().optional().describe("Optional corner letter"),
  x: z.number().describe("Corner X coordinate"),
  y: z.number().describe("Corner Y coordinate"),
  apex_speed: z.number().optional().describe("Minimum speed recorded at this apex"),
});

export const racetrackDataSchema = z.object({
  points: z
    .array(trackPointSchema)
    .min(2)
    .describe("Ordered array of track points forming the track line"),
  corners: z
    .array(trackCornerSchema)
    .optional()
    .describe("Optional corner annotations"),
  closed: z
    .boolean()
    .optional()
    .describe("Whether the track should connect last point to first point"),
  strokeColor: z.string().optional().describe("Track line color"),
  strokeWidth: z.number().optional().describe("Track line width"),
  cornerColor: z.string().optional().describe("Corner marker color"),
  cornerTextColor: z.string().optional().describe("Corner label text color"),
  bounds: z
    .object({
      minX: z.number(),
      maxX: z.number(),
      minY: z.number(),
      maxY: z.number(),
    })
    .optional()
    .describe("Optional precomputed bounds for the track points"),
});

export const racetrackSchema = z.object({
  data: racetrackDataSchema.describe("Track geometry and styling"),
  title: z.string().optional().describe("Optional track title"),
  showCorners: z
    .boolean()
    .optional()
    .describe("Whether corner labels and markers should be shown"),
  padding: z
    .number()
    .optional()
    .describe("Internal SVG padding in viewBox units"),
  variant: z
    .enum(["default", "solid", "bordered"])
    .optional()
    .describe("Visual style variant of the racetrack card"),
  mode: z
    .enum(["geometry", "performance"])
    .optional()
    .default("geometry")
    .describe("Whether to show the track outline or the performance heatmap"),
  size: z
    .enum(["default", "sm", "lg"])
    .optional()
    .describe("Size of the racetrack card"),
  isCached: z
    .boolean()
    .optional()
    .describe("Whether to fetch data from the local Monza 2023 cache directly in the component"),
  className: z.string().optional().describe("Additional CSS classes"),
});

export type RacetrackProps = z.infer<typeof racetrackSchema>;

const buildPath = (points: Array<{ x: number; y: number }>, closed: boolean) => {
  if (points.length === 0) {
    return "";
  }

  const [first, ...rest] = points;
  const segments = [`M ${first.x} ${first.y}`];
  for (const point of rest) {
    segments.push(`L ${point.x} ${point.y}`);
  }
  if (closed) {
    segments.push("Z");
  }
  return segments.join(" ");
};

const computeBounds = (
  points: Array<{ x: number; y: number }>,
  corners: Array<{ x: number; y: number }>,
) => {
  const all = [...points, ...corners];
  const xs = all.map((p) => p.x);
  const ys = all.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  return { minX, minY, width, height };
};

export const Racetrack = React.forwardRef<HTMLDivElement, RacetrackProps>(
  (
    {
      className,
      variant,
      size,
      data,
      title,
      mode = "geometry",
      showCorners = true,
      padding = 300,
      isCached,
      ...props
    },
    ref,
  ) => {
    const [hoveredCorner, setHoveredCorner] = React.useState<any>(null);
    const { cachedData, isLoading, error } = useDashboardData(
      isCached,
      React.useCallback((json: any) => json?.track_map?.data ? { ...json.track_map.data, closed: true } : null, [])
    );

    const activeData = (isCached && cachedData) ? cachedData : data;

    if (isCached && isLoading && !activeData) {
      return (
        <div className={cn(racetrackVariants({ variant, size }), className, "flex items-center justify-center bg-black/40 backdrop-blur-md min-h-[300px]")}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-b-2 border-white/20 rounded-full animate-spin" />
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Constructing Track Map...</span>
          </div>
        </div>
      );
    }

    if (!activeData || !Array.isArray(activeData.points)) {
      return (
        <div
          ref={ref}
          className={cn(racetrackVariants({ variant, size }), className)}
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center text-muted-foreground italic">
            <p className="text-sm">Initializing circuit geometry...</p>
          </div>
        </div>
      );
    }

    const points = activeData.points;
    const corners = activeData.corners ?? [];
    const bounds = activeData.bounds
      ? {
        minX: activeData.bounds.minX,
        minY: activeData.bounds.minY,
        width: Math.max(activeData.bounds.maxX - activeData.bounds.minX, 1),
        height: Math.max(activeData.bounds.maxY - activeData.bounds.minY, 1),
      }
      : computeBounds(points, corners);

    // Calculate dynamic padding if not explicitly provided as a large fixed number
    // Default padding prop is 300. If we use 10% of max dimension, it's more robust.
    const dynamicPadding = Math.max(bounds.width, bounds.height) * 0.1;
    const effectivePadding = (padding === 300) ? dynamicPadding : padding;

    const viewBox = [
      bounds.minX - effectivePadding,
      bounds.minY - effectivePadding,
      bounds.width + effectivePadding * 2,
      bounds.height + effectivePadding * 2,
    ].join(" ");

    const strokeColor = activeData.strokeColor ?? (mode === "performance" ? "#fff" : "hsl(220, 100%, 62%)");
    const strokeWidth = activeData.strokeWidth ?? 120;
    const cornerColor = activeData.cornerColor ?? "hsl(0, 0%, 20%)";
    const cornerTextColor = activeData.cornerTextColor ?? "#ffffff";

    // Speed Heatmap Logic
    const values = points.map((p: any) => p.value).filter((v: any) => v != null) as number[];
    const hasValues = values.length > 0;
    const minVal = hasValues ? Math.min(...values) : 80;
    const maxVal = hasValues ? Math.max(...values) : 330;

    const valueToColor = (v?: number, explicit?: string) => {
      if (explicit) return explicit;
      if (v == null || !hasValues) return strokeColor;
      if (mode === "geometry") return strokeColor;

      const t = minVal === maxVal ? 0.5 : (v - minVal) / (maxVal - minVal);
      // F1 Heatmap: Purple (low) -> Blue -> Teal -> Green -> Yellow (high)
      // For simplicity: HSL hue 280 (purple) to 60 (yellow)
      const hue = 280 - (t * 220);
      return `hsl(${hue} 80% 60%)`;
    };

    const hasSegmentStyling = mode === "performance" || points.some((p: any) => p?.color || p?.value != null);
    const pathData = (mode === "geometry" && !hasSegmentStyling) ? buildPath(points, Boolean(activeData.closed)) : "";

    return (
      <div
        ref={ref}
        className={cn(racetrackVariants({ variant, size }), "racetrack-container relative group", className)}
        {...props}
      >
        <div className="p-4 h-full relative">
          {title && <h3 className="text-lg font-medium mb-4 text-white font-numeric tracking-tight">{title}</h3>}

          <div className={cn("w-full relative", title ? "h-[calc(100%-2rem)]" : "h-full")}>
            <svg
              width="100%"
              height="100%"
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={title ?? "Racetrack"}
              className="drop-shadow-2xl"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="30" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {mode === "geometry" && pathData && (
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="opacity-80"
                />
              )}

              {hasSegmentStyling &&
                points.slice(0, -1).map((p: any, idx: number) => {
                  const p2 = points[idx + 1];
                  const segColor = valueToColor(
                    (p as any).value as number | undefined,
                    (p as any).color as string | undefined,
                  );
                  const key = `seg-${Math.round(p.x)}-${Math.round(p.y)}-${idx}`;
                  return (
                    <line
                      key={key}
                      x1={p.x}
                      y1={p.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={segColor}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  );
                })}

              {showCorners &&
                corners.map((corner: any, index: number) => {
                  const label = `${corner.number}${corner.letter ?? ""}`;
                  const markerRadius = strokeWidth * 0.4;
                  const fontSize = Math.max(strokeWidth * 0.3, 40);

                  return (
                    <g
                      key={`${label}-${index}`}
                      className="cursor-help transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveredCorner(corner)}
                      onMouseLeave={() => setHoveredCorner(null)}
                    >
                      <circle
                        cx={corner.x}
                        cy={corner.y}
                        r={markerRadius}
                        fill={cornerColor}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={strokeWidth * 0.05}
                      />
                      <text
                        x={corner.x}
                        y={corner.y}
                        fill={cornerTextColor}
                        fontSize={fontSize}
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="700"
                        className="pointer-events-none"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
            </svg>

            {/* Corner Tooltip */}
            {hoveredCorner && (
              <div className="absolute top-0 right-0 glass-card p-3 rounded-md animate-fadeInUp z-10">
                <p className="text-xs font-numeric text-muted-foreground uppercase">Corner {hoveredCorner.number}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-numeric">
                    {Math.round(hoveredCorner.apex_speed || 0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">KM/H</span>
                </div>
                <p className="text-[10px] text-accent-foreground font-numeric mt-1 leading-tight">MIN APEX SPEED</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Racetrack.displayName = "Racetrack";
