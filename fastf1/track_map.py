import argparse
import json
import math
from typing import Any

import fastf1
import numpy as np


def rotate(xy: np.ndarray, angle: float) -> np.ndarray:
    rot_mat = np.array(
        [[np.cos(angle), np.sin(angle)], [-np.sin(angle), np.cos(angle)]]
    )
    return np.matmul(xy, rot_mat)


def to_number(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--track", type=str, required=True)
    parser.add_argument("--session", type=str, required=True)
    args = parser.parse_args()

    try:
        print(f"Loading FastF1 session: {args.year} {args.track} {args.session}", file=__import__("sys").stderr)
        
        session = fastf1.get_session(args.year, args.track, args.session)
        session.load()

        lap = session.laps.pick_fastest()
        pos = lap.get_pos_data()
        circuit_info = session.get_circuit_info()
        
        # Get position points directly for most accurate loop
        track = pos.loc[:, ("X", "Y")].to_numpy()
        track_angle = math.radians(circuit_info.rotation)
        rotated_track = rotate(track, angle=track_angle)
        
        # Get telemetry for matching speeds
        telemetry = lap.get_telemetry()
        
        points = []
        for i, (x, y) in enumerate(rotated_track):
            # Map speed by index percentage
            speed = 250.0
            if not telemetry.empty:
                tel_idx = min(len(telemetry) - 1, int((i / len(rotated_track)) * (len(telemetry) - 1)))
                speed = to_number(telemetry.iloc[tel_idx].get("Speed", 250))
                
            points.append({
                "x": float(x),
                "y": float(y),
                "value": speed
            })

        xs = rotated_track[:, 0]
        ys = rotated_track[:, 1]
        bounds = {
            "minX": float(np.min(xs)),
            "maxX": float(np.max(xs)),
            "minY": float(np.min(ys)),
            "maxY": float(np.max(ys)),
        }

        corners = []
        offset_vector = np.array([500, 0])
        
        # Calculate minimum speed for each corner (apex speed)
        for _, corner in circuit_info.corners.iterrows():
            number = int(corner["Number"]) if not np.isnan(corner["Number"]) else 0
            letter = str(corner["Letter"]) if corner["Letter"] else ""
            
            c_x = to_number(corner["X"])
            c_y = to_number(corner["Y"])
            
            # Find min speed near this corner
            dists = np.sqrt((telemetry["X"] - c_x)**2 + (telemetry["Y"] - c_y)**2)
            nearest_idx = dists.idxmin()
            window = 20
            start = max(0, nearest_idx - window)
            end = min(len(telemetry), nearest_idx + window)
            apex_speed = float(telemetry.iloc[start:end]["Speed"].min())

            offset_angle = math.radians(to_number(corner["Angle"]))
            offset_x, offset_y = rotate(offset_vector, angle=offset_angle)

            text_x = c_x + float(offset_x)
            text_y = c_y + float(offset_y)
            text_x, text_y = rotate(np.array([text_x, text_y]), angle=track_angle)

            corners.append(
                {
                    "number": number,
                    "letter": letter,
                    "x": float(text_x),
                    "y": float(text_y),
                    "apex_speed": apex_speed
                }
            )

        result = {
            "track": str(args.track).lower(),
            "year": args.year,
            "session": args.session,
            "title": session.event["Location"],
            "data": {
                "points": points,
                "corners": corners,
                "closed": False,
                "strokeColor": "hsl(220, 100%, 62%)",
                "strokeWidth": 120,
                "cornerColor": "hsl(0, 0%, 40%)",
                "cornerTextColor": "#ffffff",
                "rotation": float(track_angle),
                "bounds": bounds,
            },
        }
        print(json.dumps(result))
    except Exception as e:
        import sys
        error_msg = str(e)
        print(f"FastF1 Error: {error_msg}", file=sys.stderr)
        
        # Return empty fallback response instead of crashing
        fallback_result = {
            "track": str(args.track).lower(),
            "year": args.year,
            "session": args.session,
            "title": f"{args.track} {args.session} {args.year} (Data unavailable)",
            "error": error_msg,
            "data": {
                "points": [],  # Empty points will trigger fallback UI
                "corners": [],
                "closed": False,
                "strokeColor": "hsl(220, 100%, 62%)",
                "strokeWidth": 120,
            },
        }
        print(json.dumps(fallback_result))


if __name__ == "__main__":
    main()
