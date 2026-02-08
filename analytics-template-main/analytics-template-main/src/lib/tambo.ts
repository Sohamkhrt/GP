/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { Racetrack, racetrackSchema } from "@/components/tambo/racetrack";
import { SelectForm, selectFormSchema } from "@/components/tambo/select-form";
import { Standings, standingsSchema } from "@/components/tambo/standings";
import { StatsChart, statsChartSchema } from "@/components/tambo/stats-chart";
import { Heatmap, heatmapSchema } from "@/components/tambo/heatmap";
import { StrategyBar, strategyBarSchema } from "@/components/tambo/strategy-bar";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import {
  getSalesData,
  getProducts,
  getUserData,
  getKPIs,
  getTrackMapData,
  getStandings,
} from "@/services/analytics-data";
import { getF1TrackMap, getF1Telemetry, getRaceResults, getStrategyData, getPositionChanges, getSeasonSummary, getF1PitStrategy } from "@/services/f1-data";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "getSalesData",
    description:
      "Get monthly sales revenue and units data. Can filter by region (North, South, East, West) or category (Electronics, Clothing, Home)",
    tool: getSalesData,
    toolSchema: z.function().args(
      z
        .object({
          region: z.string().optional(),
          category: z.string().optional(),
        })
        .default({}),
    ),
  },
  {
    name: "getProducts",
    description:
      "Get top products with sales and revenue information. Can filter by category (Electronics, Furniture, Appliances)",
    tool: getProducts,
    toolSchema: z.function().args(
      z
        .object({
          category: z.string().optional(),
        })
        .default({}),
    ),
  },
  {
    name: "getUserData",
    description:
      "Get monthly user growth and activity data. Can filter by segment (Free, Premium, Enterprise)",
    tool: getUserData,
    toolSchema: z.function().args(
      z
        .object({
          segment: z.string().optional(),
        })
        .default({}),
    ),
  },
  {
    name: "getKPIs",
    description:
      "Get key business performance indicators. Can filter by category (Financial, Growth, Quality, Retention, Marketing)",
    tool: getKPIs,
    toolSchema: z.function().args(
      z
        .object({
          category: z.string().optional(),
        })
        .default({}),
    ),
  },
  {
    name: "getTrackMapData",
    description:
      "Get racetrack coordinate and corner data from FastF1 for a specific track/session. Use this before rendering the Racetrack component.",
    tool: getTrackMapData,
    toolSchema: z.function().args(
      z
        .object({
          year: z.number().optional(),
          track: z.string().optional(),
          session: z.string().optional(),
        })
        .default({}),
    ),
  },
  {
    name: "getF1TrackMap",
    description:
      "Fetch F1 track map metadata. Use useCache=true for Monza 2023 instantly; returns a minimal skeleton for the Racetrack component to hydrate directly from cache.",
    tool: getF1TrackMap,
    toolSchema: z.function().args(
      z
        .object({
          year: z.number().optional(),
          track: z.string().optional(),
          session: z.string().optional(),
          random: z.boolean().optional().describe("Pick a random featured race"),
          useCache: z.boolean().optional().describe("Use the pre-processed high-performance JSON cache"),
        })
        .default({}),
    ),
  },
  {
    name: "getF1Telemetry",
    description:
      "Fetch telemetry metadata. Use useCache=true for Monza 2023; returns a minimal skeleton for the Graph component to hydrate directly from cache.",
    tool: getF1Telemetry,
    toolSchema: z.function().args(
      z
        .object({
          year: z.number().optional(),
          track: z.string().optional(),
          session: z.string().optional(),
          driver: z.string().optional(),
          random: z.boolean().optional().describe("Pick a random featured race"),
          useCache: z.boolean().optional().describe("Use the pre-processed high-performance JSON cache"),
        })
        .default({}),
    ),
  },
  {
    name: "getRaceResults",
    description:
      "Fetch race results metadata. Use useCache=true for Monza 2023 instantly; returns a minimal skeleton for the Standings component to hydrate directly from cache.",
    tool: getRaceResults,
    toolSchema: z.function().args(
      z
        .object({
          year: z.number().optional(),
          track: z.string().optional(),
          session: z.string().optional(),
          random: z.boolean().optional().describe("Pick a random featured race"),
          useCache: z.boolean().optional().describe("Use the pre-processed high-performance JSON cache"),
        })
        .default({}),
    ),
  },
  {
    name: "getF1PitStrategy",
    description:
      "Fetch tire stint strategies for all drivers. Use useCache=true for Monza 2023; returns a minimal skeleton for the StrategyBar component.",
    tool: getF1PitStrategy,
    toolSchema: z.function().args(
      z
        .object({
          year: z.number().optional(),
          track: z.string().optional(),
          session: z.string().optional(),
          useCache: z.boolean().optional().describe("Use the pre-processed high-performance JSON cache"),
        })
        .default({}),
    ),
  },
  {
    name: "getStandings",
    description: "Get current driver standings (mocked).",
    tool: getStandings,
    toolSchema: z.function().args(
      z
        .object({
          season: z.number().optional(),
          championship: z.enum(["drivers", "constructors"]).optional(),
        })
        .default({}),
    ),
  },
  {
    name: "getStrategyData",
    description:
      "Get pit stop strategy data for drivers including compound and stint lengths. Use for rendering tire strategy visualizations.",
    tool: getStrategyData,
    toolSchema: z.function().args(
      z
        .object({
          season: z.number().optional(),
        })
        .default({}),
    ),
  },
  {
    name: "getPositionChanges",
    description:
      "Get driver position changes throughout a race (lap-by-lap). Use for rendering position change line charts.",
    tool: getPositionChanges,
    toolSchema: z.function().args(
      z
        .object({
          season: z.number().optional(),
        })
        .default({}),
    ),
  },
  {
    name: "getSeasonSummary",
    description:
      "Get season-wide race results heatmap data (points by driver and race). Use for rendering heatmap visualizations of championship standings.",
    tool: getSeasonSummary,
    toolSchema: z.function().args(
      z
        .object({
          season: z.number().optional(),
        })
        .default({}),
    ),
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "Use this when you want to display a chart. It supports bar, line, and pie charts. When you see data generally use this component. IMPORTANT: When asked to create a graph, always generate it first in the chat - do NOT add it directly to the canvas/dashboard. Let the user decide if they want to add it.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "SelectForm",
    description:
      "Use this when you need user input, but do not block data fetching tools if the user's intent is already clear. Use this component instead of listing options as bullet points. For yes/no or single-choice questions, use mode='single'. For questions where the user can select multiple options, use mode='multi' (default). Each group has a label (the question) and options (the choices). Examples: 'Would you like to continue?' with Yes/No options, or 'Which regions interest you?' with multiple region options.",
    component: SelectForm,
    propsSchema: selectFormSchema,
  },
  {
    name: "Racetrack",
    description:
      "Use this when you need to render motorsport or map-like track geometry from XY coordinate points. Supports optional corner marker labels.",
    component: Racetrack,
    propsSchema: racetrackSchema,
  },
  {
    name: "Standings",
    description: "Driver standings leaderboard. Use for showing rankings and points.",
    component: Standings,
    propsSchema: standingsSchema,
  },
  {
    name: "StatsChart",
    description:
      "Use for displaying statistical distributions and summary statistics. Supports mean, median, min, max values. Ideal for lap time distributions, performance ranges, or comparative statistics.",
    component: StatsChart,
    propsSchema: statsChartSchema,
  },
  {
    name: "Heatmap",
    description:
      "Use for 2D grid visualizations with color-coded values. Great for season-wide points tracking, driver performance comparisons, or any row-column data with numeric values.",
    component: Heatmap,
    propsSchema: heatmapSchema,
  },
  {
    name: "StrategyBar",
    description: "Display pit stop and tire compound strategies for all drivers.",
    component: StrategyBar,
    propsSchema: strategyBarSchema,
  },
  // Add more components here
];
