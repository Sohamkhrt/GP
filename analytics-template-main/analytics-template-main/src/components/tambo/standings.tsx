import * as React from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { z } from "zod";
import { cn } from "@/lib/utils";

export const standingsSchema = z.object({
  data: z
    .array(
      z.object({
        position: z.union([z.number(), z.string()]),
        driver: z.string(),
        team: z.string().optional(),
        points: z.number().optional(),
        status: z.string().optional(),
        gridPosition: z.number().optional(),
        driverFull: z.string().optional(),
      }),
    )
    .describe("Array of driver standings rows"),
  title: z.string().optional(),
  isCached: z.boolean().optional(),
});

export type StandingsProps = z.infer<typeof standingsSchema> & {
  className?: string;
};

export const Standings: React.FC<StandingsProps> = ({ data = [], title, isCached, className, ...props }) => {
  const { cachedData, isLoading, error } = useDashboardData(
    isCached,
    React.useCallback((json: any) => json?.race_results?.data || null, [])
  );

  const activeData = isCached && cachedData ? cachedData : data;

  if (isCached && isLoading && !cachedData) {
    return (
      <div className={cn("flex flex-col gap-4 p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 min-h-[200px] items-center justify-center", className)}>
        <div className="text-white/40 animate-pulse text-xs font-mono tracking-widest uppercase">Fetching Standings...</div>
      </div>
    );
  }

  return (
    <div className={cn("standings-container w-full p-3 font-numeric", className)} {...props}>
      {title && (
        <h3 className="text-xs font-numeric font-bold mb-3 uppercase tracking-widest text-white">
          {title}
        </h3>
      )}
      <div className="w-full overflow-auto">
        <table className="w-full text-xs table-fixed font-numeric text-slate-100">
          <thead>
            <tr className="text-left text-white font-bold border-b border-white/20">
              <th className="w-8 py-2">#</th>
              <th className="py-2">Driver</th>
              <th className="py-2 text-white/60">Team</th>
              <th className="w-16 text-right py-2">Pts</th>
            </tr>
          </thead>
          <tbody>
            {activeData.map((row: any, i: number) => (
              <tr
                key={`standing-${row.driver || 'none'}-${row.position || i}-${i}`}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-2.5 px-3 text-[11px] font-bold text-white/40 font-mono w-8">{row.position || '-'}</td>
                <td className="py-2.5 px-3 text-[11px] font-bold text-white font-mono">{row.driver || 'N/A'}</td>
                <td className="py-2.5 px-3 text-[11px] text-white/70">{row.team || '-'}</td>
                <td className="py-2.5 px-3 text-right text-[11px] font-bold text-white font-mono">{row.points ?? 0}</td>
              </tr>
            ))}
            {activeData.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[11px] text-white/30 italic">No race results available</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[11px] text-red-400 font-mono italic">Error: {error}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Standings.displayName = "Standings";
