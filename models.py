"""
Typed models for the AI Research Scientist Environment.

Defines Action, Observation, and State dataclasses following
the OpenEnv specification. Self-contained — no dependency on
the openenv package at runtime (compatible but not required).
"""

from dataclasses import dataclass, field


# ═══════════════════════════════════════════════════════════════════════
# ACTION — what the external agent sends to the environment each step
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class ResearchAction:
    """
    A single action an agent can take inside the research environment.

    action_type must be one of:
        read_paper | propose_hypothesis | design_experiment |
        run_experiment | analyze_results | refine_hypothesis |
        final_answer

    content is a free-form string whose meaning depends on action_type:
        - read_paper        → paper_id or "all"
        - propose_hypothesis→ hypothesis text
        - design_experiment → "method_id:dataset_id"
        - run_experiment    → experiment_id (returned by design_experiment)
        - analyze_results   → experiment_id or "latest"
        - refine_hypothesis → refined hypothesis text
        - final_answer      → conclusion text
    """
    action_type: str = ""
    content: str = ""


# ═══════════════════════════════════════════════════════════════════════
# OBSERVATION — what the environment sends back after each step
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class ResearchObservation:
    """Observation returned to the agent after each step."""

    message: str = ""                               # human-readable feedback
    data: dict = field(default_factory=dict)         # structured payload
    reward: float = 0.0                              # step reward
    done: bool = False                               # episode finished?
    score: float = 0.0                               # running grader score [0-1]
    step_number: int = 0                             # current step number
    available_actions: list = field(default_factory=list)


# ═══════════════════════════════════════════════════════════════════════
# STATE — full episode metadata accessible via state()
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class ResearchState:
    """Full observable state of the episode."""

    episode_id: str = ""
    step_count: int = 0
    task_id: str = ""
    task_difficulty: str = ""               # easy | medium | hard

    # Research context
    problem_statement: str = ""
    paper_summaries: list = field(default_factory=list)
    available_datasets: list = field(default_factory=list)
    available_methods: list = field(default_factory=list)

    # Agent progress
    current_hypothesis: str = ""
    experiments_run: list = field(default_factory=list)
    results_history: list = field(default_factory=list)
    best_accuracy: float = 0.0
    baseline_accuracy: float = 0.0

    # Scoring
    cumulative_reward: float = 0.0
    current_score: float = 0.0
    max_steps: int = 10
    done: bool = False
