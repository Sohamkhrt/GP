import * as React from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// Schema for the StrategyBar component
export const strategyBarSchema = z.object({
    title: z.string().optional().describe("Title of the strategy visualization"),
    isCached: z.boolean().optional().describe("Whether to fetch data from the local Monza 2023 cache"),
    data: z.array(z.object({
        driver: z.string().describe("Driver code (e.g., VER, HAM)"),
        stints: z.array(z.object({
            compound: z.string().describe("Tire compound used (SOFT, MEDIUM, HARD, etc.)"),
            length: z.number().describe("Number of laps on this compound"),
        })).describe("List of stints for the driver"),
    })).optional().describe("Strategy data for all drivers"),
});

export type StrategyBarProps = z.infer<typeof strategyBarSchema> & {
    className?: string;
};

const getCompoundColor = (compound: string) => {
    switch (compound.toUpperCase()) {
        case 'SOFT': return '#ef4444';   // Red
        case 'MEDIUM': return '#eab308'; // Yellow
        case 'HARD': return '#ffffff';   // White
        case 'INTERMEDIATE':
        case 'INTER': return '#22c55e'; // Green
        case 'WET': return '#3b82f6';    // Blue
        default: return '#64748b';       // Slate
    }
};

export const StrategyBar: React.FC<StrategyBarProps> = ({
    data = [],
    title,
    isCached,
    className,
    ...props
}) => {
    const { cachedData, isLoading, error } = useDashboardData(
        isCached,
        React.useCallback((json: any) => json?.strategy?.data || null, [])
    );

    const activeData = (isCached && cachedData) ? cachedData : (data || []);

    if (isCached && isLoading && !cachedData) {
        return (
            <div className={cn("strategy-container p-6 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center min-h-[100px]", className)}>
                <div className="flex items-center gap-2 text-white/40 animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-xs font-mono uppercase tracking-widest">Hydrating Strategy...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("strategy-container p-4 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10", className)}>
            {title && <h3 className="text-sm font-bold mb-4 text-white/90">{title}</h3>}
            <div className="flex flex-col gap-3">
                {activeData?.map((driver: any, index: number) => (
                    <div key={`driver-${driver.driver || 'none'}-${index}`} className="flex items-center gap-3">
                        <span className="w-10 text-[10px] font-bold text-white/60 font-mono tracking-tighter">{driver.driver || '??'}</span>
                        <div className="flex h-3 flex-1 rounded-sm overflow-hidden bg-white/5 ring-1 ring-white/10">
                            {driver.stints?.map((stint: any, i: number) => (
                                <div
                                    key={`stint-${driver.driver}-${index}-${i}`}
                                    style={{
                                        width: `${(stint.length / 53) * 100}%`,
                                        backgroundColor: getCompoundColor(stint.compound || 'DEFAULT')
                                    }}
                                    className="border-r border-black/40 last:border-0 hover:brightness-110 transition-all opacity-100 shadow-inner"
                                    title={`${stint.compound}: ${stint.length} laps`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                {(!activeData || activeData.length === 0) && !isLoading && (
                    <div key="no-data" className="text-xs text-white/40 italic py-2 text-center">No strategy data available</div>
                )}
                {error && (
                    <div key="error" className="text-xs text-red-400 font-mono py-2 text-center">Error: {error}</div>
                )}
            </div>
        </div>
    );
};
