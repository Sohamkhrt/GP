"use client";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import * as React from "react";
import * as RechartsCore from "recharts";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { z } from "zod/v3";

/**
 * Type for graph variant
 */
type GraphVariant = "default" | "solid" | "bordered";

/**
 * Type for graph size
 */
type GraphSize = "default" | "sm" | "lg";

/**
 * Variants for the Graph component
 */
export const graphVariants = cva(
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

/**
 * Props for the error boundary
 */
interface GraphErrorBoundaryProps {
  children: React.ReactNode;
  className?: string;
  variant?: GraphVariant;
  size?: GraphSize;
}

/**
 * Error boundary for catching rendering errors in the Graph component
 */
class GraphErrorBoundary extends React.Component<
  GraphErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: GraphErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error rendering chart:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className={cn(
            graphVariants({
              variant: this.props.variant,
              size: this.props.size,
            }),
            this.props.className,
          )}
        >
          <div className="p-4 flex items-center justify-center h-full">
            <div className="text-destructive text-center">
              <p className="font-medium">Error loading chart</p>
              <p className="text-sm mt-1">
                An error occurred while rendering. Please try again.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Zod schema for GraphData
 */
export const graphDataSchema = z.object({
  type: z.enum(["bar", "line", "pie"]).describe("Type of graph to render"),
  labels: z.array(z.string()).describe("Labels for the graph"),
  datasets: z
    .array(
      z.object({
        label: z.string().describe("Label for the dataset"),
        data: z.array(z.number()).describe("Data points for the dataset"),
        color: z.string().optional().describe("Optional color for the dataset"),
      }),
    )
    .describe("Data for the graph"),
});

/**
 * Zod schema for Graph
 */
export const graphSchema = z.object({
  data: graphDataSchema.describe(
    "Data object containing chart configuration and values",
  ),
  title: z.string().describe("Title for the chart"),
  showLegend: z
    .boolean()
    .optional()
    .describe("Whether to show the legend (default: true)"),
  variant: z
    .enum(["default", "solid", "bordered"])
    .optional()
    .describe("Visual style variant of the graph"),
  size: z
    .enum(["default", "sm", "lg"])
    .optional()
    .describe("Size of the graph"),
  isCached: z
    .boolean()
    .optional()
    .describe("Whether to fetch data from the local Monza 2023 cache directly in the component"),
  className: z
    .string()
    .optional()
    .describe("Additional CSS classes for styling"),
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type GraphProps = z.infer<typeof graphSchema>;

/**
 * TypeScript type inferred from the Zod schema
 */
export type GraphDataType = z.infer<typeof graphDataSchema>;

/**
 * Default colors for the Graph component.
 *
 * Color handling: our v4 theme defines CSS variables like `--border`,
 * `--muted-foreground`, and `--chart-1` as full OKLCH color values in
 * `globals-v4.css`, so we pass them directly as `var(--token)` to
 * Recharts/SVG props instead of wrapping them in `hsl()`/`oklch()`.
 */
const defaultColors = [
  "hsl(220, 100%, 62%)", // Blue
  "hsl(160, 82%, 47%)", // Green
  "hsl(32, 100%, 62%)", // Orange
  "hsl(340, 82%, 66%)", // Pink
];

/**
 * A component that renders various types of charts using Recharts
 * @component
 * @example
 * ```tsx
 * <Graph
 *   data={{
 *     type: "bar",
 *     labels: ["Jan", "Feb", "Mar"],
 *     datasets: [{
 *       label: "Sales",
 *       data: [100, 200, 300]
 *     }]
 *   }}
 *   title="Monthly Sales"
 *   variant="solid"
 *   size="lg"
 *   className="custom-styles"
 * />
 * ```
 */
export const Graph = React.forwardRef<HTMLDivElement, GraphProps>(
  (
    { className, variant, size, data, title, showLegend = true, isCached, ...props },
    ref,
  ) => {
    const { cachedData, isLoading, error } = useDashboardData(
      isCached,
      React.useCallback((json: any) => {
        const cached = json?.telemetry;
        if (!cached) return null;
        const stride = Math.max(1, Math.floor(cached.samples.length / 300));
        const sampled = cached.samples.filter((_: any, i: number) => i % stride === 0);
        return {
          type: "line",
          labels: sampled.map((s: any) => String(Math.round(s.time || 0))),
          datasets: [
            {
              label: "Speed (km/h)",
              data: sampled.map((s: any) => s.speed),
              color: cached.team_color || "#3b82f6",
            },
          ],
        };
      }, [])
    );

    const activeData = (isCached && cachedData) ? cachedData : data;

    // Use larger size for pie charts or when loading cached telemetry
    const effectiveSize = size ?? ((activeData?.type === "pie" || (isCached && !activeData)) ? "lg" : "default");

    if (isCached && isLoading && !cachedData) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size: effectiveSize as any }), className, "flex items-center justify-center bg-black/40 backdrop-blur-md")}
          {...props}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Syncing Telemetry...</span>
          </div>
        </div>
      );
    }

    // If no data received yet, show loading
    if (!activeData) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size: effectiveSize }), className)}
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="flex items-center gap-1 h-4">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.1s]"></span>
              </div>
              <span className="text-sm">Awaiting data...</span>
            </div>
          </div>
        </div>
      );
    }

    // Check if we have the minimum viable data structure
    const hasValidStructure =
      activeData.type &&
      activeData.labels &&
      activeData.datasets &&
      Array.isArray(activeData.labels) &&
      Array.isArray(activeData.datasets) &&
      activeData.labels.length > 0 &&
      activeData.datasets.length > 0;

    if (!hasValidStructure) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size: effectiveSize }), className)}
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <p className="text-sm">Building chart...</p>
            </div>
          </div>
        </div>
      );
    }

    // Filter datasets to only include those with valid data
    const validDatasets = activeData.datasets.filter(
      (dataset) =>
        dataset.label &&
        dataset.data &&
        Array.isArray(dataset.data) &&
        dataset.data.length > 0,
    );

    if (validDatasets.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size: effectiveSize }), className)}
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <p className="text-sm">Preparing datasets...</p>
            </div>
          </div>
        </div>
      );
    }

    // Use the minimum length between labels and the shortest dataset
    const maxDataPoints = Math.min(
      activeData.labels.length,
      Math.min(...validDatasets.map((d) => d.data.length)),
    );

    // Transform data for Recharts using only available data points
    const chartData = activeData.labels
      .slice(0, maxDataPoints)
      .map((label: string, index: number) => ({
        name: label,
        ...Object.fromEntries(
          validDatasets.map((dataset) => [
            dataset.label,
            dataset.data[index] ?? 0,
          ]),
        ),
      }));

    const renderChart = () => {
      if (!["bar", "line", "pie"].includes(activeData.type)) {
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <p className="text-sm">Unsupported chart type: {activeData.type}</p>
            </div>
          </div>
        );
      }

      switch (activeData.type) {
        case "bar":
          return (
            <RechartsCore.BarChart data={chartData}>
              <RechartsCore.CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <RechartsCore.XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
              />
              <RechartsCore.YAxis
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
              />
              <RechartsCore.Tooltip
                cursor={{
                  fill: "var(--muted-foreground)",
                  fillOpacity: 0.1,
                  radius: 4,
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                }}
              />
              {showLegend && (
                <RechartsCore.Legend
                  wrapperStyle={{
                    color: "var(--foreground)",
                  }}
                />
              )}
              {validDatasets.map((dataset, index) => (
                <RechartsCore.Bar
                  key={`bar-${dataset.label || 'data'}-${index}`}
                  dataKey={dataset.label}
                  fill={
                    dataset.color ?? defaultColors[index % defaultColors.length]
                  }
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              ))}
            </RechartsCore.BarChart>
          );

        case "line":
          return (
            <RechartsCore.LineChart data={chartData}>
              <RechartsCore.CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <RechartsCore.XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
              />
              <RechartsCore.YAxis
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
              />
              <RechartsCore.Tooltip
                cursor={{
                  stroke: "var(--muted)",
                  strokeWidth: 2,
                  strokeOpacity: 0.3,
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                }}
              />
              {showLegend && (
                <RechartsCore.Legend
                  wrapperStyle={{
                    color: "var(--foreground)",
                  }}
                />
              )}
              {validDatasets.map((dataset, index) => (
                <RechartsCore.Line
                  key={`line-${dataset.label || 'data'}-${index}`}
                  type="monotone"
                  dataKey={dataset.label}
                  stroke={
                    dataset.color ?? defaultColors[index % defaultColors.length]
                  }
                  dot={false}
                />
              ))}
            </RechartsCore.LineChart>
          );

        case "pie": {
          // For pie charts, use the first valid dataset
          const pieDataset = validDatasets[0];
          if (!pieDataset) {
            return (
              <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground text-center">
                  <p className="text-sm">No valid dataset for pie chart</p>
                </div>
              </div>
            );
          }

          return (
            <RechartsCore.PieChart>
              <RechartsCore.Pie
                data={pieDataset.data
                  .slice(0, maxDataPoints)
                  .map((value: number, index: number) => ({
                    name: activeData.labels[index],
                    value,
                    fill: defaultColors[index % defaultColors.length],
                  }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
              />
              <RechartsCore.Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                itemStyle={{
                  color: "var(--foreground)",
                }}
                labelStyle={{
                  color: "var(--foreground)",
                }}
              />
              {showLegend && (
                <RechartsCore.Legend
                  wrapperStyle={{
                    color: "var(--foreground)",
                  }}
                />
              )}
            </RechartsCore.PieChart>
          );
        }
      }
    };

    return (
      <GraphErrorBoundary className={className} variant={variant} size={effectiveSize as any}>
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size: effectiveSize as any }), "graph-container relative group", className)}
          {...props}
        >
          <div className="p-4 h-full relative">
            {title && <h3 className="text-lg font-medium mb-4 text-white font-numeric tracking-tight">{title}</h3>}
            <div className="w-full h-[calc(100%-2rem)]">
              <RechartsCore.ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </RechartsCore.ResponsiveContainer>
            </div>
          </div>
        </div>
      </GraphErrorBoundary>
    );
  },
);
Graph.displayName = "Graph";
