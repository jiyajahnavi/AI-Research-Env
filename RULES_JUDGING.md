# 🏆 Hackathon Rules & Judging Criteria

---

# 📜 Eligibility & Rules

## Team Rules

* **Team Size**: 1–4 members per team
* **Submission**: Single GitHub repository + Hugging Face Space URL
* **Ownership**: All work must be original and created during the hackathon

---

## Code Submission Requirements

* Repository must be **public**
* Must include:

  * `README.md` (clear explanation of environment)
  * `openenv.yaml`
  * `Dockerfile`
  * `inference.py` (MANDATORY)
* Must deploy successfully on **Hugging Face Spaces**
* Must run within:

  * **≤ 20 minutes runtime**
  * **2 vCPU, 8GB RAM constraint**

---

## Functional Requirements

Your submission MUST:

* Simulate a **real-world task** (NOT games or toy problems)
* Implement full **OpenEnv spec**:

  * `reset()`
  * `step(action)`
  * `state()`
* Use **typed models** (Action, Observation, Reward)
* Include **≥ 3 tasks**:

  * Easy → Medium → Hard
* Provide **deterministic graders**:

  * Score range: **0.0 → 1.0**
* Implement a **meaningful reward function**:

  * Must provide **partial progress signals**
* Include a **baseline inference script**:

  * Must produce **reproducible scores**

---

## Non-Functional Requirements

* Must deploy as a **Hugging Face Space**
* Must include a working **Dockerfile**
* Must pass:

  ```bash
  openenv validate
  ```
* Must expose working endpoints:

  * `/reset`
  * `/step`

---

## Allowed

* External libraries (NumPy, PyTorch, etc.)
* Pre-trained models
* Open source tools
* LLM APIs (via OpenAI client)

---

## Not Allowed

* Plagiarism or copied environments
* Trivial modifications of existing environments
* Hardcoded grading logic
* Constant reward outputs
* Missing inference script
* Environments that fail to deploy or respond

---

# ⚖️ Evaluation Criteria

## Scoring Breakdown (Total: 100%)

### 1. Real-World Utility (30%)

* Does the environment model a **genuine real-world task**?
* Would this be useful for training or evaluating agents?

| Score Range | Interpretation         |
| ----------- | ---------------------- |
| 0–5         | Toy / unrealistic      |
| 6–15        | Valid idea but shallow |
| 16–25       | Good practical value   |
| 26–30       | Excellent, high-impact |

---

### 2. Task & Grader Quality (25%)

* Minimum **3 tasks** with increasing difficulty
* Clear objectives for each task
* Graders:

  * Deterministic
  * Non-constant
  * Produce scores in `[0.0, 1.0]`
* Hard tasks must challenge strong agents

---

### 3. Environment Design (20%)

* Clean state transitions (`reset → step → state`)
* Well-defined action and observation spaces
* Reward function:

  * Dense and meaningful
  * Encourages progress
* Proper episode termination

---

### 4. Code Quality & Spec Compliance (15%)

* Passes `openenv validate`
* Docker builds successfully
* HF Space deploys and responds
* `inference.py` runs without errors
* Clean, modular, documented code

---

### 5. Creativity & Novelty (10%)

* Unique problem domain
* Interesting mechanics
* Innovative reward design
* Not a standard or overused environment

---

# ⚙️ Judging Process

---

## Phase 1 — Automated Validation (Pass/Fail)

Submissions must pass ALL:

* HF Space responds to `/reset`
* Docker builds successfully
* OpenEnv validation passes
* `inference.py` executes successfully
* ≥ 3 tasks with graders
* Scores are within `[0.0, 1.0]`

❌ Failure in any step → **Disqualification**

---

## Phase 2 — Agentic Evaluation

* Baseline agent is executed
* External LLM agent (e.g., Nemotron) is evaluated

### Evaluation checks:

* Score differences across agents (**variance required**)
* Reward signal correctness
* Task difficulty progression
* Agent learning behavior across steps

---

## Phase 3 — Human Review

Top submissions are reviewed by Meta & Hugging Face engineers based on:

* Real-world applicability
* Creativity and innovation
* Robustness (cannot be easily exploited)
* Overall design quality

---

# 🚫 Disqualification Criteria

Projects will be disqualified if:

* Environment does not deploy or respond
* Missing `inference.py`
* Graders always return same score
* Plagiarized or copied work
* Broken Docker or API
* No meaningful reward function
* Runtime exceeds limits

---

# 📦 Submission Checklist

Before submitting, ensure:

* ✅ HF Space is live and responding
* ✅ `openenv validate` passes
* ✅ Docker builds and runs
* ✅ `inference.py` runs successfully
* ✅ All tasks return valid scores
* ✅ Runtime < 20 minutes

---

# 🏁 Final Note

This hackathon is not about building a UI or product.

It is about building a **high-quality evaluation environment** where:

* Agents can interact
* Performance can be measured
* Intelligence can be tested

---

**Focus on environment quality → not presentation.**
