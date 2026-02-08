import argparse
import json
import fastf1
import pandas as pd


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--track", type=str, required=True)
    parser.add_argument("--session", type=str, required=True)
    args = parser.parse_args()

    try:
        import sys
        print(f"Loading FastF1 race results: {args.year} {args.track} {args.session}", file=sys.stderr)
        
        session = fastf1.get_session(args.year, args.track, args.session)
        # Results/classification does not require loading full lap/telemetry payloads.
        session.load(telemetry=False, laps=False)

        # Get the results/classification for this session
        results = session.results
        
        if results.empty:
            # Return empty fallback if no results
            fallback_result = {
                "year": args.year,
                "track": args.track,
                "session": args.session,
                "title": f"{args.track} {args.session} {args.year} Results",
                "error": "No results available for this session",
                "data": [],
            }
            print(json.dumps(fallback_result))
            return

        # Process results into a structured format
        data = []
        for idx, (_, result) in enumerate(results.iterrows()):
            # Qualifying can have NaN in `Position`. Prefer `ClassifiedPosition`,
            # which preserves final order/status as strings (e.g., "1", "2", "R").
            position = ""
            cp = result.get("ClassifiedPosition") or result.get("ClassifiedPos")
            if cp is not None and not pd.isna(cp):
                position = str(cp).strip()

            if not position:
                pos_raw = result.get("Position")
                try:
                    if pos_raw is not None and not pd.isna(pos_raw):
                        position = str(int(pos_raw))
                except Exception:
                    position = ""

            # Final fallback: stable ordering label
            if not position:
                position = str(idx + 1)

            driver_number = str(result.get("DriverNumber", ""))
            driver_short = str(result.get("Abbreviation", "UNK"))
            driver_full = str(result.get("FirstName", "")) + " " + str(result.get("LastName", ""))
            team = str(result.get("TeamName", ""))
            status = str(result.get("Status", ""))

            # Points and grid position may also be NaN; sanitize them
            points_raw = result.get("Points", 0)
            try:
                points = float(points_raw) if points_raw is not None and not pd.isna(points_raw) else 0.0
            except Exception:
                points = 0.0

            grid_raw = result.get("GridPosition")
            try:
                grid_position = int(grid_raw) if grid_raw is not None and not pd.isna(grid_raw) else None
            except Exception:
                grid_position = None

            data.append({
                "position": position,
                "driver": driver_short,
                "driverFull": driver_full.strip() if driver_full.strip() else driver_short,
                "team": team,
                "points": points,
                "status": status,
                "gridPosition": grid_position,
            })

        output = {
            "year": args.year,
            "track": args.track,
            "session": args.session,
            "title": f"{args.track} {args.session} {args.year} Results",
            "data": data,
        }
        print(json.dumps(output))
    except Exception as e:
        import sys
        error_msg = str(e)
        print(f"FastF1 Error: {error_msg}", file=sys.stderr)
        
        # Return empty fallback response instead of crashing
        fallback_result = {
            "year": args.year,
            "track": args.track,
            "session": args.session,
            "title": f"{args.track} {args.session} {args.year} Results",
            "error": error_msg,
            "data": [],
        }
        print(json.dumps(fallback_result))


if __name__ == "__main__":
    main()
