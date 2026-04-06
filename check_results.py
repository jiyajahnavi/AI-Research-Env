import json

d = json.load(open("inference_results.json"))
print("=== SUMMARY ===")
print(json.dumps(d["summary"], indent=2))
print()
print("=== BASELINE RESULTS ===")
for r in d["baseline_results"]:
    print(f"  {r['task_id']}: score={r['final_score']}")
    if r.get("grading_breakdown"):
        for k, v in r["grading_breakdown"].items():
            print(f"    {k}: {v}")
print()
print("=== RANDOM RESULTS ===")
for r in d["random_results"]:
    print(f"  {r['task_id']}: score={r['final_score']}")
