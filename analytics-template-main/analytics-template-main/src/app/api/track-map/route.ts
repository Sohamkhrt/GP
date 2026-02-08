import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";

const execFileAsync = promisify(execFile);

// Fallback for when FastF1 fails (e.g., unsupported session)
const getFallbackTrackData = (year: number, track: string, session: string) => {
  return {
    track: track.toLowerCase(),
    year,
    session,
    title: `${track} ${session} ${year} (Unavailable)`,
    error: "Track data unavailable - using fallback visualization",
    data: {
      points: [],
      corners: [],
      closed: false,
      strokeColor: "hsl(220, 100%, 62%)",
      strokeWidth: 120,
      cornerColor: "hsl(0, 0%, 40%)",
      cornerTextColor: "#ffffff",
    },
  };
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = Number(searchParams.get("year") ?? "2023");
  const track = searchParams.get("track") ?? "Silverstone";
  const session = searchParams.get("session") ?? "Q";

  if (!Number.isFinite(year)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const scriptPath = path.join(process.cwd(), "..", "..", "fastf1", "track_map.py");

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
      console.warn(`[FastF1 Script] ${stderr}`);
    }

    const parsed = JSON.parse(stdout);
    
    // Check if the response contains an error (graceful failure from Python)
    if (parsed.error) {
      console.warn(`[Track Map] FastF1 error for ${year} ${track} ${session}: ${parsed.error}`);
      // Return the fallback data but with 200 status so frontend doesn't error
      return NextResponse.json(parsed);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(`[Track Map] Error loading ${year} ${track} ${session}:`, error);
    
    // Return fallback response instead of 500 error to keep dashboard functional
    // The frontend will show "Request track map data to begin..." message
    const fallback = getFallbackTrackData(year, track, session);
    return NextResponse.json(fallback);
  }
}

