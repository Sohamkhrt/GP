import * as React from "react";

/**
 * Shared hook to fetch and cache the Monza 2023 Golden Session data.
 * Prevents multiple components from triggering the same fetch simultaneously.
 */
let dashboardCache: any = null;
let dashboardLock: Promise<any> | null = null;

async function getDashboardData() {
    if (dashboardCache) return dashboardCache;
    if (dashboardLock) return dashboardLock;

    dashboardLock = fetch("/data/monza-2023-cached.json")
        .then((res) => {
            if (!res.ok) {
                const errorMsg = `Dashboard cache not found at /data/monza-2023-cached.json (HTTP ${res.status})`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            }
            return res.json();
        })
        .then((data) => {
            console.log("Successfully hydrated dashboard from cache");
            dashboardCache = data;
            dashboardLock = null;
            return data;
        })
        .catch((err) => {
            console.error("Dashboard hydration critical failure:", err);
            dashboardLock = null;
            throw err;
        });

    return dashboardLock;
}

export function useDashboardData<T>(isCached: boolean | undefined, selector: (data: any) => T) {
    const [cachedData, setCachedData] = React.useState<T | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!isCached) return;

        setIsLoading(true);
        getDashboardData()
            .then((data) => {
                const selected = selector(data);
                // Allow empty arrays or objects, only skip if null/undefined
                if (selected !== null && selected !== undefined) {
                    setCachedData(selected);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [isCached, selector]);

    return { cachedData, isLoading, error };
}
