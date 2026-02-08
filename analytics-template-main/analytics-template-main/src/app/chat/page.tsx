"use client";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";

import { components, tools } from "@/lib/tambo";
import { useTamboThread } from "@tambo-ai/react";
import * as React from "react";

import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import { useSyncExternalStore } from "react";
import { SkeletonLoader } from "@/components/tambo/skeleton-loader";
import { Legend } from "@/components/tambo/legend";

import { QuickActionsPanel } from "@/components/tambo/quick-actions-panel";

const STORAGE_KEY = "tambo-demo-context-key";

function getContextKey(): string {
  let key = localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * Gets or creates a unique context key for thread isolation.
 *
 * NOTE: For production, use `userToken` prop instead of `contextKey`.
 * The userToken integrates with your auth provider (e.g., Better Auth, Clerk)
 * for proper user isolation with token refresh handling.
 *
 * Example:
 *   const userToken = useUserToken(); // from your auth provider
 *   <TamboProvider userToken={userToken} ... />
 */
function useContextKey(): string | null {
  return useSyncExternalStore(subscribe, getContextKey, () => null);
}

/**
 * Home page component that renders the Tambo chat interface.
 *
 * @remarks
 * The `NEXT_PUBLIC_TAMBO_URL` environment variable specifies the URL of the Tambo server.
 * You do not need to set it if you are using the default Tambo server.
 * It is only required if you are running the API server locally.
 *
 * @see {@link https://github.com/tambo-ai/tambo/blob/main/CONTRIBUTING.md} for instructions on running the API server locally.
 */
export default function Home() {
  const mcpServers = useMcpServers();
  const contextKey = useContextKey();

  // Wait for contextKey to be loaded from localStorage
  if (!contextKey) {
    return null;
  }

  return (
    <div className="h-screen flex w-full overflow-hidden bg-[#0b0e14] dark">
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL!}
        components={components}
        tools={tools}
        mcpServers={mcpServers}
        contextKey={contextKey}
      >
        <TamboMcpProvider>
          <DashboardContent />
        </TamboMcpProvider>
      </TamboProvider>
    </div>
  );
}

/**
 * Main dashboard content component that hydrates with initial featured race data
 */
function DashboardContent() {
  const { thread, sendThreadMessage } = useTamboThread();
  // const [isHydrated, setIsHydrated] = React.useState(false);

  /*
  // On mount, automatically load a featured race to populate the dashboard
  React.useEffect(() => {
    // Only hydrate once per session to avoid duplicate messages
    if (isHydrated || thread.messages.length > 0) {
      setIsHydrated(true);
      return;
    }

    // Small delay to ensure all hooks are ready
    const timer = setTimeout(async () => {
      try {
        const hydrationMessage =
          "Load a random featured F1 race for the hackathon demo. First call getF1TrackMap with random=true, then call getRaceResults for the same race, then call getF1Telemetry for the same race and fastest driver.";
        await sendThreadMessage(hydrationMessage, {
          streamResponse: true,
          additionalContext: {
            hidden: true,
            maxSteps: 5,
          },
        });
        setIsHydrated(true);
      } catch (error) {
        console.error("Failed to hydrate dashboard with initial race data:", error);
        // Still mark as hydrated to avoid repeated attempts
        setIsHydrated(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isHydrated, thread.messages.length, sendThreadMessage]);
  */

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#0b0e14]">
      {/* LEFT PANE: Chat Interface (30% width) */}
      <section className="flex flex-col w-[30%] border-r border-white/10 left-pane bg-[#0b0e14] relative z-10 glass-panel">
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <h2 className="font-semibold text-xs uppercase tracking-[0.2em] text-white/40 font-numeric">
            Race Engineer Chat
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Hide rendered components inside chat pane — we teleport them to other panes */}
          <style>{`.left-pane [data-slot="message-rendered-component-area"]{display:none}`}</style>
          <MessageThreadFull />
        </div>
        <div className="flex flex-col gap-4 p-4 border-t border-white/10 bg-white/5">
          <QuickActionsPanel />
        </div>
      </section>

      {/* MIDDLE PANE: Dual Racetrack Map (40% width) */}
      <section className="flex flex-col w-[40%] border-r border-white/10 bg-[#0f1219] relative glass-panel">
        <MetadataHeader />

        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden relative">
          {/* Upper Map: Geometry */}
          <div className="h-1/2 w-full display-panel rounded-xl glass-card relative group overflow-hidden">
            <div className="absolute top-3 left-4 z-10">
              <span className="text-[10px] font-numeric text-white/30 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/5">
                Circuit Geometry
              </span>
            </div>
            <TrackPane mode="geometry" />
          </div>

          {/* Lower Map: Performance */}
          <div className="h-1/2 w-full display-panel rounded-xl glass-card relative group overflow-hidden">
            <div className="absolute top-3 left-4 z-10">
              <span className="text-[10px] font-numeric text-white/30 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/5">
                Speed Heatmap
              </span>
            </div>
            <TrackPane mode="performance" />

            {/* Shared Legend at absolute bottom of middle pane */}
            <div className="absolute bottom-4 right-4 w-40 z-20 scale-90 origin-bottom-right">
              <Legend type="speed" title="Speed" min={80} max={330} unit="km/h" />
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANE: Telemetry & Standings (30% width) */}
      <section className="flex flex-col w-[30%] bg-[#0b0e14] glass-panel">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h2 className="font-semibold text-xs uppercase tracking-[0.2em] text-white/40 font-numeric">
            Telemetry & Analytics
          </h2>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Top half: Telemetry Graph */}
          <div className="h-1/2 rounded-xl border border-white/10 flex items-center justify-center display-panel glass-card relative overflow-hidden group">
            <div className="absolute top-2 left-3 z-10">
              <span className="text-[9px] font-numeric text-white/20 uppercase tracking-widest">Live Trace</span>
            </div>
            <TelemetryPane />
          </div>

          {/* Bottom half: Driver Standings */}
          <div className="h-1/2 rounded-xl border border-white/10 flex items-center justify-center display-panel glass-card relative overflow-hidden group">
            <div className="absolute top-2 left-3 z-10">
              <span className="text-[9px] font-numeric text-white/20 uppercase tracking-widest">Classification</span>
            </div>
            <StandingsPane />
          </div>
        </div>
      </section>
    </main>
  );
}

function extractInnerComponent(renderedComponent: React.ReactNode) {
  if (!React.isValidElement(renderedComponent)) return null;
  const wrapper = renderedComponent as React.ReactElement<{ children?: React.ReactNode }>;
  const inner = wrapper.props?.children ?? null;
  if (!inner || !React.isValidElement(inner)) return null;
  return inner as React.ReactElement;
}

function TrackPane({ mode = "geometry" }: { mode?: "geometry" | "performance" }) {
  const { thread } = useTamboThread();

  const racetrack = React.useMemo(() => {
    if (!thread?.messages) return null;
    for (let i = thread.messages.length - 1; i >= 0; i--) {
      const msg = thread.messages[i];
      if (msg.role !== "assistant" || msg.isCancelled) continue;
      const inner = extractInnerComponent(msg.renderedComponent);
      if (!inner) continue;
      const typeName = (inner.type as any)?.displayName || (inner.type as any)?.name;
      if (typeName === "Racetrack") {
        // Clone the element and inject the mode
        return React.cloneElement(inner, { mode } as any);
      }
    }
    return null;
  }, [thread?.messages, mode]);

  const isLoading = !racetrack && thread?.messages?.some(m => m.role === "assistant" && !m.isCancelled);

  return isLoading ? (
    <SkeletonLoader title={mode === "geometry" ? "Geometry Link..." : "Heatmap Calc..."} type="track" />
  ) : racetrack ? (
    <div className="w-full h-full animate-fadeInUp p-2">{racetrack}</div>
  ) : (
    <div className="h-full w-full flex items-center justify-center text-white/10 uppercase tracking-widest text-[10px] italic">
      Waiting for telemetry...
    </div>
  );
}

function TelemetryPane() {
  const { thread } = useTamboThread();

  const graph = React.useMemo(() => {
    if (!thread?.messages) return null;
    for (let i = thread.messages.length - 1; i >= 0; i--) {
      const msg = thread.messages[i];
      if (msg.role !== "assistant" || msg.isCancelled) continue;
      const inner = extractInnerComponent(msg.renderedComponent);
      if (!inner) continue;
      const typeName = (inner.type as any)?.displayName || (inner.type as any)?.name;
      if (typeName === "Graph") return inner;
    }
    return null;
  }, [thread?.messages]);

  const isLoading = !graph && thread?.messages?.some(m => m.role === "assistant" && !m.isCancelled);

  return isLoading ? (
    <SkeletonLoader title="Telemetry Loading" type="chart" className="p-4" />
  ) : graph ? (
    <div className="w-full h-full animate-fadeInUp">{graph}</div>
  ) : (
    <span className="text-muted-foreground text-xs font-numeric">Telemetry data loading...</span>
  );
}

function StandingsPane() {
  const { thread } = useTamboThread();

  const standings = React.useMemo(() => {
    if (!thread?.messages) return null;
    for (let i = thread.messages.length - 1; i >= 0; i--) {
      const msg = thread.messages[i];
      if (msg.role !== "assistant" || msg.isCancelled) continue;
      const inner = extractInnerComponent(msg.renderedComponent);
      if (!inner) continue;
      const typeName = (inner.type as any)?.displayName || (inner.type as any)?.name;
      if (typeName === "Standings") return inner;
    }
    return null;
  }, [thread?.messages]);

  const isLoading = !standings && thread?.messages?.some(m => m.role === "assistant" && !m.isCancelled);

  return isLoading ? (
    <SkeletonLoader title="Standings Loading" type="table" className="p-4" />
  ) : standings ? (
    <div className="w-full h-full animate-fadeInUp">{standings}</div>
  ) : (
    <span className="text-muted-foreground text-xs font-numeric">Standings data loading...</span>
  );
}
function StatsChartPane() {
  const { thread } = useTamboThread();

  const statsChart = React.useMemo(() => {
    if (!thread?.messages) return null;
    for (let i = thread.messages.length - 1; i >= 0; i--) {
      const msg = thread.messages[i];
      if (msg.role !== "assistant" || msg.isCancelled) continue;
      const inner = extractInnerComponent(msg.renderedComponent);
      if (!inner) continue;
      const typeName = (inner.type as any)?.displayName || (inner.type as any)?.name;
      if (typeName === "StatsChart") return inner;
    }
    return null;
  }, [thread?.messages]);

  return statsChart ? (
    <div className="w-full h-full">{statsChart}</div>
  ) : (
    <span className="text-muted-foreground text-xs">Stats chart will appear here</span>
  );
}

function MetadataHeader() {
  const { thread } = useTamboThread();

  const metadata = React.useMemo(() => {
    if (!thread?.messages) return null;
    for (let i = thread.messages.length - 1; i >= 0; i--) {
      const msg = thread.messages[i];
      if (msg.role !== "assistant" || msg.isCancelled) continue;
      const inner = extractInnerComponent(msg.renderedComponent);
      if (!inner) continue;
      const typeName = (inner.type as any)?.displayName || (inner.type as any)?.name;
      if (typeName === "Racetrack") {
        const data = (inner.props as any)?.data;
        return {
          title: (inner.props as any)?.title || "F1 Circuit",
          year: data?.year || "2024",
          session: data?.session?.toUpperCase() || "QUALIFYING"
        };
      }
    }
    return null;
  }, [thread?.messages]);

  return (
    <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center relative overflow-hidden">
      <div className="flex flex-col">
        <span className="text-[10px] font-numeric text-white/30 uppercase tracking-[0.3em] font-bold">
          Live Analysis
        </span>
        <h2 className="text-xl font-bold font-numeric text-white tracking-widest mt-1">
          {metadata?.title?.toUpperCase() || "CIRCUIT DATA"}
        </h2>
      </div>
      <div className="flex gap-4 items-center">
        <div className="text-right border-l border-white/10 pl-4">
          <span className="block text-[9px] font-numeric text-white/30 uppercase">Session</span>
          <span className="block text-sm font-bold font-numeric text-white tracking-wider">{metadata?.session || "Q1"}</span>
        </div>
        <div className="text-right border-l border-white/10 pl-4 pr-2">
          <span className="block text-[9px] font-numeric text-white/30 uppercase">Year</span>
          <span className="block text-sm font-bold font-numeric text-white tracking-wider">{metadata?.year || "2024"}</span>
        </div>
      </div>
      {/* Decorative pulse dot */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
      </div>
    </div>
  );
}
