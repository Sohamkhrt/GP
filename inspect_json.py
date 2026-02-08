import json
path = r"c:\projectspleasework\febhackathon\genUI\gp\analytics-template-main\analytics-template-main\public\data\monza-2023-cached.json"
with open(path, 'r') as f:
    data = json.load(f)

print(f"Track map points: {len(data['track_map']['data']['points'])}")
print(f"Bounded points: {len(data['track_map']['data']['points'])}")
print(f"Closed: {data['track_map']['data']['closed']}")
print(f"Bounds in JSON: {data['track_map']['data']['bounds']}")

# Check first and last point distance
p1 = data['track_map']['data']['points'][0]
pn = data['track_map']['data']['points'][-1]
dist = ((p1['x']-pn['x'])**2 + (p1['y']-pn['y'])**2)**0.5
print(f"Gap between start and end: {dist}")

# Check value range
vals = [p.get('value', 0) for p in data['track_map']['data']['points']]
print(f"Speed range: {min(vals)} to {max(vals)}")
