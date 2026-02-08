import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";

const execFileAsync = promisify(execFile);

// Fallback for when FastF1 telemetry fails
const getFallbackTelemetryData = (year: number, track: string, session: string, driver: string) => {
  return {
    track: track.toLowerCase(),
    year,
    session,
    driver,
    title: `${track} ${session} ${year} Telemetry (Unavailable)`,
    error: "Telemetry data unavailable - using fallback",
    samples: [],
  };
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = Number(searchParams.get("year") ?? "2023");
  const track = searchParams.get("track") ?? "Silverstone";
  const session = searchParams.get("session") ?? "Q";
  const driver = searchParams.get("driver") ?? "";
  const rawStep = Number(searchParams.get("step") ?? "10");
  const step = Number.isFinite(rawStep) ? Math.max(1, Math.floor(rawStep)) : 10;

  if (!Number.isFinite(year)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const scriptPath = path.join(process.cwd(), "..", "..", "fastf1", "telemetry.py");

  try {
    const args = [
      scriptPath,
      "--year",
      String(year),
      "--track",
      track,
      "--session",
      session,
      "--step",
      String(step),
    ];
    if (driver) args.push("--driver", driver);

    const { stdout, stderr } = await execFileAsync("python", args, {
      timeout: 180000, // 3 minutes timeout for FastF1 session loading
      maxBuffer: 10 * 1024 * 1024,
    });

    // Log stderr for debugging
    if (stderr) {
      console.warn(`[FastF1 Telemetry Script] ${stderr}`);
    }

    const parsed = JSON.parse(stdout);
    
    // Check if the response contains an error (graceful failure from Python)
    if (parsed.error) {
      console.warn(`[Telemetry] FastF1 error for ${year} ${track} ${session} ${driver}: ${parsed.error}`);
      // Return the fallback data but with 200 status so frontend doesn't error
      return NextResponse.json(parsed);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(`[Telemetry] Error loading ${year} ${track} ${session} ${driver}:`, error);
    
    // Return fallback response instead of 500 error to keep dashboard functional
    const fallback = getFallbackTelemetryData(year, track, session, driver);
    return NextResponse.json(fallback);
  }
}
