---
title: AI Research Scientist Environment
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---


#  AI Research Scientist Environment

An **OpenEnv-compliant** environment that simulates scientific research workflows for evaluating AI reasoning agents.

Unlike traditional environments that focus on task execution, this environment models the **end-to-end research process** where an agent must read papers, form hypotheses, design experiments, execute them, analyze results, and draw conclusions.

---

##  Overview

The **AI Research Scientist Environment** is an OpenEnv-compliant simulation designed to evaluate **scientific reasoning in AI agents**.

Unlike traditional benchmarks that reward final outputs, this environment evaluates:

* How agents **form hypotheses**
* How they **design and run experiments**
* How they **interpret results**
* How they **improve over time**

👉 This transforms evaluation from *“Did you get the answer?”*
👉 To *“Did you think like a researcher?”*

---


###  This environment solves that

It provides a **controlled simulation of real-world ML research workflows**, enabling evaluation of:

* Research agents
* AutoML systems
* Scientific reasoning in LLMs

---

##  Architecture

```
┌─────────────────────────────────────────────────┐
│              External Agent (LLM/RL)            │
│                                                 │
│   Reads state → Decides action → Sends action   │
└──────────────┬──────────────────┬───────────────┘
               │  POST /step      │ GET /state
               ▼                  ▼
┌─────────────────────────────────────────────────┐
│         FastAPI Server (server/app.py)           │
│                                                 │
│   POST /reset   POST /step   GET /state          │
│   GET /health   GET /tasks   GET /info           │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│          ResearchEnvironment (environment.py)     │
│                                                 │
│   reset() → step(action) → state property        │
│                                                 │
│   ┌─────────┐  ┌──────────┐  ┌─────────────┐   │
│   │  Tasks  │  │ Graders  │  │  Reward Fn  │   │
│   │ tasks.py│  │graders.py│  │ (in env.py) │   │
│   └─────────┘  └──────────┘  └─────────────┘   │
└─────────────────────────────────────────────────┘
```

---

##  Tasks

| Task | Difficulty | Steps | Domain | Challenge |
|------|-----------|-------|--------|-----------|
| `task_easy_image_classification` | 🟢 Easy | 8 | Computer Vision | Clear signal, minimal noise |
| `task_medium_nlp_sentiment` | 🟡 Medium | 12 | NLP | Noisy results, misleading papers |
| `task_hard_tabular_prediction` | 🔴 Hard | 15 | Healthcare ML | Conflicting evidence, budget limit |

---

##  Agent Actions

| Action | Description |
|--------|-------------|
| `read_paper` | Read paper summaries for domain knowledge |
| `propose_hypothesis` | Form an initial hypothesis |
| `design_experiment` | Specify method + dataset combination |
| `run_experiment` | Execute a designed experiment |
| `analyze_results` | Get structured analysis of results |
| `refine_hypothesis` | Update hypothesis based on evidence |
| `final_answer` | Submit conclusion (ends episode) |

---

##  Reward Function

```
reward = f(progress, quality, efficiency, penalties)

Components:
  • Hypothesis quality    → keyword overlap with ground truth
  • Experiment efficiency → diversity, budget adherence, finding optimal
  • Accuracy improvement  → gain relative to optimal possible
  • Reasoning consistency → logical action ordering
  • Final answer quality  → combined keyword + Jaccard similarity
```

**Characteristics:**
- ✅ Dense and incremental (not sparse/binary)
- ✅ Penalizes invalid/redundant actions
- ✅ Rewards information gathering and refinement
- ✅ Difficulty-dependent weight distribution

---

##  Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the inference script (validates everything works)
python inference.py

# Start the server
python -m uvicorn server.app:app --host 0.0.0.0 --port 7860
```

### Docker

```bash
# Build
docker build -t ai-research-scientist .

# Run
docker run -p 7860:7860 ai-research-scientist

# Test health
curl http://localhost:7860/health
```

### API Usage

```python
import requests

BASE = "http://localhost:7860"

# Reset
obs = requests.post(f"{BASE}/reset", json={"task_id": "task_easy_image_classification"}).json()

# Step
obs = requests.post(f"{BASE}/step", json={
    "action_type": "read_paper",
    "content": "all"
}).json()

# State
state = requests.get(f"{BASE}/state").json()
```

---

##  Score Variance

The environment produces meaningful score differences across agent quality:

| Agent | Easy | Medium | Hard | Average |
|-------|------|--------|------|---------|
| **Baseline** (structured) | ~0.45 | ~0.35 | ~0.25 | ~0.35 |
| **Random** (weak) | ~0.10 | ~0.08 | ~0.05 | ~0.08 |
| **LLM** (strong) | ~0.80+ | ~0.70+ | ~0.60+ | ~0.70+ |

---

##  Project Structure

```
├── models.py           # Action, Observation, State dataclasses
├── tasks.py            # Task definitions (easy, medium, hard)
├── graders.py          # Deterministic multi-factor graders
├── environment.py      # Core environment (reset/step/state)
├── inference.py        # Baseline inference script (MANDATORY)
├── server/
│   ├── __init__.py
│   └── app.py          # FastAPI HTTP server
├── openenv.yaml        # OpenEnv manifest
├── Dockerfile          # Container definition
├── requirements.txt    # Python dependencies
├── pyproject.toml      # Package configuration
└── README.md           # This file
```

---

##  Validation Checklist

- [x] `openenv.yaml` present and valid
- [x] `Dockerfile` builds successfully
- [x] `inference.py` runs and prints scores
- [x] ≥ 3 tasks (easy, medium, hard)
- [x] Deterministic graders returning [0.0, 1.0]
- [x] Dense, meaningful reward function
- [x] External agent control via HTTP API
- [x] POST /reset and POST /step endpoints
- [x] GET /state endpoint
- [x] Score variance across agent quality
- [x] Runtime < 20 minutes
- [x] Fits within 2 vCPU, 8GB RAM

---

##  Why This Environment Stands Out

1. **Novel Domain**: Scientific research reasoning — not games, not coding
2. **Multi-step Reasoning**: Agents must plan, experiment, and iterate
3. **Dense Rewards**: Every action gets meaningful feedback
4. **Realistic Simulation**: Models real ML research workflows
5. **Deterministic Grading**: Fair, reproducible evaluation
6. **Score Sensitivity**: Strong agents demonstrably outperform weak ones

---

**Built for evaluating intelligence — not just outputs.**
