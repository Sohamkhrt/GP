import argparse
import json
import fastf1
import numpy as np


def to_number(v):
    try:
        return float(v)
    except Exception:
        return 0.0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--track", type=str, required=True)
    parser.add_argument("--session", type=str, required=True)
    parser.add_argument("--driver", type=str, required=False, default="")
    parser.add_argument("--step", type=int, required=False, default=10)
    args = parser.parse_args()

    try:
        import sys
        print(f"Loading FastF1 telemetry: {args.year} {args.track} {args.session} {args.driver}", file=sys.stderr)
        
        session = fastf1.get_session(args.year, args.track, args.session)
        session.load()

        # Pick the fastest lap (or use driver if provided)
        if args.driver:
            laps = session.laps.pick_driver(args.driver)
            if laps.empty:
                lap = session.laps.pick_fastest()
            else:
                lap = laps.pick_fastest()
        else:
            lap = session.laps.pick_fastest()

        step = max(1, int(args.step))
        telemetry = lap.get_telemetry().reset_index().iloc[::step]

        samples = []
        for _, row in telemetry.iterrows():
            samples.append(
                {
                    "time": float(row.get("Time", 0).total_seconds()) if row.get("Time") is not None else 0.0,
                    "speed": to_number(row.get("Speed")),
                    "throttle": to_number(row.get("Throttle")),
                    "brake": to_number(row.get("Brake")),
                    "steering": to_number(row.get("Steering")),
                    "x": to_number(row.get("X")),
                    "y": to_number(row.get("Y")),
                }
            )

        out = {
            "driver": lap.Driver,
            "lap_time": str(lap.LapTime),
            "lap_number": int(lap.LapNumber),
            "samples": samples,
        }

        print(json.dumps(out))
    except Exception as e:
        import sys
        error_msg = str(e)
        print(f"FastF1 Error: {error_msg}", file=sys.stderr)
        
        # Return empty fallback response instead of crashing
        fallback_result = {
            "driver": args.driver or "unknown",
            "lap_time": "N/A",
            "lap_number": 0,
            "samples": [],
            "error": error_msg,
        }
        print(json.dumps(fallback_result))


if __name__ == "__main__":
    main()
