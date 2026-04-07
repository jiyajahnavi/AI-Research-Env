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
from fastapi.staticfiles import StaticFiles
import os
import time
from typing import Optional
from fastapi import Request

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
async def reset(request: Request):
    """
    Reset the environment and start a new episode.

    MUST support:
    - Empty body (validator)
    - JSON body (normal usage)
    """
    try:
        # Safely parse body (handles empty request)
        try:
            body = await request.json()
        except Exception:
            body = {}

        task_id = body.get("task_id", None)
        seed = body.get("seed", 42)

        obs = env.reset(task_id=task_id, seed=seed)

    except KeyError:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown task_id: {task_id}. Available: {list_task_ids()}",
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


import json
from huggingface_hub import InferenceClient

hf_token = os.environ.get("HF_TOKEN")
# We initialize the client if the token exists. Otherwise we can initialize without it, but HF spaces injects it natively.
hf_client = InferenceClient(model="Qwen/Qwen2.5-72B-Instruct", token=hf_token)

class AgentRequest(BaseModel):
    prompt: str

@app.post("/api/agent")
async def run_agent(req: AgentRequest):
    """
    Secure backend proxy for LLM execution via Hugging Face Inference API.
    Injects HF_TOKEN from environment securely.
    """
    try:
        response = hf_client.chat_completion(
            messages=[{"role": "user", "content": req.prompt}],
            max_tokens=300,
            temperature=0.4
        )
        content = response.choices[0].message.content
        return {"text": content}
    except Exception as e:
        print("HF API Failure:", e)
        raise HTTPException(status_code=500, detail=str(e))

import os
_current_dir = os.path.dirname(os.path.abspath(__file__))
_static_dir = os.path.join(os.path.dirname(_current_dir), "dashboard", "dist")

if os.path.exists(_static_dir):
    print(f"[*] Serving static files from: {_static_dir}")
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="ui")
else:
    print(f"[!] Warning: static files directory not found at {_static_dir}")

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)