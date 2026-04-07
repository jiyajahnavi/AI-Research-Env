"""
AI Research Scientist Environment — Core Environment Logic.

This module implements the Environment class following the OpenEnv spec:
    - reset()  → initializes a new episode, returns initial Observation
    - step(action) → executes an Action, returns Observation
    - state   → property returning current State

The environment simulates a scientific research workflow where an
external agent (LLM or RL policy) must read papers, form hypotheses,
design experiments, execute them, analyze results, and draw conclusions.

All experiment results are computed deterministically from task data
(with optional controlled noise for medium/hard tasks using a seeded RNG).
"""

import hashlib
import random
import uuid
from dataclasses import asdict, field
from typing import Optional

from models import ResearchAction, ResearchObservation, ResearchState
from tasks import get_task, list_task_ids
from graders import grade_episode, grade_task


# Valid action types the agent can submit
VALID_ACTIONS = {
    "read_paper",
    "propose_hypothesis",
    "design_experiment",
    "run_experiment",
    "analyze_results",
    "refine_hypothesis",
    "final_answer",
}


class ResearchEnvironment:
    """
    OpenEnv-compliant environment for AI Research Scientist simulation.

    Usage (direct):
        env = ResearchEnvironment()
        obs = env.reset(task_id="task_easy_image_classification")
        obs = env.step(ResearchAction(action_type="read_paper", content="all"))
        state = env.state
    """

    def __init__(self):
        self._state = ResearchState()
        self._task_config: dict = {}
        self._designed_experiments: dict = {}  # id → spec
        self._experiment_results: dict = {}  # id → results
        self._action_history: list = []
        self._papers_read: set = set()
        self._final_answer: str = ""
        self._rng: random.Random = random.Random(42)
        self._experiment_count: int = 0

    # ═══════════════════════════════════════════════════════════════
    # RESET
    # ═══════════════════════════════════════════════════════════════

    def reset(
        self, task_id: Optional[str] = None, seed: int = 42
    ) -> ResearchObservation:
        """
        Initialize a new episode for the given task.

        Args:
            task_id: ID of the task to load. If None, defaults to easy.
            seed: Random seed for reproducible noise in experiments.

        Returns:
            Initial ResearchObservation with problem context.
        """
        if task_id is None:
            task_id = "task_easy_image_classification"

        self._task_config = get_task(task_id)
        # All randomness routes through self._rng only — never touch global random
        self._rng = random.Random(seed)
        self._designed_experiments = {}
        self._experiment_results = {}
        self._action_history = []
        self._papers_read = set()
        self._final_answer = ""
        self._experiment_count = 0

        episode_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{task_id}-{seed}"))

        self._state = ResearchState(
            episode_id=episode_id,
            step_count=0,
            task_id=task_id,
            task_difficulty=self._task_config["difficulty"],
            problem_statement=self._task_config["problem_statement"],
            paper_summaries=[
                {"paper_id": p["paper_id"], "title": p["title"]}
                for p in self._task_config["paper_summaries"]
            ],
            available_datasets=[
                {"dataset_id": d["dataset_id"], "name": d["name"]}
                for d in self._task_config["available_datasets"]
            ],
            available_methods=[
                {
                    "method_id": m["method_id"],
                    "name": m["name"],
                    "description": m["description"],
                }
                for m in self._task_config["available_methods"]
            ],
            current_hypothesis="",
            experiments_run=[],
            results_history=[],
            best_accuracy=0.0,
            baseline_accuracy=self._task_config["baseline_accuracy"],
            cumulative_reward=0.0,
            current_score=0.0,
            max_steps=self._task_config["max_steps"],
            done=False,
        )

        return ResearchObservation(
            message=(
                f"New research episode started.\n"
                f"Task: {task_id} (difficulty: {self._task_config['difficulty']})\n"
                f"Problem: {self._task_config['problem_statement']}\n"
                f"Baseline accuracy: {self._task_config['baseline_accuracy']}\n"
                f"You have {self._task_config['max_steps']} steps.\n"
                f"Available actions: {sorted(VALID_ACTIONS)}"
            ),
            data={
                "problem_statement": self._task_config["problem_statement"],
                "available_papers": [
                    p["paper_id"] for p in self._task_config["paper_summaries"]
                ],
                "available_datasets": [
                    d["dataset_id"] for d in self._task_config["available_datasets"]
                ],
                "available_methods": [
                    m["method_id"] for m in self._task_config["available_methods"]
                ],
                "baseline_accuracy": self._task_config["baseline_accuracy"],
                "max_steps": self._task_config["max_steps"],
            },
            reward=0.0,
            done=False,
            score=0.0,
            step_number=0,
            available_actions=sorted(VALID_ACTIONS),
        )

    # ═══════════════════════════════════════════════════════════════
    # STEP
    # ═══════════════════════════════════════════════════════════════

    def step(self, action: ResearchAction) -> ResearchObservation:
        """
        Execute one research action and return the observation.

        Dense reward shaping:
            reward = progress_signal + quality_bonus - penalties

        Args:
            action: ResearchAction with action_type and content.

        Returns:
            ResearchObservation with results, reward, and done flag.
        """
        if not self._task_config:
            self.reset()
            
        if self._state.done:
            return ResearchObservation(
                message="Episode already finished. Call reset() to start a new one.",
                reward=0.0,
                done=True,
                score=self._state.current_score,
                step_number=self._state.step_count,
            )

        # Validate action type
        if action.action_type not in VALID_ACTIONS:
            penalty = -0.10
            self._state.cumulative_reward += penalty
            self._state.step_count += 1
            self._action_history.append(
                {
                    "action_type": action.action_type,
                    "content": action.content,
                    "valid": False,
                }
            )
            return self._make_observation(
                message=f"Invalid action '{action.action_type}'. "
                f"Valid actions: {sorted(VALID_ACTIONS)}",
                reward=penalty,
            )

        # Record action
        self._action_history.append(
            {
                "action_type": action.action_type,
                "content": action.content,
                "valid": True,
            }
        )

        self._state.step_count += 1

        # Dispatch to handler
        handler = {
            "read_paper": self._handle_read_paper,
            "propose_hypothesis": self._handle_propose_hypothesis,
            "design_experiment": self._handle_design_experiment,
            "run_experiment": self._handle_run_experiment,
            "analyze_results": self._handle_analyze_results,
            "refine_hypothesis": self._handle_refine_hypothesis,
            "final_answer": self._handle_final_answer,
        }

        obs = handler[action.action_type](action.content)

        # Penalize repeated actions
        if len(self._action_history) >= 2:
            if self._action_history[-1]["action_type"] == self._action_history[-2]["action_type"]:
                obs.reward -= 0.03
                self._state.cumulative_reward -= 0.03
                obs.message += "\n[Penalty: Repeated action type: -0.03]"

        # Check episode termination
        if self._state.step_count >= self._state.max_steps and not self._state.done:
            self._state.done = True
            obs.done = True
            if action.action_type != "final_answer":
                penalty = -0.2
                obs.reward += penalty
                self._state.cumulative_reward += penalty
                obs.message += f"\n[Episode terminated: max steps reached without final_answer. Penalty: {penalty}]"

        # Update running score
        state_dict = self._get_state_dict_for_grading()
        self._state.current_score = grade_episode(state_dict)
        obs.score = self._state.current_score

        return obs

    # ═══════════════════════════════════════════════════════════════
    # STATE property
    # ═══════════════════════════════════════════════════════════════

    @property
    def state(self) -> ResearchState:
        """Return the current episode state."""
        return self._state

    # ═══════════════════════════════════════════════════════════════
    # ACTION HANDLERS
    # ═══════════════════════════════════════════════════════════════

    def _handle_read_paper(self, content: str) -> ResearchObservation:
        """Read a paper summary. Provides domain knowledge to the agent."""
        papers = self._task_config["paper_summaries"]

        if content.lower() == "all":
            # Read all papers
            result_papers = papers
            self._papers_read.update(p["paper_id"] for p in papers)
        else:
            # Read specific paper
            result_papers = [p for p in papers if p["paper_id"] == content]
            if not result_papers:
                return self._make_observation(
                    message=f"Paper '{content}' not found. Available: "
                    f"{[p['paper_id'] for p in papers]}",
                    reward=-0.02,
                )
            self._papers_read.add(content)

        # Reward: small positive for reading papers (information gathering)
        already_read = len(self._papers_read)
        reward = 0.05 * len(result_papers)

        # Penalty for re-reading all papers
        if content.lower() == "all" and already_read == len(papers):
            reward = 0.01  # diminished returns

        self._state.cumulative_reward += reward

        return self._make_observation(
            message="Papers read successfully.",
            reward=reward,
            data={
                "papers": [
                    {
                        "paper_id": p["paper_id"],
                        "title": p["title"],
                        "summary": p["summary"],
                        "key_finding": p["key_finding"],
                    }
                    for p in result_papers
                ]
            },
        )

    def _simple_text_quality(self, text: str) -> float:
        words = set(text.lower().split())
        return min(len(words) / 20.0, 1.0)

    def _handle_propose_hypothesis(self, content: str) -> ResearchObservation:
        """Agent proposes a hypothesis based on their understanding."""
        if not content.strip():
            return self._make_observation(
                message="Hypothesis cannot be empty.",
                reward=-0.03,
            )

        self._state.current_hypothesis = content

        quality = self._simple_text_quality(content)

        papers_bonus = 0.05 if self._papers_read else 0.0

        reward = 0.05 + 0.20 * quality + papers_bonus
        self._state.cumulative_reward += reward

        return self._make_observation(
            message=f"Hypothesis recorded. Estimated quality: {quality:.2f}",
            reward=reward,
            data={
                "hypothesis": content,
                "quality_estimate": quality,
            },
        )

    def _handle_design_experiment(self, content: str) -> ResearchObservation:
        """Agent designs an experiment by specifying method + dataset."""
        # Parse content — expect "method_id:dataset_id" or JSON-like
        parts = content.replace(",", ":").replace(" ", "").split(":")
        if len(parts) < 2:
            return self._make_observation(
                message="Experiment design must specify 'method_id:dataset_id'. "
                f"Available methods: {[m['method_id'] for m in self._task_config['available_methods']]}. "
                f"Available datasets: {[d['dataset_id'] for d in self._task_config['available_datasets']]}.",
                reward=-0.02,
            )

        method_id, dataset_id = parts[0], parts[1]

        # Validate method
        valid_methods = {m["method_id"] for m in self._task_config["available_methods"]}
        if method_id not in valid_methods:
            return self._make_observation(
                message=f"Unknown method '{method_id}'. Available: {sorted(valid_methods)}",
                reward=-0.02,
            )

        # Validate dataset
        valid_datasets = {
            d["dataset_id"] for d in self._task_config["available_datasets"]
        }
        if dataset_id not in valid_datasets:
            return self._make_observation(
                message=f"Unknown dataset '{dataset_id}'. Available: {sorted(valid_datasets)}",
                reward=-0.02,
            )

        # Create experiment
        exp_id = f"exp_{self._experiment_count}"
        self._experiment_count += 1
        self._designed_experiments[exp_id] = {
            "experiment_id": exp_id,
            "method_id": method_id,
            "dataset_id": dataset_id,
            "status": "designed",
        }

        reward = 0.03
        self._state.cumulative_reward += reward

        return self._make_observation(
            message=f"Experiment '{exp_id}' designed: {method_id} on {dataset_id}. "
            f"Use 'run_experiment' with '{exp_id}' to execute.",
            reward=reward,
            data={
                "experiment_id": exp_id,
                "exp_id": exp_id,
                "method_id": method_id,
                "dataset_id": dataset_id,
            },
        )

    def _handle_run_experiment(self, content: str) -> ResearchObservation:
        """Execute a designed experiment and return results."""
        exp_id = content.strip()

        if exp_id not in self._designed_experiments:
            return self._make_observation(
                message=f"Experiment '{exp_id}' not found. "
                f"Available: {list(self._designed_experiments.keys())}. "
                f"Design an experiment first.",
                reward=-0.02,
            )

        exp = self._designed_experiments[exp_id]

        # Check experiment budget (hard tasks)
        budget = self._task_config.get("experiment_budget", float("inf"))
        run_experiments = [
            e for e in self._state.experiments_run if e.get("status") == "completed"
        ]
        if len(run_experiments) >= budget:
            return self._make_observation(
                message=f"Experiment budget exhausted ({budget} experiments allowed). "
                f"Use analyze_results or final_answer.",
                reward=-0.05,
            )

        # Already run?
        if exp.get("status") == "completed":
            return self._make_observation(
                message=f"Experiment '{exp_id}' already completed. "
                f"Design a new experiment or analyze results.",
                reward=-0.01,
            )

        # Compute result deterministically
        method_config = None
        for m in self._task_config["available_methods"]:
            if m["method_id"] == exp["method_id"]:
                method_config = m
                break

        if method_config is None:
            return self._make_observation(
                message="Internal error: method not found.",
                reward=0.0,
            )

        base_acc = method_config["expected_accuracy"].get(exp["dataset_id"], 0.5)

        # Add controlled, symmetric noise — scaled by difficulty
        difficulty = self._task_config.get("difficulty", "easy")
        if difficulty == "hard":
            noise = self._rng.uniform(-0.015, 0.025)
        elif difficulty == "medium":
            noise = self._rng.uniform(-0.010, 0.020)
        else:
            noise = self._rng.uniform(-0.005, 0.015)
            
        accuracy = max(0.0, min(1.0, base_acc + noise))
        accuracy = round(accuracy, 4)

        # Reward logic heavily favors improvement, penalizes re-runs
        if any(r["method_id"] == exp["method_id"] and r["dataset_id"] == exp["dataset_id"] for r in self._state.experiments_run):
            # Penalty for exact duplicate experiment
            reward = -0.05
            message = "Penalty: Exact duplicate experiment run."
        else:
            improvement = accuracy - self._state.baseline_accuracy
            if accuracy > self._state.best_accuracy:
                self._state.best_accuracy = accuracy
                reward = 0.02 + min(0.3, max(0.0, improvement))
                message = "Experiment successful. New best accuracy achieved!"
            else:
                reward = -0.01  # small penalty for no improvement
                message = "Experiment failed to improve over standard/best accuracy."

        # Store results
        result = {
            "experiment_id": exp_id,
            "method_id": exp["method_id"],
            "dataset_id": exp["dataset_id"],
            "accuracy": accuracy,
            "status": "completed",
        }
        exp["status"] = "completed"
        exp["accuracy"] = accuracy
        self._experiment_results[exp_id] = result
        self._state.experiments_run.append(result)
        self._state.results_history.append(result)
        
        self._state.cumulative_reward += reward

        return self._make_observation(
            message=f"Experiment '{exp_id}' completed.\n"
            f"Method: {exp['method_id']}, Dataset: {exp['dataset_id']}\n"
            f"Accuracy: {accuracy:.4f} \n"
            f"{message}",
            reward=reward,
            data=result,
        )

    def _handle_analyze_results(self, content: str) -> ResearchObservation:
        """Analyze experiment results. Provides structured summary."""
        if not self._state.experiments_run:
            return self._make_observation(
                message="No experiments have been run yet. "
                "Design and run experiments first.",
                reward=-0.02,
            )

        # Build analysis summary
        results = self._state.experiments_run
        best = max(results, key=lambda r: r["accuracy"])
        worst = min(results, key=lambda r: r["accuracy"])

        # Method comparison
        method_accs = {}
        for r in results:
            mid = r["method_id"]
            if mid not in method_accs:
                method_accs[mid] = []
            method_accs[mid].append(r["accuracy"])

        method_avg = {m: sum(accs) / len(accs) for m, accs in method_accs.items()}

        analysis = {
            "total_experiments": len(results),
            "best_result": best,
            "worst_result": worst,
            "method_averages": method_avg,
            "best_accuracy": self._state.best_accuracy,
            "improvement_over_baseline": round(
                self._state.best_accuracy - self._state.baseline_accuracy, 4
            ),
        }

        trend_bonus = 0.0
        if len(self._state.experiments_run) >= 2:
            last = self._state.experiments_run[-1]["accuracy"]
            prev = self._state.experiments_run[-2]["accuracy"]
            if last > prev:
                trend_bonus = 0.05

        reward = 0.05 + trend_bonus
        self._state.cumulative_reward += reward

        return self._make_observation(
            message=(
                f"Analysis complete.\n"
                f"Best: {best['method_id']} on {best['dataset_id']} → "
                f"{best['accuracy']:.4f}\n"
                f"Improvement over baseline: "
                f"{self._state.best_accuracy - self._state.baseline_accuracy:+.4f}\n"
                f"Method averages: {method_avg}"
            ),
            reward=reward,
            data=analysis,
        )

    def _handle_refine_hypothesis(self, content: str) -> ResearchObservation:
        """Refine the current hypothesis based on evidence."""
        if not content.strip():
            return self._make_observation(
                message="Refined hypothesis cannot be empty.",
                reward=-0.03,
            )

        old_hypothesis = self._state.current_hypothesis
        self._state.current_hypothesis = content

        # Check quality improvement
        old_quality = self._simple_text_quality(old_hypothesis)
        new_quality = self._simple_text_quality(content)

        quality_delta = new_quality - old_quality

        # Reward: base + bonus for improvement
        reward = 0.03 + 0.10 * max(quality_delta, 0)
        if quality_delta < 0:
            reward -= 0.02  # small penalty for worse hypothesis

        self._state.cumulative_reward += reward

        return self._make_observation(
            message=(
                f"Hypothesis refined.\n"
                f"Quality change: {old_quality:.2f} → {new_quality:.2f} "
                f"({quality_delta:+.2f})"
            ),
            reward=reward,
            data={
                "refined_hypothesis": content,
                "quality": new_quality,
                "quality_delta": quality_delta,
            },
        )

    def _handle_final_answer(self, content: str) -> ResearchObservation:
        """Submit final answer and conclude the episode."""
        if not content.strip():
            return self._make_observation(
                message="Final answer cannot be empty.",
                reward=-0.05,
            )

        self._final_answer = content
        self._state.done = True

        # Final grading
        state_dict = self._get_state_dict_for_grading()
        final_score = grade_episode(state_dict)
        self._state.current_score = final_score

        # Reward: based on best accuracy tracking and decision
        accuracy_gain = self._state.best_accuracy - self._state.baseline_accuracy
        reward = 0.10 + 0.50 * final_score
        
        if len(self._state.experiments_run) == 0:
             reward -= 0.1 # Penalty for guessing without experiments
             
        self._state.cumulative_reward += reward

        grading_detail = grade_task(state_dict)

        return self._make_observation(
            message=(
                f"Episode complete!\n"
                f"Final Score: {final_score:.4f}\n"
                f"Final Decision Outcome: {self._state.best_accuracy:.4f}\n"
                f"Cumulative Reward: {self._state.cumulative_reward:.4f}\n"
                f"Grading breakdown: {grading_detail['components']}"
            ),
            reward=reward,
            data={
                "final_score": final_score,
                "grading_breakdown": grading_detail["components"],
                "cumulative_reward": self._state.cumulative_reward,
            },
        )

    # ═══════════════════════════════════════════════════════════════
    # HELPERS
    # ═══════════════════════════════════════════════════════════════

    def _make_observation(
        self,
        message: str,
        reward: float,
        data: Optional[dict] = None,
    ) -> ResearchObservation:
        """Build a ResearchObservation with common fields populated."""
        return ResearchObservation(
            message=message,
            data=data or {},
            reward=reward,
            done=self._state.done,
            score=self._state.current_score,
            step_number=self._state.step_count,
            available_actions=sorted(VALID_ACTIONS),
        )

    def _get_state_dict_for_grading(self) -> dict:
        """Build the state dict that graders expect."""
        return {
            "task_id": self._state.task_id,
            "current_hypothesis": self._state.current_hypothesis,
            "experiments_run": self._state.experiments_run,
            "best_accuracy": self._state.best_accuracy,
            "action_history": self._action_history,
            "final_answer": self._final_answer,
            "step_count": self._state.step_count,
        }

    def get_full_state_dict(self) -> dict:
        """Return full state as dict (for API serialization)."""
        d = asdict(self._state)
        d["action_history"] = self._action_history
        d["final_answer"] = self._final_answer
        return d
