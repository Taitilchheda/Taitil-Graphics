"""End-to-end pipeline runner after both chunks exist.
Steps: merge (3C) → build+cluster+analyze (4) → label (5) → html (6) → benchmark (8) → cost+cleanup (9)
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

os.chdir(os.path.dirname(os.path.abspath(__file__)) or ".")
os.chdir("..")

OUT = Path("graphify-out")
sys.path.insert(0, ".")
PY = OUT / ".graphify_python"
if PY.exists():
    # Use the graphify interpreter
    py = PY.read_text().strip()
    print(f"interpreter: {py}")

INPUT_PATH = ".skills"

# ---- Step 3C: merge AST + semantic ----
ast = json.loads((OUT / ".graphify_ast.json").read_text())
ch1 = json.loads((OUT / ".graphify_chunk1.json").read_text())
ch2 = json.loads((OUT / ".graphify_chunk2.json").read_text())

seen = {n["id"] for n in ast["nodes"]}
merged_nodes = list(ast["nodes"])
for n in ch1["nodes"] + ch2["nodes"]:
    if n["id"] not in seen:
        merged_nodes.append(n)
        seen.add(n["id"])

merged_edges = ast["edges"] + ch1["edges"] + ch2["edges"]
merged_hyperedges = ch1.get("hyperedges", []) + ch2.get("hyperedges", [])
input_tokens = ch1.get("input_tokens", 0) + ch2.get("input_tokens", 0)
output_tokens = ch1.get("output_tokens", 0) + ch2.get("output_tokens", 0)
merged = {
    "nodes": merged_nodes, "edges": merged_edges, "hyperedges": merged_hyperedges,
    "input_tokens": input_tokens, "output_tokens": output_tokens,
}
(OUT / ".graphify_extract.json").write_text(json.dumps(merged, indent=2))
print(f"[3C] Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges, {len(merged_hyperedges)} hyperedges")

# ---- Step 4: build + cluster + analyze + report ----
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json

detection = json.loads((OUT / ".graphify_detect.json").read_text())
G = build_from_json(merged)
communities = cluster(G)
cohesion = score_all(G, communities)
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: f"Community {cid}" for cid in communities}
questions = suggest_questions(G, communities, labels)

tokens = {"input": input_tokens, "output": output_tokens}
report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, INPUT_PATH, suggested_questions=questions)
(OUT / "GRAPH_REPORT.md").write_text(report)
to_json(G, communities, str(OUT / "graph.json"))

analysis = {
    "communities": {str(k): v for k, v in communities.items()},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": gods,
    "surprises": surprises,
    "questions": questions,
}
(OUT / ".graphify_analysis.json").write_text(json.dumps(analysis, indent=2))
print(f"[4] Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities")

# ---- Step 5: label communities (manual via stdin) ----
# We can't run the interactive Step 5 here. Use auto-generated names based on top labels.
def auto_label(community_nodes):
    """Pick the 2-3 most-connected labels in a community as its name."""
    deg = {}
    for nid in community_nodes:
        for nbr in G.neighbors(nid):
            deg[nbr] = deg.get(nbr, 0) + 1
    top = sorted(deg.items(), key=lambda x: -x[1])[:3]
    return " / ".join(G.nodes[n]["label"].split(" (")[0][:40] for n, _ in top)

auto_labels = {cid: auto_label(nodes) for cid, nodes in communities.items()}
print("[5] auto-generated community labels:")
for cid, lbl in auto_labels.items():
    print(f"    {cid}: {lbl}  ({len(communities[cid])} nodes)")

# Regenerate report with auto labels + questions
questions = suggest_questions(G, communities, auto_labels)
report = generate(G, communities, cohesion, auto_labels, gods, surprises, detection, tokens, INPUT_PATH, suggested_questions=questions)
(OUT / "GRAPH_REPORT.md").write_text(report)
(OUT / ".graphify_labels.json").write_text(json.dumps({str(k): v for k, v in auto_labels.items()}))

# ---- Step 6: HTML visualization ----
from graphify.export import to_html
if G.number_of_nodes() > 5000:
    print(f"[6] Graph has {G.number_of_nodes()} nodes - too large for HTML viz.")
else:
    to_html(G, communities, str(OUT / "graph.html"), community_labels=auto_labels)
    print("[6] graph.html written")

# ---- Step 8: token reduction benchmark (only if total_words > 5000) ----
if detection.get("total_words", 0) > 5000:
    from graphify.benchmark import run_benchmark, print_benchmark
    result = run_benchmark(str(OUT / "graph.json"), corpus_words=detection["total_words"])
    print_benchmark(result)

# ---- Step 9: save manifest, update cost tracker, cleanup ----
from graphify.detect import save_manifest
save_manifest(detection["files"])

cost_path = OUT / "cost.json"
if cost_path.exists():
    cost = json.loads(cost_path.read_text())
else:
    cost = {"runs": [], "total_input_tokens": 0, "total_output_tokens": 0}

cost["runs"].append({
    "date": datetime.now(timezone.utc).isoformat(),
    "input_tokens": input_tokens,
    "output_tokens": output_tokens,
    "files": detection.get("total_files", 0),
})
cost["total_input_tokens"] += input_tokens
cost["total_output_tokens"] += output_tokens
cost_path.write_text(json.dumps(cost, indent=2))

print(f"[9] This run: {input_tokens:,} input, {output_tokens:,} output tokens")
print(f"[9] All time:  {cost['total_input_tokens']:,} input, {cost['total_output_tokens']:,} output ({len(cost['runs'])} runs)")

# Cleanup temp files
for tmp in [".graphify_detect.json", ".graphify_extract.json", ".graphify_ast.json",
            ".graphify_analysis.json", ".graphify_labels.json", ".graphify_cached.json",
            ".graphify_uncached.txt", ".graphify_chunk1.json", ".graphify_chunk2.json",
            ".graphify_semantic_new.json"]:
    p = OUT / tmp
    if p.exists():
        p.unlink()
        print(f"[cleanup] removed {tmp}")

print("\n=== PIPELINE COMPLETE ===")
print(f"Outputs in {OUT}/:")
print(f"  graph.html        - interactive graph, open in browser")
print(f"  GRAPH_REPORT.md   - audit report")
print(f"  graph.json        - raw graph data (survives across sessions)")
print(f"  cost.json         - cumulative token usage")
print(f"  manifest.json     - file manifest for --update")
