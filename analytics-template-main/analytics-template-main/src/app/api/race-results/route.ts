import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";

const execFileAsync = promisify(execFile);

// Fallback for when FastF1 race results fail
const getFallbackRaceResults = (year: number, track: string, session: string) => {
  return {
    year,
    track: track.toLowerCase(),
    session,
    title: `${track} ${session} ${year} Results (Unavailable)`,
    error: "Race results unavailable",
    data: [],
  };
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = Number(searchParams.get("year") ?? "2023");
  const track = searchParams.get("track") ?? "Silverstone";
  const session = searchParams.get("session") ?? "R";

  if (!Number.isFinite(year)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const scriptPath = path.join(process.cwd(), "..", "..", "fastf1", "race_results.py");

  try {
    const { stdout, stderr } = await execFileAsync(
      "python",
      [scriptPath, "--year", String(year), "--track", track, "--session", session],
      {
        timeout: 180000, // 3 minutes timeout for FastF1 session loading
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    // Log stderr for debugging
    if (stderr) {
      console.warn(`[FastF1 Results Script] ${stderr}`);
    }

    const parsed = JSON.parse(stdout);
    
    // Check if the response contains an error (graceful failure from Python)
    if (parsed.error) {
      console.warn(`[Race Results] FastF1 error for ${year} ${track} ${session}: ${parsed.error}`);
      // Return the fallback data but with 200 status so frontend doesn't error
      return NextResponse.json(parsed);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(`[Race Results] Error loading ${year} ${track} ${session}:`, error);
    
    // Return fallback response instead of 500 error to keep dashboard functional
    const fallback = getFallbackRaceResults(year, track, session);
    return NextResponse.json(fallback);
  }
}
