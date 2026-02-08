"use client";

import * as React from "react";
import { z } from "zod";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const statsChartSchema = z.object({
  data: z
    .array(
      z.object({
        name: z.string(),
        mean: z.number().optional(),
        median: z.number().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        q1: z.number().optional(),
        q3: z.number().optional(),
      }),
    )
    .describe("Array of statistical data points"),
  title: z.string().optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
});

export type StatsChartProps = z.infer<typeof statsChartSchema> & {
  className?: string;
};

export const StatsChart: React.FC<StatsChartProps> = ({
  data = [],
  title,
  xLabel = "Category",
  yLabel = "Value",
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <span className="text-white/50 text-sm font-numeric">No data available</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col ${className ?? ""}`}>
      {title && (
        <h3 className="text-xs font-numeric font-semibold mb-2 uppercase tracking-wider text-white/60">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          style={{ background: "transparent" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'JetBrains Mono'" }}
          />
          <YAxis
            label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)" }}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'JetBrains Mono'" }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 18, 25, 0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              fontFamily: "'JetBrains Mono'",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.7)" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="square"
          />
          {data.some((d) => d.median != null) && (
            <Bar dataKey="median" fill="#a78bfa" name="Median" radius={[4, 4, 0, 0]} />
          )}
          {data.some((d) => d.mean != null) && (
            <Bar dataKey="mean" fill="#60a5fa" name="Mean" radius={[4, 4, 0, 0]} />
          )}
          {data.some((d) => d.max != null) && (
            <Bar dataKey="max" fill="#f87171" name="Max" radius={[4, 4, 0, 0]} />
          )}
          {data.some((d) => d.min != null) && (
            <Bar dataKey="min" fill="#34d399" name="Min" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

StatsChart.displayName = "StatsChart";
