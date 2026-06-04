import osmnx as ox
import json

G = ox.graph_from_place(
    "Semarang, Central Java, Indonesia",  # perluas ke kota
    network_type="drive"
)
# Convert graph ke format node & edge
nodes, edges = ox.graph_to_gdfs(G)

# Export ke JSON
nodes_json = json.loads(nodes.reset_index().to_json())
edges_json = json.loads(edges.reset_index().to_json())

with open('nodes.json', 'w') as f:
    json.dump(nodes_json, f)

with open('edges.json', 'w') as f:
    json.dump(edges_json, f)

print("Done!")