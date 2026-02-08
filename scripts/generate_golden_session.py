import argparse
import json
import subprocess
import os

# Configuration for Monza 2023 Golden Session
YEAR = 2023
TRACK = "Monza"
SESSION = "R"
DRIVER = "SAI"  # Carlos Sainz 2023 Monza P3 (Pole sitter)

def run_script(script_path, args):
    cmd = ["python", script_path] + args
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running {script_path}: {result.stderr}")
        return None
    try:
        # FastF1 scripts might print some logs to stderr, so we only parse stdout
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        print(f"Failed to parse JSON from {script_path}")
        return None

def sanitize_json(data):
    """Deep search and replace NaN/Infinity with 0.0 to ensure valid JSON."""
    if isinstance(data, dict):
        return {k: sanitize_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_json(v) for v in data]
    elif isinstance(data, float):
        if not (float("-inf") < data < float("inf")):
            return 0.0
        return data
    return data

def downsample(data, target_count=400):
    """Downsample list if longer than target_count, ensuring the full range is covered."""
    if not isinstance(data, list) or len(data) <= target_count:
        return data
    # Use uniform sampling to include first and last points
    indices = [int(i * (len(data) - 1) / (target_count - 1)) for i in range(target_count)]
    return [data[i] for i in indices]

def main():
    base_dir = r"c:\projectspleasework\febhackathon\genUI\gp"
    fastf1_dir = os.path.join(base_dir, "fastf1")
    
    print(f"Generating Golden Session for {YEAR} {TRACK} {SESSION}...")
    
    # 1. Get Track Map
    track_map = run_script(
        os.path.join(fastf1_dir, "track_map.py"),
        ["--year", str(YEAR), "--track", TRACK, "--session", SESSION]
    )
    if track_map and "data" in track_map and "points" in track_map["data"]:
        track_map["data"]["points"] = downsample(track_map["data"]["points"], 450)
    
    # 2. Get Telemetry for Sainz
    telemetry = run_script(
        os.path.join(fastf1_dir, "telemetry.py"),
        ["--year", str(YEAR), "--track", TRACK, "--session", SESSION, "--driver", DRIVER]
    )
    if telemetry and "samples" in telemetry:
        # Telemetry samples are usually in a 'samples' key
        telemetry["samples"] = downsample(telemetry["samples"], 350)
    
    # 3. Get Race Results
    results = run_script(
        os.path.join(fastf1_dir, "race_results.py"),
        ["--year", str(YEAR), "--track", TRACK, "--session", SESSION]
    )
    
    if track_map and telemetry and results:
        golden_data = {
            "track_map": track_map,
            "telemetry": telemetry,
            "race_results": results,
            "strategy": {
                "title": "Monza 2023 Pit Strategy (Actual)",
                "data": [
                    { "driver": "VER", "stints": [{ "compound": "SOFT", "length": 18 }, { "compound": "HARD", "length": 35 }] },
                    { "driver": "PER", "stints": [{ "compound": "SOFT", "length": 21 }, { "compound": "HARD", "length": 32 }] },
                    { "driver": "SAI", "stints": [{ "compound": "SOFT", "length": 19 }, { "compound": "HARD", "length": 34 }] },
                    { "driver": "LEC", "stints": [{ "compound": "SOFT", "length": 20 }, { "compound": "HARD", "length": 33 }] },
                    { "driver": "RUS", "stints": [{ "compound": "SOFT", "length": 22 }, { "compound": "HARD", "length": 31 }] },
                    { "driver": "HAM", "stints": [{ "compound": "MEDIUM", "length": 27 }, { "compound": "SOFT", "length": 26 }] },
                    { "driver": "ALB", "stints": [{ "compound": "SOFT", "length": 18 }, { "compound": "HARD", "length": 35 }] },
                    { "driver": "NOR", "stints": [{ "compound": "SOFT", "length": 22 }, { "compound": "HARD", "length": 31 }] },
                    { "driver": "ALO", "stints": [{ "compound": "SOFT", "length": 19 }, { "compound": "HARD", "length": 34 }] },
                    { "driver": "PIA", "stints": [{ "compound": "SOFT", "length": 21 }, { "compound": "HARD", "length": 32 }] },
                ]
            },
            "metadata": {
                "year": YEAR,
                "track": TRACK,
                "session": SESSION,
                "driver": DRIVER,
                "description": "Monza 2023 Race - Featured Session (Optimized)"
            }
        }
        
        # Sanitize everything for JSON safety
        golden_data = sanitize_json(golden_data)
        
        output_path = r"c:\projectspleasework\febhackathon\genUI\gp\analytics-template-main\analytics-template-main\public\data\monza-2023-cached.json"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w") as f:
            json.dump(golden_data, f, indent=2)
        
        print(f"Successfully saved Optimized Golden Session to {output_path}")
    else:
        print("Failed to generate complete Golden Session data.")

if __name__ == "__main__":
    main()
