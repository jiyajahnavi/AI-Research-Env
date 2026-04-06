import re
from typing import List
from tasks import get_task

# ─────────────────────────────────────────────

# 🔹 TEXT UTILS

# ─────────────────────────────────────────────


def _normalize(text: str) -> List[str]:
    return re.findall(r"\w+", text.lower())


def _semantic_overlap(text: str, keywords: list) -> float:
    if not text or not keywords:
        return 0.0
    words = set(_normalize(text))
    matches = sum(1 for kw in keywords if any(w in words for w in _normalize(kw)))
    return min(matches / len(keywords), 1.0)


def _soft_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    wa, wb = set(_normalize(a)), set(_normalize(b))
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / len(wa | wb)


# ─────────────────────────────────────────────

# 🔹 CORE COMPONENTS

# ─────────────────────────────────────────────


def _hypothesis_quality(state, task):
    return _semantic_overlap(
        state.get("current_hypothesis", ""),
        task.get("ground_truth_keywords", []),
    )


def _experiment_quality(state, task):
    experiments = state.get("experiments_run", [])
    if not experiments:
        return 0.0

    unique = set((e.get("method_id"), e.get("dataset_id")) for e in experiments)
    diversity = len(unique) / len(experiments)

    optimal = task.get("optimal_method")
    found_optimal = any(e.get("method_id") == optimal for e in experiments)

    repetition_penalty = 0.0
    if len(unique) < len(experiments) * 0.6:
        repetition_penalty = 0.2

    return max(
        min(0.6 * diversity + 0.4 * found_optimal - repetition_penalty, 1.0), 0.0
    )


def _improvement_score(state, task):
    baseline = task.get("baseline_accuracy", 0.0)
    optimal = task.get("optimal_accuracy", 1.0)
    achieved = state.get("best_accuracy", 0.0)

    if optimal <= baseline:
        return 1.0 if achieved >= optimal else 0.0

    gain = max(achieved - baseline, 0.0)
    return min(gain / (optimal - baseline), 1.0)


def _trajectory_learning(state):
    history = state.get("experiments_run", [])
    if len(history) < 2:
        return 0.0

    improvements = 0
    prev = 0.0

    for exp in history:
        acc = exp.get("accuracy", 0.0)
        if acc > prev:
            improvements += 1
        prev = acc

    return min(improvements / len(history), 1.0)


def _reasoning_quality(state):
    actions = [a.get("action_type") for a in state.get("action_history", [])]

    if not actions:
        return 0.0

    score = 0.0

    if "read_paper" in actions and "propose_hypothesis" in actions:
        if actions.index("read_paper") < actions.index("propose_hypothesis"):
            score += 0.3

    if "design_experiment" in actions and "run_experiment" in actions:
        if actions.index("design_experiment") < actions.index("run_experiment"):
            score += 0.3

    if "analyze_results" in actions:
        score += 0.2

    if "refine_hypothesis" in actions:
        score += 0.2

    return min(score, 1.0)


def _final_answer_quality(state, task):
    answer = state.get("final_answer", "")
    return 0.5 * _semantic_overlap(
        answer, task.get("ground_truth_keywords", [])
    ) + 0.5 * _soft_similarity(answer, task.get("ground_truth_hypothesis", ""))


# ─────────────────────────────────────────────

# 🔹 MAIN GRADER

# ─────────────────────────────────────────────


def grade_episode(state_dict: dict) -> float:
    try:
        task = get_task(state_dict["task_id"])
    except:
        return 0.0

    difficulty = task["difficulty"]

    h = _hypothesis_quality(state_dict, task)
    e = _experiment_quality(state_dict, task)
    i = _improvement_score(state_dict, task)
    r = _reasoning_quality(state_dict)
    f = _final_answer_quality(state_dict, task)
    t = _trajectory_learning(state_dict)

    weights = {
        "easy": (0.25, 0.15, 0.30, 0.10, 0.10, 0.10),
        "medium": (0.20, 0.20, 0.25, 0.10, 0.15, 0.10),
        "hard": (0.15, 0.25, 0.20, 0.10, 0.20, 0.10),
    }

    w = weights.get(difficulty, weights["medium"])

    score = w[0] * h + w[1] * e + w[2] * i + w[3] * r + w[4] * f + w[5] * t

    if not state_dict.get("final_answer"):
        score *= 0.6

    return round(max(min(score, 1.0), 0.0), 4)


def grade_task(state_dict: dict) -> dict:
    task = get_task(state_dict["task_id"])

    return {
        "score": grade_episode(state_dict),
        "components": {
            "hypothesis": _hypothesis_quality(state_dict, task),
            "experiment": _experiment_quality(state_dict, task),
            "improvement": _improvement_score(state_dict, task),
            "reasoning": _reasoning_quality(state_dict),
            "final": _final_answer_quality(state_dict, task),
            "learning": _trajectory_learning(state_dict),
        },
        "difficulty": task["difficulty"],
    }
