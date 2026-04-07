---
title: AI Research Dashboard
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: python
sdk_version: "0.2.4"
python_version: "3.11"
app_file: app.py
pinned: false
---

<div align="center">
<pre>
 █████╗ ██╗    ██████╗ ███████╗███████╗███████╗  █████╗  ██████╗  ██████╗██╗  ██╗
██╔══██╗██║    ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║  ██║
███████║██║    ██████╔╝█████╗  ███████╗█████╗   ███████║██████╔╝██║      ███████║
██╔══██║██║    ██╔══██╗██╔══╝  ╚════██║██╔══╝   ██╔══██║██╔══██╗██║      ██╔══██║
██║  ██║██║    ██║   ██║███████╗███████║███████╗██║   ██║██║  ██║╚██████╗██║  ██║
╚═╝  ╚═╝╚═╝    ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
</pre>

<pre>
███████╗███╗   ██╗██╗   ██╗
██╔════╝████╗  ██║██║   ██║
█████╗  ██╔██╗ ██║██║   ██║
██╔══╝  ██║╚██╗██║╚██╗ ██╔╝
███████╗██║ ╚████║ ╚████╔╝ 
╚══════╝╚═╝  ╚═══╝  ╚═══╝  
</pre>


AI research environment that simulates the end-to-end scientific discovery process, enabling agents to analyze papers, generate hypotheses, design experiments, and validate results collaboratively

<br/>

![OpenEnv](https://img.shields.io/badge/OpenEnv-Compatible-brightgreen?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Spaces-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-red?style=for-the-badge)

<br/>
</div>

- **Space URL**: https://huggingface.co/spaces/jiyajahnavi/MultiAgent-MarketingENV

- **API Docs**: https://jiyajahnavi-multiagent-marketingenv.hf.space/docs

---

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Run](#run)
- [The Simulation Loop Architecture](#the-simulation-loop-architecture)
- [Tasks & Graders](#tasks--graders)
- [Agent Actions](#agent-actions)
- [Reward Function](#reward-function)
- [Training Pipeline](#training-pipeline)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [License](#license)
- [Author](#author)
- [Hackathon](#hackathon)

---

## Architecture

The system transitions traditional MDP benchmarks into a **Full-Stack Serverless Application** composed of a stunning React dashboard and a robust Python backend leveraging FastAPI.

```text
┌────────────────────────────────────────────────────────┐
│                   Web User Interface                  │
│       React + Vite + Zustand + Recharts + Tailwind    │
│   (User drives Auto-Pilot or manual execution)        │
└──────────────┬────────────────────────────┬────────────┘
               │ HTTP POST /api/agent       │ HTTP POST /step
               ▼                            ▼
┌────────────────────────────────────────────────────────┐
│               FastAPI Backend (server/app.py)          │
│                                                        │
│   ┌────────────────┐         ┌─────────────────────┐   │
│   │ HF Serverless  │         │ ResearchEnvironment │   │
│   │ Inference API  │         │ (environment.py)    │   │
│   └───────┬────────┘         └─────────┬───────────┘   │
└───────────┼────────────────────────────┼───────────────┘
            │ Qwen2.5-72B-Instruct       │ Graders & 
            │ LLM Inference API          │ Tasks
            ▼                            ▼
```

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Hugging Face Account** with an Access Token (`HF_TOKEN`)

## Installation

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd dashboard
npm install
```

## Run

### Local Development

Start the Backend Server (FastAPI):
```bash
python -m uvicorn server.app:app --host 0.0.0.0 --port 7860
```

Start the Frontend Server (Vite):
```bash
cd dashboard
npm run dev
```

### Production Build (Hugging Face Spaces)
The project is built to rely on a native Dockerfile for HF Spaces.
```bash
# Build the React UI internally
cd dashboard && npm run build && cd ..

# The Docker build natively serves the static dist folder
docker build -t ai-research-environment .
docker run -p 7860:7860 ai-research-environment
```

---

## The Simulation Loop Architecture

```mermaid
graph TD
    A[RL/LLM Agent] -->|Selects Next Action| B(OpenEnv API Layer)
    B --> C{Research Environment}
    C -->|Executes Task Step| D[State Update]
    D --> E[Agent Activity Log]
    E --> F[Reward Grader]
    F -->|Calculates Reward & Updates History| G[History Tab & Charts]
    G -->|Returns Observation & Reward| A
```

---

## Tasks & Graders

The environment ships with deterministic, multi-factor graders evaluating the agent against predefined structured tasks evaluating logic consistency.

| Task | Difficulty | Steps | Domain | Challenge |
|------|-----------|-------|--------|-----------|
| `image_classification` | 🟢 Easy | 8 | Computer Vision | Clear signal, minimal noise |
| `nlp_sentiment` | 🟡 Medium | 12 | NLP | Noisy results, misleading papers |
| `tabular_prediction` | 🔴 Hard | 15 | Healthcare ML | Conflicting evidence, budget limit |

---

## Reward Function

The reward function enforces strict alignment with the scientific method using a **dense, continuous weighted evaluation system** instead of sparse binary signals. Each component is independently scored in `graders.py` and combined via a difficulty-scaled weighted sum.

### Final Reward Formula

```python
# graders.py — grade_episode()
score = w[0]*h + w[1]*e + w[2]*i + w[3]*r + w[4]*f + w[5]*t

# No final_answer submitted → score penalized by 40%
if not state_dict.get("final_answer"):
    score *= 0.6
```

### Difficulty-Scaled Weights (Real Values)

```python
# graders.py — weights dict (h, e, i, r, f, t)
weights = {
    "easy":   (0.25, 0.15, 0.30, 0.10, 0.10, 0.10),
    "medium": (0.20, 0.20, 0.25, 0.10, 0.15, 0.10),
    "hard":   (0.15, 0.25, 0.20, 0.10, 0.20, 0.10),
}
# Order: hypothesis · experiment · improvement · reasoning · final_answer · trajectory
```

### Component Breakdown (Source: `graders.py`)

| # | Component | Easy | Medium | Hard | Scoring Formula |
|---|-----------|:----:|:------:|:----:|-----------------|
| `h` | **Hypothesis Quality** | `0.25` | `0.20` | `0.15` | Keyword overlap between `current_hypothesis` and task `ground_truth_keywords` |
| `e` | **Experiment Quality** | `0.15` | `0.20` | `0.25` | `0.6 × diversity + 0.4 × found_optimal − 0.2 × repetition_penalty` |
| `i` | **Improvement Score** | `0.30` | `0.25` | `0.20` | `(best_accuracy − baseline) / (optimal − baseline)`, capped at `1.0` |
| `r` | **Reasoning Quality** | `0.10` | `0.10` | `0.10` | Sequence score: `read→hypothesis (+0.3)`, `design→run (+0.3)`, `analyze (+0.2)`, `refine (+0.2)` |
| `f` | **Final Answer Quality** | `0.10` | `0.15` | `0.20` | `0.5 × keyword_overlap + 0.5 × Jaccard_similarity` vs ground truth |
| `t` | **Trajectory Learning** | `0.10` | `0.10` | `0.10` | Fraction of consecutive experiments showing accuracy improvement |

### Step-Level Reward Signals (Source: `environment.py`)

| Action | Reward Signal | Notes |
|--------|:-------------:|-------|
| `read_paper` | `+0.05 × n_papers` | Diminished to `+0.01` on redundant re-read |
| `propose_hypothesis` | `+0.05 + 0.20 × quality + 0.05 bonus` | Bonus if papers were read first |
| `design_experiment` | `+0.03` | Per valid `method_id:dataset_id` design |
| `run_experiment` (new best) | `+0.02 + min(0.30, improvement)` | `improvement = accuracy − baseline` |
| `run_experiment` (no improvement) | `−0.01` | Fails to beat current best |
| `run_experiment` (duplicate) | `−0.05` | Exact same method+dataset combo |
| `analyze_results` | `+0.05 + 0.05 trend_bonus` | Trend bonus if last > previous accuracy |
| `refine_hypothesis` | `+0.03 + 0.10 × quality_delta` | `−0.02` if quality regresses |
| `final_answer` | `+0.10 + 0.50 × final_score` | `−0.10` if no experiments were run |
| **Repeated action type** | `−0.03` | Applied on any consecutive duplicate action type |
| **Invalid action** | `−0.10` | Unknown `action_type` submitted |
| **Max steps without `final_answer`** | `−0.20` | Episode forcibly terminated |


**Characteristics:**
-  Dense and incremental (not sparse/binary)
-  Penalizes invalid/redundant actions
-  Rewards information gathering and refinement
-  Difficulty-dependent weight distribution

---

## Agent Actions

Agents have a predefined set of tools to mimic real-world machine learning research workflows:

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

## Training Pipeline

This environment operates seamlessly inside Reinforcement Learning workflows. Because the step API is fully `OpenENV` compliant, it maps fluently to standard `gym.Env` wrappers. You can construct continuous PPO loops taking the JSON output, calculating the cumulative `score`, and performing back-propagation on policy networks without writing any new logic.

---

## Project Structure

```text
├── models.py           # Action, Observation, State dataclasses
├── tasks.py            # Task definitions (easy, medium, hard)
├── graders.py          # Deterministic multi-factor graders
├── environment.py      # Core environment (reset/step/state loop)
├── inference.py        # Baseline automated execution logic
├── server/
│   ├── __init__.py
│   └── app.py          # FastAPI HTTP Serverless integration
├── dashboard/          # React + Vite UI
│   ├── src/
│   │   ├── components/ 
│   │   ├── store/      # Zustand state management
│   │   ├── hooks/      
│   │   └── types/      # Front-end Typings
│   ├── index.html 
│   └── package.json
├── openenv.yaml        # OpenEnv manifest
├── Dockerfile          # Container definition
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

---

## Configuration

For proper LLM proxy execution, the Hugging Face server must be provided a token. Add the following to your Space's repository secrets, or to a `.env` in local development:

```env
HF_TOKEN=hf_xxxxxxxxxxxxxxxxx
```

---

## License

This project is licensed under the **[MIT License](LICENSE)**.

## Author

Created by **Team One Way**.
| Name                  | Role               |
|-----------------------|--------------------|
| Jiya Jahnavi          | Co-Developer       |
| Aditya Kumar Singh    | Lead Developer     |
| Rishabh Yadav         | Co-Developer       |

## Hackathon

Developed for the **Meta Python OpenENV Hackathon 2026**.