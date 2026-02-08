"use client";

import React from "react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { useTamboThread } from "@tambo-ai/react";

export interface QuickActionsPanelProps {
  className?: string;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  className = "",
}) => {
  const { isPending } = useTamboThreadInput();
  const { sendThreadMessage } = useTamboThread();

  const sendActionMessage = React.useCallback(
    async (message: string) => {
      try {
        await sendThreadMessage(message, {
          streamResponse: true,
          additionalContext: {
            maxSteps: 5,
          },
        });
      } catch (error) {
        console.error("Failed to send action message:", error);
      }
    },
    [sendThreadMessage],
  );

  const handleRandomRace = React.useCallback(
    () => {
      // Pick a random race to ensure both tools use the same one
      const FEATURED_RACES = [
        { year: 2023, track: "Silverstone", session: "Q" },
        { year: 2024, track: "Monaco", session: "R" },
        { year: 2023, track: "Monza", session: "R" },
        { year: 2024, track: "Spa", session: "Q" },
        { year: 2023, track: "Hungary", session: "R" },
      ];
      const race = FEATURED_RACES[Math.floor(Math.random() * FEATURED_RACES.length)];
      const message = `Load the featured F1 race: ${race.track} ${race.session} ${race.year}. First fetch getF1TrackMap with year=${race.year}, track="${race.track}", session="${race.session}". Then fetch getRaceResults for the same race. Then fetch getF1Telemetry for the same race and render telemetry for the fastest driver.`;
      sendActionMessage(message);
    },
    [sendActionMessage],
  );

  const handleStrategy = React.useCallback(
    () => sendActionMessage("Fetch the pit strategy for the current race using getF1PitStrategy and render it using the StrategyBar component."),
    [sendActionMessage],
  );

  const handleStats = React.useCallback(
    () => sendActionMessage("Show me telemetry statistics and speed distribution for Monaco 2024 race using getF1Telemetry to display throttle and brake patterns."),
    [sendActionMessage],
  );

  const handleHeatmap = React.useCallback(
    () => sendActionMessage("Display a season heatmap visualization showing performance data across 2024 F1 championship races using getF1Telemetry."),
    [sendActionMessage],
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-xs font-numeric uppercase tracking-wider text-white/40 px-1 mb-1">
        Quick Actions
      </p>

      <button
        onClick={() =>
          sendActionMessage(
            "SYSTEM: High-Performance Mode Requested. Load Monza 2023 cache data using getF1TrackMap, getRaceResults, getF1Telemetry, and getF1PitStrategy with useCache=true. IMMEDIATELY RENDER the following UI components in one go: 1) Racetrack (mode='geometry'), 2) Racetrack (mode='performance'), 3) Standings (race classification), 4) Graph (Type: 'line', X: 'distance', Y: 'speed'), 5) StrategyBar (Monza Strategy). DO NOT ask for clarification or summarize. EMIT THE COMPONENTS."
          )
        }
        disabled={isPending}
        className="w-full px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-numeric text-emerald-400 hover:text-emerald-300 text-left mb-1"
        title="Load pre-processed Monza session"
      >
        🌟 Featured Race: Monza 23
      </button>

      <button
        onClick={handleRandomRace}
        disabled={isPending}
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-numeric text-white/70 hover:text-white/90 text-left"
        title="Load a random featured race"
      >
        🎲 Random Featured Race
      </button>

      <button
        onClick={handleStrategy}
        disabled={isPending}
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-numeric text-white/70 hover:text-white/90 text-left"
        title="Analyze pit stop strategy"
      >
        🏁 Analyze Pit Strategy
      </button>

      <button
        onClick={handleStats}
        disabled={isPending}
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-numeric text-white/70 hover:text-white/90 text-left"
        title="Show statistical distributions"
      >
        📊 Laptime Distribution
      </button>

      <button
        onClick={handleHeatmap}
        disabled={isPending}
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-numeric text-white/70 hover:text-white/90 text-left"
        title="Show season-wide heatmap"
      >
        🔥 Season Heatmap
      </button>
    </div>
  );
};

QuickActionsPanel.displayName = "QuickActionsPanel";
