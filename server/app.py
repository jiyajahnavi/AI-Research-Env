"""
FastAPI server exposing the AI Research Scientist Environment
via HTTP endpoints following the OpenEnv specification.

Endpoints:
    POST /reset          — Start a new episode
    POST /step           — Execute an action
    GET  /state          — Get current state
    GET  /health         — Health check
    GET  /tasks          — List available tasks
    GET  /info           — Environment metadata
"""

import os
import time
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from environment import ResearchEnvironment
from models import ResearchAction
from tasks import list_task_ids, TASKS



# ═══════════════════════════════════════════════════════════════
# Pydantic request / response models for the HTTP API
# ═══════════════════════════════════════════════════════════════

class ResetRequest(BaseModel):
    task_id: Optional[str] = Field(
        None,
        description="Task ID to start. If not provided, defaults to easy task.",
    )
    seed: int = Field(42, description="Random seed for reproducibility.")


class ActionRequest(BaseModel):
    action_type: str = Field(
        ...,
        description="Type of action. One of: read_paper, propose_hypothesis, "
                    "design_experiment, run_experiment, analyze_results, "
                    "refine_hypothesis, final_answer",
    )
    content: str = Field(
        "",
        description="Action content. Interpretation depends on action_type.",
    )


class ObservationResponse(BaseModel):
    message: str
    data: dict = {}
    reward: float = 0.0
    done: bool = False
    score: float = 0.0
    step_number: int = 0
    available_actions: list = []


class StateResponse(BaseModel):
    episode_id: str = ""
    step_count: int = 0
    task_id: str = ""
    task_difficulty: str = ""
    problem_statement: str = ""
    current_hypothesis: str = ""
    best_accuracy: float = 0.0
    baseline_accuracy: float = 0.0
    cumulative_reward: float = 0.0
    current_score: float = 0.0
    max_steps: int = 0
    done: bool = False
    experiments_run: list = []
    results_history: list = []
    action_history: list = []


class TaskInfo(BaseModel):
    task_id: str
    difficulty: str
    max_steps: int
    problem_statement: str


# ═══════════════════════════════════════════════════════════════
# APP & ENVIRONMENT
# ═══════════════════════════════════════════════════════════════

app = FastAPI(
    title="AI Research Scientist Environment",
    description=(
        "An OpenEnv-compliant environment simulating scientific research "
        "workflows. External agents interact via reset/step/state to "
        "read papers, form hypotheses, design and run experiments, "
        "analyze results, and draw conclusions."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "AI Research Scientist Environment API",
        "docs": "/docs",
        "health": "/health",
        "tasks": "/tasks"
    }

# Single environment instance (stateful per session)
env = ResearchEnvironment()
_start_time = time.time()


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "uptime_seconds": round(time.time() - _start_time, 1),
        "environment": "ai-research-scientist",
    }


@app.get("/info")
async def info():
    """Return environment metadata."""
    return {
        "name": "ai-research-scientist",
        "version": "1.0.0",
        "description": (
            "AI Research Scientist Environment — simulate scientific "
            "research workflows for evaluating AI reasoning agents."
        ),
        "tasks": list_task_ids(),
        "task_count": len(list_task_ids()),
        "valid_actions": [
            "read_paper", "propose_hypothesis", "design_experiment",
            "run_experiment", "analyze_results", "refine_hypothesis",
            "final_answer",
        ],
    }


@app.get("/tasks")
async def get_tasks():
    """List all available tasks with metadata."""
    tasks = []
    for tid in list_task_ids():
        t = TASKS[tid]
        tasks.append(TaskInfo(
            task_id=tid,
            difficulty=t["difficulty"],
            max_steps=t["max_steps"],
            problem_statement=t["problem_statement"],
        ))
    return {"tasks": [t.model_dump() for t in tasks]}


@app.post("/reset", response_model=ObservationResponse)
async def reset(req: ResetRequest):
    """
    Reset the environment and start a new episode.

    If task_id is not provided, defaults to the easy task.
    """
    try:
        obs = env.reset(task_id=req.task_id, seed=req.seed)
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown task_id: {req.task_id}. "
                   f"Available: {list_task_ids()}",
        )
    return ObservationResponse(
        message=obs.message,
        data=obs.data,
        reward=obs.reward,
        done=obs.done,
        score=obs.score,
        step_number=obs.step_number,
        available_actions=obs.available_actions,
    )


@app.post("/step", response_model=ObservationResponse)
async def step(req: ActionRequest):
    """
    Execute one action in the environment.

    The agent sends an action_type and content string.
    The environment returns an observation with reward and done flag.
    """
    action = ResearchAction(
        action_type=req.action_type,
        content=req.content,
    )
    obs = env.step(action)
    return ObservationResponse(
        message=obs.message,
        data=obs.data,
        reward=obs.reward,
        done=obs.done,
        score=obs.score,
        step_number=obs.step_number,
        available_actions=obs.available_actions,
    )


@app.get("/state", response_model=StateResponse)
async def get_state():
    """
    Return the current episode state.

    Provides full observability for the agent to make informed decisions.
    """
    full = env.get_full_state_dict()
    return StateResponse(
        episode_id=full.get("episode_id", ""),
        step_count=full.get("step_count", 0),
        task_id=full.get("task_id", ""),
        task_difficulty=full.get("task_difficulty", ""),
        problem_statement=full.get("problem_statement", ""),
        current_hypothesis=full.get("current_hypothesis", ""),
        best_accuracy=full.get("best_accuracy", 0.0),
        baseline_accuracy=full.get("baseline_accuracy", 0.0),
        cumulative_reward=full.get("cumulative_reward", 0.0),
        current_score=full.get("current_score", 0.0),
        max_steps=full.get("max_steps", 0),
        done=full.get("done", False),
        experiments_run=full.get("experiments_run", []),
        results_history=full.get("results_history", []),
        action_history=full.get("action_history", []),
    )


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
